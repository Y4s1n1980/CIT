// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require("sharp");
const { bucket, db } = require('./firebaseAdmin'); // Firebase Admin
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe SDK

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:3000', 
    'https://tu-dominio.com', 
    'https://subdominio.tu-dominio.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No autorizado por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());

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

// 📌 **Guardar donaciones en Firestore**
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

// 📌 **Subir noticias con imagen**
app.post('/upload-news', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }

        const fileName = `noticias/${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        const compressedBuffer = await sharp(req.file.buffer)
            .resize({ width: 1024 })
            .jpeg({ quality: 80 })
            .toBuffer();

        await file.save(compressedBuffer, { metadata: { contentType: req.file.mimetype } });
        await file.makePublic();

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        const { titulo, descripcion, contenidoCompleto, estado, autorNombre, autorEmail } = req.body;

        if (!titulo || !descripcion || !contenidoCompleto) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        const docRef = await db.collection('noticias').add({
            titulo, descripcion, contenidoCompleto,
            estado: estado === 'true',
            autorNombre: autorNombre || 'Autor desconocido',
            autorEmail: autorEmail || 'Email desconocido',
            imagenUrl: imageUrl,
            fechaCreacion: new Date(),
        });

        res.status(200).json({ message: 'Noticia subida con éxito.', docId: docRef.id, imagenUrl });
    } catch (error) {
        console.error('Error al subir la noticia:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 📌 **Subir cursos con imagen**
app.post('/upload-course', upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen.' });
        }

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
        });

        res.status(200).json({ message: 'Curso subido con éxito.', docId: docRef.id, imagenUrl });
    } catch (error) {
        console.error('Error al subir el curso:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 📌 **Subir imágenes de la junta directiva**
app.post('/upload/junta', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen.' });
        }

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
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
