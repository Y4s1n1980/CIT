// server/index.js
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const validateRequiredEnvVars = require('../tools/validateEnvVars');
const { bucket, db } = require('./firebaseAdmin');
const { Timestamp } = require('firebase-admin/firestore');
const { Server } = require('socket.io');

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


const app = express();
app.set('trust proxy', 1); // Confía en el primer proxy (Render)

app.options('*', cors()); 
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://www.comunidadislamicatordera.org',
    'https://cit-frontend-a660.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(express.json());



const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.BASE_URL
  : `http://localhost:${PORT}`;


console.log("✅ Firebase Admin inicializado correctamente");
console.log("🌍 Bucket configurado:", process.env.FIREBASE_STORAGE_BUCKET);
console.log("🔍 Variables de entorno cargadas:", process.env.FIREBASE_STORAGE_BUCKET);


app.use(express.json());

// Anti spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Carpeta de subida
const uploadDir = '/mnt/disks/media-storage/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Carpeta de subida creada:", uploadDir);
}


// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const allowedTypes = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'audio/mpeg', 'audio/wav',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-rar-compressed',
  'text/plain', 'application/pdf' // AÑADE PDF si lo necesitas
];


const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("🧪 Tipo de archivo recibido:", file.mimetype);

    if (!allowedTypes.includes(file.mimetype)) {
      console.warn("❌ Tipo de archivo no permitido:", file.mimetype);
      return cb(new Error('Formato de archivo no permitido.'));
    }

    cb(null, true);
  }
});

// Subida multimedia
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log("➡️ Upload recibido");

    if (!req.file) {
      console.warn("⚠️ No se recibió archivo");
      return res.status(400).json({ error: 'No se subio ningún archivo' });
    }

    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    console.log("✅ Archivo guardado:", fileUrl);

    res.status(200).json({ fileUrl });
  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
});

app.post('/upload-blog', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl });
  } catch (error) {
    console.error('Error al subir imagen del blog:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


//endponit temporal de prueba 
app.get('/test-disk', (req, res) => {
  const testPath = '/mnt/disks/media-storage/uploads/test.txt';
  fs.writeFile(testPath, '¡Hola desde Render con disco persistente!', (err) => {
    if (err) {
      console.error('Error al escribir en disco:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
    res.json({ ok: true, message: 'Archivo escrito correctamente en disco persistente.' });
  });
});


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


app.post('/upload-news', upload.single('file'), async (req, res) => {
  try {
    console.log("📥 Recibido en /upload-news");

    if (!req.file) {
      console.warn("⚠️ No se recibió ningún archivo");
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }

    console.log("✅ Archivo recibido:", req.file.originalname);

    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    console.log("🖼️ URL generada:", fileUrl);

    const {
      coleccionDestino,
      titulo,
      descripcion,
      contenidoCompleto,
      autorNombre,
      autorEmail
    } = req.body;

    console.log("📝 Datos del formulario:", req.body);

    const estado = req.body.estado === 'true' || req.body.estado === true;

    const noticiaData = {
      titulo,
      descripcion,
      contenidoCompleto,
      estado,
      imagenUrl: fileUrl,
      fechaCreacion: Timestamp.now(),
      autorNombre,
      autorEmail
    };

    const docRef = await db.collection(coleccionDestino).add(noticiaData);
    console.log("✅ Noticia guardada en Firestore con ID:", docRef.id);

    res.status(200).json({ docId: docRef.id, imagenUrl: fileUrl });
  } catch (error) {
    console.error('❌ Error en /upload-news:', error);
    res.status(500).json({ error: 'Error interno del servidor.', detalle: error.message });
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
    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
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

app.get('/admin/run-fix-urls', async (req, res) => {
    const SECRET_KEY = process.env.ADMIN_FIX_KEY;
    if (req.query.key !== SECRET_KEY) {
      return res.status(403).send("🚫 Acceso no autorizado.");
    }
  
    try {
      const { fixFirestoreUrls } = require('../scripts/updateImageUrls');
      await fixFirestoreUrls();
      res.send("✅ URLs actualizadas correctamente.");
    } catch (err) {
      console.error(err);
      res.status(500).send("❌ Error al actualizar URLs.");
    }
  });

  if (process.env.RUN_FIX === 'true') {
    setTimeout(async () => {
      const { fixFirestoreUrls } = require('../scripts/updateImageUrls');
      await fixFirestoreUrls();
      console.log("🔥 Script de actualización ejecutado.");
    }, 3000);
  }
  
  

  app.get('/ping', (_, res) => res.send('pong'));

    const staticUploadsPath = path.join(__dirname, 'uploads');
    const sourceUploads = '/mnt/disks/media-storage/uploads';

// Crear enlace simbólico si no existe
  if (!fs.existsSync(staticUploadsPath)) {
    fs.symlinkSync(sourceUploads, staticUploadsPath, 'dir');
    console.log("🔗 Enlace simbólico creado: /uploads -> /mnt/disks/media-storage/uploads");
  }


  app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build', 'index.html')));
  
  app.use((err, req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    console.error('❌ Error global:', err);
    res.status(err.status || 500).json({ error: err.message });
  });
  
  const server = app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  
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
  