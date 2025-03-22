const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const LOG_DIR = path.join(__dirname, "../logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");
const MAX_LOG_SIZE = 1024 * 1024; // 1MB
const serviceAccountPath = path.join(__dirname, "../config/serviceAccountKey.json");

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  console.log(formatted);

  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_LOG_SIZE) {
      fs.renameSync(LOG_FILE, `${LOG_FILE}.bak`);
    }
    fs.appendFileSync(LOG_FILE, formatted + "\n");
  } catch {}

  if (process.env.NODE_ENV === 'production' && process.env.LOGGING_ENDPOINT) {
    axios.post(process.env.LOGGING_ENDPOINT, { timestamp, type, message }).catch(() => {});
  }
}

let serviceAccount;

try {
  serviceAccount = require(serviceAccountPath);
  log("✅ Cargando credenciales desde serviceAccountKey.json (Local)");
} catch (error) {
  log(`🚨 ERROR al cargar serviceAccountKey.json: ${error.stack}`, 'error');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "maqueta-proyecto",
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

log("✅ Firebase Admin inicializado correctamente");
log(`📂 Bucket configurado: ${bucket.name}`);

function validateEnv(varName) {
  if (!process.env[varName]) {
    log(`⚠️  Advertencia: ${varName} no está definida.`, 'warn');
    return false;
  }
  return true;
}

validateEnv('EMAILJS_USER_ID');
validateEnv('STRIPE_SECRET_KEY');

if (!validateEnv('BASE_URL')) {
  process.env.BASE_URL = `https://www.comunidadislamicatordera.org`;
  log("🛠️ BASE_URL no estaba definida, usando valor por defecto: " + process.env.BASE_URL);
}

module.exports = { admin, bucket, db };
