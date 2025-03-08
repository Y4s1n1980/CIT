// server/index.js
require('dotenv').config();
const express = require('express');
const nodemailer = require("nodemailer");
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { bucket, db } = require('./firebaseAdmin'); // Firebase Admin
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());


app.post("/send-email", async (req, res) => {
    const { recipient, sender, message } = req.body;

    if (!recipient || !sender || !message) {
        return res.status(400).json({ error: "Faltan datos en la solicitud." });
    }

    // Configuración del transportador de correo
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.ADMIN_NOTIFICATION_EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.ADMIN_NOTIFICATION_EMAIL,
        to: recipient,
        subject: "Nuevo mensaje en el chat",
        text: `Has recibido un nuevo mensaje de ${sender}:\n\n"${message}"`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Correo enviado con éxito" });
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        res.status(500).json({ error: "Error al enviar el correo" });
    }
});

// Crear directorio `uploads` si no existe
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configuración de Multer (Memoria para imágenes, Disco para otros archivos)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Máx. 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'audio/mpeg', 'video/mp4'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Tipo de archivo no permitido.'));
        }
        cb(null, true);
    }
});

// **Subida de imágenes con optimización**
app.post('/upload-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen.' });

        const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        // Comprimir imagen antes de subir
        const compressedBuffer = await sharp(req.file.buffer)
            .resize({ width: 1024 })
            .jpeg({ quality: 80 })
            .toBuffer();

        await file.save(compressedBuffer, { metadata: { contentType: req.file.mimetype } });
        await file.makePublic();
        res.status(200).json({ fileUrl: `https://storage.googleapis.com/${bucket.name}/${fileName}` });
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// **Subida de documentos y archivos sin compresión**
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo.' });

        const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        await file.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
        await file.makePublic();
        res.status(200).json({ fileUrl: `https://storage.googleapis.com/${bucket.name}/${fileName}` });
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// **Endpoint: Crear PaymentIntent para donaciones**
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
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

// **Endpoint: Guardar donaciones en Firestore**
app.post('/donations', async (req, res) => {
    try {
        const { donante_nombre, donante_email, monto, fecha_donacion } = req.body;
        if (!donante_nombre || !donante_email || !monto || !fecha_donacion) {
            return res.status(400).json({ error: 'Faltan datos requeridos.' });
        }
        const docRef = await db.collection('donations').add({
            donante_nombre, donante_email, monto,
            fecha_donacion: new Date(fecha_donacion),
            createdAt: new Date(),
        });
        res.status(200).json({ message: 'Donación registrada con éxito.', id: docRef.id });
    } catch (error) {
        console.error('Error al guardar la donación:', error);
        res.status(500).json({ error: 'Error al guardar los datos.' });
    }
});

// Servir imágenes y archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build', 'index.html')));

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
