// server/index.js
require('dotenv').config(); 

console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { bucket, db } = require('./firebaseAdmin'); // Firebase Admin
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe SDK



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Cambiar si el frontend está en otro dominio
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

// **ENDPOINT: Crear PaymentIntent para donaciones**
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body; // Monto enviado desde el frontend
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convertir monto a centavos
            currency: 'usd', // Cambiar si se necesita otra moneda
            automatic_payment_methods: { enabled: true },
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error al crear PaymentIntent:', error);
        res.status(500).json({ error: 'Error al procesar el pago.' });
    }
});

// Crear directorio `uploads` si no existe
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
    console.log('Carpeta "uploads" creada.');
}

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        // Imágenes
        'image/jpeg': 5 * 1024 * 1024, // 5 MB
        'image/png': 5 * 1024 * 1024,
        'image/webp': 5 * 1024 * 1024,
        'image/gif': 5 * 1024 * 1024,
        'image/bmp': 5 * 1024 * 1024,
        'image/tiff': 5 * 1024 * 1024,
        // Audio
        'audio/mpeg': 10 * 1024 * 1024, // 10 MB
        'audio/ogg': 10 * 1024 * 1024,
        'audio/wav': 10 * 1024 * 1024,
        // Video
        'video/mp4': 50 * 1024 * 1024, // 50 MB
        'video/webm': 50 * 1024 * 1024,
        'video/ogg': 50 * 1024 * 1024,
        // Documentos
        'application/pdf': 10 * 1024 * 1024, // 10 MB
        'application/msword': 5 * 1024 * 1024, // 5 MB
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 5 * 1024 * 1024,
        'application/vnd.ms-excel': 5 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 5 * 1024 * 1024,
    };

    // Verificar si el tipo de archivo está permitido
    if (!allowedTypes[file.mimetype]) {
        console.error('Intento de subir archivo no permitido:', file.mimetype);
        return cb(new Error('Tipo de archivo no permitido.'));
    }

    // Verificar si el tamaño del archivo es válido
    if (file.size > allowedTypes[file.mimetype]) {
        console.error(`Archivo demasiado grande. Límite para ${file.mimetype}: ${allowedTypes[file.mimetype] / (1024 * 1024)} MB.`);
        return cb(new Error(`Archivo demasiado grande. Límite: ${allowedTypes[file.mimetype] / (1024 * 1024)} MB.`));
    }

    cb(null, true); // Archivo permitido
};

const upload = multer({ storage, fileFilter });
const uploadFields = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'imagen', maxCount: 1 }]);

module.exports = { upload, uploadFields };




// **ENDPOINT: Guardar datos de donación en Firestore**
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

// Endpoint específico para subir noticias
app.post('/upload-news', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }

        // Subir el archivo al bucket
        const file = req.file;
        const fileDestination = `noticias/${file.filename}`; // Ruta específica para las noticias
        const [uploadedFile] = await bucket.upload(file.path, {
            destination: fileDestination,
            metadata: { cacheControl: 'public, max-age=31536000' },
        });
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileDestination}`; // URL para guardar en `imagenUrl`

        // Eliminar archivo local temporal
        fs.unlinkSync(file.path);

        // Datos enviados desde el frontend
        const { titulo, descripcion, contenidoCompleto, estado, autorNombre, autorEmail } = req.body;

        // Validar los datos obligatorios
        if (!titulo || !descripcion || !contenidoCompleto) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        // Crear el documento en Firestore
        const documento = {
            titulo,
            descripcion,
            contenidoCompleto,
            estado: estado === 'true', // Convertir a booleano
            autorNombre: autorNombre || 'Autor desconocido',
            autorEmail: autorEmail || 'Email desconocido',
            imagenUrl: imageUrl, // Guardar URL de la imagen en `imagenUrl`
            fechaCreacion: new Date(),
        };

        const noticiasRef = db.collection('noticias');
        const docRef = await noticiasRef.add(documento);

        // Enviar respuesta al cliente
        res.status(200).json({
            message: 'Noticia subida y guardada con éxito.',
            docId: docRef.id,
            imagenUrl: imageUrl,
        });
    } catch (error) {
        console.error('Error al subir la noticia:', error);
        res.status(500).json({ error: 'Error interno del servidor al subir la noticia.' });
    }
});




// Endpoint general para subir multimedia al bucket de Google Cloud
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }

        // Subir el archivo al bucket
        const file = req.file;
        const fileDestination = `uploads/${file.filename}`; 
        const [uploadedFile] = await bucket.upload(file.path, {
            destination: fileDestination,
            metadata: { cacheControl: 'public, max-age=31536000' },
        });
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileDestination}`; // URL del archivo subido

        // Eliminar archivo local temporal
        fs.unlinkSync(file.path);

        // Enviar respuesta al cliente con la URL del archivo subido
        res.status(200).json({
            message: 'Archivo subido con éxito.',
            fileUrl,
        });
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor al subir el archivo.' });
    }
});


// Endpoint específico para subir cursos
app.post('/upload-course', upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen.' });
        }

        // Subir el archivo al bucket
        const file = req.file;
        const fileDestination = `cursos/${file.filename}`; // Ruta específica para los cursos
        const [uploadedFile] = await bucket.upload(file.path, {
            destination: fileDestination,
            metadata: { cacheControl: 'public, max-age=31536000' },
        });

        // Generar la URL pública del archivo subido
        const imagenUrl = `https://storage.googleapis.com/${bucket.name}/${fileDestination}`;

        // Eliminar archivo local temporal
        try {
            fs.unlinkSync(file.path);
        } catch (unlinkError) {
            console.error('Error al eliminar archivo temporal:', unlinkError);
        }  

        // Datos enviados desde el frontend
        const { titulo, descripcion } = req.body;

        // Validar los datos obligatorios
        if (!titulo || !descripcion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        // Crear el documento en Firestore
        const cursoData = {
            titulo,
            descripcion,
            autorNombre,
            autorEmail,
            estado: true,
            imagenUrl: imagenUrl, 
            fechaCreacion: new Date(),
        };

        const cursosRef = db.collection('cursos');
        const docRef = await cursosRef.add(cursoData);

        // Enviar respuesta al cliente
        res.status(200).json({
            message: 'Curso subido y guardado con éxito.',
            docId: docRef.id,
            imagenUrl: imagenUrl,
        });
    } catch (error) {
        console.error('Error al subir el curso:', error);
        res.status(500).json({ error: 'Error interno del servidor al subir el curso.' });
    }
});



// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build', 'index.html')));

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
