// server/index.js
require('dotenv').config();
console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('./firebaseAdmin'); // Se sigue usando Firestore para almacenar datos
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cloudinary = require('./cloudinaryConfig'); // Usamos la configuración de Cloudinary

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Cambia según donde esté alojado tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

// Endpoint: Crear PaymentIntent para donaciones
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Se convierte el monto a centavos
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error al crear PaymentIntent:', error);
        res.status(500).json({ error: 'Error al procesar el pago.' });
    }
});

// Configuración de multer para almacenar archivos de forma temporal
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'image/jpeg': 5 * 1024 * 1024,
        'image/png': 5 * 1024 * 1024,
        'image/webp': 5 * 1024 * 1024,
        'image/gif': 5 * 1024 * 1024,
        'image/bmp': 5 * 1024 * 1024,
        'image/tiff': 5 * 1024 * 1024,
        'audio/mpeg': 10 * 1024 * 1024,
        'audio/ogg': 10 * 1024 * 1024,
        'audio/wav': 10 * 1024 * 1024,
        'video/mp4': 50 * 1024 * 1024,
        'video/webm': 50 * 1024 * 1024,
        'video/ogg': 50 * 1024 * 1024,
        'application/pdf': 10 * 1024 * 1024,
        'application/msword': 5 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 5 * 1024 * 1024,
        'application/vnd.ms-excel': 5 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 5 * 1024 * 1024,
    };

    if (!allowedTypes[file.mimetype]) {
        console.error('Intento de subir archivo no permitido:', file.mimetype);
        return cb(new Error('Tipo de archivo no permitido.'));
    }

    if (file.size > allowedTypes[file.mimetype]) {
        console.error(`Archivo demasiado grande. Límite para ${file.mimetype}: ${allowedTypes[file.mimetype] / (1024 * 1024)} MB.`);
        return cb(new Error(`Archivo demasiado grande. Límite: ${allowedTypes[file.mimetype] / (1024 * 1024)} MB.`));
    }

    cb(null, true);
};

const upload = multer({ storage, fileFilter });
const uploadFields = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'imagen', maxCount: 1 }]);

// Endpoint: Guardar datos de donación en Firestore (sin cambios)
app.post('/donations', async (req, res) => {
    const { donante_nombre, donante_email, monto, fecha_donacion, estado, referencia_transaccion, comentarios } = req.body;

    if (!donante_nombre || !donante_email || !monto || !fecha_donacion) {
        return res.status(400).json({ error: 'Faltan datos requeridos para registrar la donación.' });
    }

    try {
        const donationRef = db.collection('donations');
        const newDoc = {
            donante_nombre,
            donante_email,
            monto,
            fecha_donacion: new Date(fecha_donacion),
            estado,
            referencia_transaccion,
            comentarios,
            createdAt: new Date(),
        };

        const docRef = await donationRef.add(newDoc);
        res.status(200).json({ message: 'Donación registrada con éxito.', id: docRef.id });
    } catch (error) {
        console.error('Error al guardar la donación en Firestore:', error);
        res.status(500).json({ error: 'Error al guardar los datos de la donación.' });
    }
});

// Endpoint: Subir noticias usando Cloudinary
app.post('/upload-news', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }

        // Subir el archivo a Cloudinary
        const file = req.file;
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'noticias',
            transformation: { quality: "auto", fetch_format: "auto" },
        });
        const imageUrl = result.secure_url;

        // Eliminar archivo temporal
        fs.unlinkSync(file.path);

        // Recoger datos del frontend
        const { titulo, descripcion, contenidoCompleto, estado, autorNombre, autorEmail } = req.body;

        if (!titulo || !descripcion || !contenidoCompleto) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        const documento = {
            titulo,
            descripcion,
            contenidoCompleto,
            estado: estado === 'true',
            autorNombre: autorNombre || 'Autor desconocido',
            autorEmail: autorEmail || 'Email desconocido',
            imagenUrl: imageUrl,
            fechaCreacion: new Date(),
        };

        const noticiasRef = db.collection('noticias');
        const docRef = await noticiasRef.add(documento);

        res.status(200).json({
            message: 'Noticia subida y guardada con éxito.',
            docId: docRef.id,
            imagenUrl: imageUrl,
        });
    } catch (error) {
        console.error('Error al subir la noticia a Cloudinary:', error);
        res.status(500).json({ error: 'Error interno del servidor al subir la noticia.' });
    }
});

// Endpoint: Subida general de archivos usando Cloudinary
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }

        const file = req.file;
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'uploads',
            transformation: { quality: "auto", fetch_format: "auto" },
        });
        const fileUrl = result.secure_url;

        fs.unlinkSync(file.path);

        res.status(200).json({
            message: 'Archivo subido con éxito.',
            fileUrl,
        });
    } catch (error) {
        console.error('Error al subir el archivo a Cloudinary:', error);
        res.status(500).json({ error: 'Error interno del servidor al subir el archivo.' });
    }
});

// Endpoint: Subir cursos usando Cloudinary
app.post('/upload-course', upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen.' });
        }

        const file = req.file;
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'cursos',
            transformation: { quality: "auto", fetch_format: "auto" },
        });
        const imagenUrl = result.secure_url;

        fs.unlinkSync(file.path);

        const { titulo, descripcion, autorNombre, autorEmail } = req.body;

        if (!titulo || !descripcion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        const cursoData = {
            titulo,
            descripcion,
            autorNombre: autorNombre || 'Autor desconocido',
            autorEmail: autorEmail || 'Email desconocido',
            estado: true,
            imagenUrl: imagenUrl,
            fechaCreacion: new Date(),
        };

        const cursosRef = db.collection('cursos');
        const docRef = await cursosRef.add(cursoData);

        res.status(200).json({
            message: 'Curso subido y guardado con éxito.',
            docId: docRef.id,
            imagenUrl: imagenUrl,
        });
    } catch (error) {
        console.error('Error al subir el curso a Cloudinary:', error);
        res.status(500).json({ error: 'Error interno del servidor al subir el curso.' });
    }
});

// Endpoint: Subir imágenes de la junta usando Cloudinary
app.post('/upload/junta', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se subió ningún archivo." });
        }

        const file = req.file;
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'junta',
            transformation: { quality: "auto", fetch_format: "auto" },
        });
        const fileUrl = result.secure_url;

        fs.unlinkSync(file.path);

        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error('Error al subir la imagen de la junta a Cloudinary:', error);
        res.status(500).json({ error: 'Error interno del servidor al subir la imagen de la junta.' });
    }
});

// Endpoint: Subir imágenes (general) usando Cloudinary
app.post('/upload-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        const file = req.file;
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'images',
            transformation: { quality: "auto", fetch_format: "auto" },
        });
        const imageUrl = result.secure_url;

        fs.unlinkSync(file.path);

        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error al subir la imagen a Cloudinary:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Servir archivos estáticos para el frontend
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build', 'index.html')));

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
