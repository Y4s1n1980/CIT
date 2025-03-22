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

function validateServiceAccount(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const validEmail = obj.client_email?.includes('@') && obj.client_email?.includes('gserviceaccount.com');
  return validEmail && obj.private_key && obj.project_id && obj.type === 'service_account';
}

if (fs.existsSync(serviceAccountPath)) {
  try {
    serviceAccount = require(serviceAccountPath);
    if (!validateServiceAccount(serviceAccount)) {
      log("⚠️ Archivo serviceAccountKey.json malformado. Eliminando...", 'warn');
      fs.unlinkSync(serviceAccountPath);
      throw new Error("Archivo inválido");
    }
    log("✅ Cargando credenciales desde serviceAccountKey.json (Local)");
  } catch (error) {
    log(`🚨 ERROR al cargar serviceAccountKey.json: ${error.stack}`, 'error');
    process.exit(1);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    log("🔧 Creando serviceAccountKey.json desde FIREBASE_SERVICE_ACCOUNT (Render)...");
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    const parsed = JSON.parse(raw);

    if (parsed.private_key && typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    } else {
      log("❌ ERROR: La clave privada no es válida o está vacía.", 'error');
      process.exit(1);
    }

    if (!validateServiceAccount(parsed)) {
      log("❌ ERROR: Campos faltantes en FIREBASE_SERVICE_ACCOUNT.", 'error');
      process.exit(1);
    }

    serviceAccount = parsed;
    fs.mkdirSync(path.dirname(serviceAccountPath), { recursive: true });
    fs.writeFileSync(serviceAccountPath, JSON.stringify(parsed, null, 2));
    log("✅ Archivo serviceAccountKey.json creado correctamente.");
  } catch (error) {
    log(`🚨 ERROR al crear serviceAccountKey.json: ${error.stack}`, 'error');
    process.exit(1);
  }
} else {
  log("🚨 ERROR: No se encontró serviceAccountKey.json ni la variable FIREBASE_SERVICE_ACCOUNT.", 'error');
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
