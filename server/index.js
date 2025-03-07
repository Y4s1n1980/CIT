// server/index.js
require('dotenv').config();
<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require("sharp");
const { bucket, db } = require('./firebaseAdmin'); // Firebase Admin
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe SDK
=======
console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('./firebaseAdmin'); // Se sigue usando Firestore para almacenar datos
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cloudinary = require('./cloudinaryConfig'); // Usamos la configuración de Cloudinary
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:3000', 
    'https://tu-dominio.com', 
    'https://subdominio.tu-dominio.com'
];

app.use(cors({
<<<<<<< HEAD
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No autorizado por CORS'));
        }
    },
=======
    origin: 'http://localhost:3000', // Cambia según donde esté alojado tu frontend
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());

<<<<<<< HEAD
// 📌 **Configuración de Multer (Almacenamiento en memoria)**
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // Límite 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp',
            'audio/mpeg', 'audio/ogg', 'audio/wav',
            'video/mp4', 'video/webm', 'video/ogg',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Tipo de archivo no permitido.'));
        }
        cb(null, true);
    }
});

// 📌 **Subida de archivos a Firebase Storage**
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se subió ningún archivo." });
        }

        console.log("Archivo recibido:", req.file.originalname);
        const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        const stream = file.createWriteStream({
            metadata: { contentType: req.file.mimetype },
        });

        stream.on("error", (err) => {
            console.error("Error al subir el archivo:", err);
            return res.status(500).json({ error: "Error al subir el archivo." });
        });

        stream.on("finish", async () => {
            await file.makePublic();
            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            console.log("Archivo subido correctamente:", fileUrl);
            res.status(200).json({ fileUrl });
        });

        stream.end(req.file.buffer);
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// 📌 **Subida de imágenes con compresión**
app.post("/upload-image", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se subió ninguna imagen." });
        }

        console.log("Imagen recibida:", req.file.originalname);
        const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        // 📌 Comprimir imagen antes de subir
        const compressedBuffer = await sharp(req.file.buffer)
            .resize({ width: 1024 })
            .jpeg({ quality: 80 })
            .toBuffer();

        const stream = file.createWriteStream({
            metadata: { contentType: req.file.mimetype },
        });

        stream.on("error", (err) => {
            console.error("Error al subir la imagen:", err);
            return res.status(500).json({ error: "Error al subir la imagen." });
        });

        stream.on("finish", async () => {
            await file.makePublic();
            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            console.log("Imagen subida correctamente:", fileUrl);
            res.status(200).json({ fileUrl });
        });

        stream.end(compressedBuffer);
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// 📌 **Crear PaymentIntent con Stripe**
=======
// Endpoint: Crear PaymentIntent para donaciones
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
<<<<<<< HEAD
            amount: Math.round(amount * 100),
=======
            amount: Math.round(amount * 100), // Se convierte el monto a centavos
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error al crear PaymentIntent:', error);
        res.status(500).json({ error: 'Error al procesar el pago.' });
    }
});

<<<<<<< HEAD
// 📌 **Guardar donaciones en Firestore**
=======
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
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
app.post('/donations', async (req, res) => {
    const { donante_nombre, donante_email, monto, fecha_donacion, estado, referencia_transaccion, comentarios } = req.body;

    if (!donante_nombre || !donante_email || !monto || !fecha_donacion) {
        return res.status(400).json({ error: 'Faltan datos requeridos para registrar la donación.' });
    }

    try {
        const docRef = await db.collection('donations').add({
            donante_nombre, donante_email, monto,
            fecha_donacion: new Date(fecha_donacion),
            estado, referencia_transaccion, comentarios,
            createdAt: new Date(),
        });

        res.status(200).json({ message: 'Donación registrada con éxito.', id: docRef.id });
    } catch (error) {
        console.error('Error al guardar la donación:', error);
        res.status(500).json({ error: 'Error al guardar los datos.' });
    }
});

<<<<<<< HEAD
// 📌 **Subir noticias con imagen**
=======
// Endpoint: Subir noticias usando Cloudinary
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
app.post('/upload-news', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }

<<<<<<< HEAD
        const fileName = `noticias/${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        const compressedBuffer = await sharp(req.file.buffer)
            .resize({ width: 1024 })
            .jpeg({ quality: 80 })
            .toBuffer();

        await file.save(compressedBuffer, { metadata: { contentType: req.file.mimetype } });
        await file.makePublic();

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
=======
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
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
        const { titulo, descripcion, contenidoCompleto, estado, autorNombre, autorEmail } = req.body;

        if (!titulo || !descripcion || !contenidoCompleto) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

<<<<<<< HEAD
        const docRef = await db.collection('noticias').add({
            titulo, descripcion, contenidoCompleto,
            estado: estado === 'true',
            autorNombre: autorNombre || 'Autor desconocido',
            autorEmail: autorEmail || 'Email desconocido',
=======
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
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
            imagenUrl: imageUrl,
            fechaCreacion: new Date(),
        });

        res.status(200).json({ message: 'Noticia subida con éxito.', docId: docRef.id, imagenUrl });
    } catch (error) {
<<<<<<< HEAD
        console.error('Error al subir la noticia:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 📌 **Subir cursos con imagen**
=======
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
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
app.post('/upload-course', upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen.' });
        }

<<<<<<< HEAD
        const fileName = `cursos/${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        // 📌 Comprimir la imagen antes de subir
        const compressedBuffer = await sharp(req.file.buffer)
            .resize({ width: 1024 })
            .jpeg({ quality: 80 })
            .toBuffer();

        await file.save(compressedBuffer, { metadata: { contentType: req.file.mimetype } });
        await file.makePublic();

        const imagenUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        const { titulo, descripcion, autorNombre, autorEmail } = req.body;

        if (!titulo || !descripcion || !autorNombre || !autorEmail) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        const docRef = await db.collection('cursos').add({
            titulo, descripcion, autorNombre, autorEmail,
            estado: true, imagenUrl, fechaCreacion: new Date(),
=======
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
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
        });

        res.status(200).json({ message: 'Curso subido con éxito.', docId: docRef.id, imagenUrl });
    } catch (error) {
<<<<<<< HEAD
        console.error('Error al subir el curso:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 📌 **Subir imágenes de la junta directiva**
app.post('/upload/junta', upload.single('file'), async (req, res) => {
=======
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
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen.' });
        }

<<<<<<< HEAD
        const fileName = `junta/${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        // 📌 Comprimir imagen antes de subir
        const compressedBuffer = await sharp(req.file.buffer)
            .resize({ width: 1024 })
            .jpeg({ quality: 80 })
            .toBuffer();

        await file.save(compressedBuffer, { metadata: { contentType: req.file.mimetype } });
        await file.makePublic();

        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error('Error al subir la imagen de la junta:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 📌 **Iniciar el servidor**
=======
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
>>>>>>> f17463815d0d478e74207fbb87caf253dd52f261
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
