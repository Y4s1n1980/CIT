// server/index.js
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const validateRequiredEnvVars = require('../tools/validateEnvVars');

// Validación global de variables sensibles
validateRequiredEnvVars([
  'STRIPE_SECRET_KEY',
  'EMAILJS_USER_ID',
  'BASE_URL',
  'FIREBASE_SERVICE_ACCOUNT'
]);

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️ Advertencia: STRIPE_SECRET_KEY no está definida, modo pagos deshabilitado.");
  }

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const { bucket, db } = require('./firebaseAdmin');
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5000;

console.log("✅ Firebase Admin inicializado correctamente");
console.log("🌍 Bucket configurado:", process.env.FIREBASE_STORAGE_BUCKET);
console.log("🔍 Variables de entorno cargadas:", process.env.FIREBASE_STORAGE_BUCKET);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Demasiadas solicitudes desde esta IP, por favor intenta más tarde."
});
app.use(limiter);

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://www.comunidadislamicatordera.org';

app.use(cors({
  origin: [
    BASE_URL,
    'https://www.comunidadislamicatordera.org'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'multipart/form-data'],
  credentials: true,
}));

app.use(express.json());

// crear pago stripe
app.post('/create-payment-intent', async (req, res) => {
  if (!process.env.PAYMENTS_ENABLED || process.env.PAYMENTS_ENABLED !== 'true') {
    return res.status(503).json({ error: 'Los pagos están desactivados temporalmente.' });
  }

  if (!stripe) {
    return res.status(503).json({ error: 'Stripe no está configurado en este entorno.' });
  }

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

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Carpeta "uploads" creada.');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'audio/mpeg', 'audio/wav'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Formato de archivo no permitido.'));
    }
    cb(null, true);
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }
    const fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.post('/upload-news', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }
    const fileUrl = `${process.env.BASE_URL || `http://localhost:${PORT}`}/uploads/${req.file.filename}`;
    const {
      coleccionDestino,
      titulo,
      descripcion,
      contenidoCompleto,
      autorNombre,
      autorEmail
    } = req.body;
    const estado = req.body.estado === 'true';

    const noticiaData = {
      titulo,
      descripcion,
      contenidoCompleto,
      estado,
      imagenUrl: fileUrl,
      fechaCreacion: new Date(),
      autorNombre,
      autorEmail
    };

    const docRef = await db.collection(coleccionDestino).add(noticiaData);
    res.status(200).json({ docId: docRef.id, imagenUrl: fileUrl });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.post('/donations', async (req, res) => {
  const {
    donante_nombre,
    donante_email,
    monto,
    fecha_donacion,
    estado,
    referencia_transaccion,
    comentarios
  } = req.body;

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

app.post('/upload-course', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }
    const fileUrl = `${process.env.BASE_URL || `http://localhost:${PORT}`}/uploads/${req.file.filename}`;
    const {
      titulo,
      descripcion,
      autorNombre,
      autorEmail
    } = req.body;

    const courseData = {
      titulo,
      descripcion,
      imagenUrl: fileUrl,
      autorNombre,
      autorEmail,
      fechaCreacion: new Date(),
      estado: true
    };

    const docRef = await db.collection('cursos').add(courseData);
    res.status(200).json({ docId: docRef.id, imagenUrl: fileUrl });
  } catch (error) {
    console.error('Error al subir curso:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build', 'index.html')));

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://www.comunidadislamicatordera.org"],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });

  socket.on('mensaje', (data) => {
    console.log('Mensaje recibido:', data);
    io.emit('mensaje', data);
  });
});

module.exports = { app, io };
