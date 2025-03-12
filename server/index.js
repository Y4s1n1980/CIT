// server/index.js
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { bucket, db } = require('./firebaseAdmin'); // Firebase Admin

const app = express();
const PORT = process.env.PORT || 5000;
console.log("🔍 Variables de entorno cargadas:", process.env.FIREBASE_STORAGE_BUCKET);
const rateLimit = require("express-rate-limit");

// Aplicar rate limiting a todas las rutas
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP
    message: "Demasiadas solicitudes desde esta IP, por favor intenta más tarde."
  });
  
  app.use(limiter);

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
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), 
            currency: 'usd', 
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
const upload = multer({ storage });

// **ENDPOINT: Subir archivos**
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }
        
        const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error('Error al subir archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// **ENDPOINT: Guardar datos de noticias en Firestore**
app.post('/upload-news', upload.single('file'), async (req, res) => {
    try {
        const { titulo, descripcion, contenidoCompleto, estado, autorNombre, autorEmail } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Archivo de imagen no proporcionado.' });
        }

        // Subir archivo a Firebase Storage
        const storagePath = `noticias/${Date.now()}_${req.file.filename}`;
        await bucket.upload(req.file.path, { destination: storagePath });

        const imagenUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${storagePath}`;

        // Guardar datos en Firestore
        const docRef = await db.collection('noticias').add({
            titulo,
            descripcion,
            contenidoCompleto,
            estado: estado === 'true', // convertir a boolean
            autorNombre,
            autorEmail,
            imagenUrl,
            fechaCreacion: new Date(),
        });

        // Eliminar el archivo local tras subirlo
        fs.unlinkSync(req.file.path);

        res.status(200).json({ docId: docRef.id, imagenUrl });
    } catch (error) {
        console.error('Error al subir noticia:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


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

// Servir archivos estáticos y frontend en producción
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build', 'index.html')));

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
