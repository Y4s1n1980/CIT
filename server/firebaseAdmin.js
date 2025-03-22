const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = path.join(__dirname, "../config/serviceAccountKey.json");

let serviceAccount;

// ✅ Intenta cargar desde archivo si existe (modo local)
if (fs.existsSync(serviceAccountPath)) {
    try {
        serviceAccount = require(serviceAccountPath);
        console.log("✅ Cargando credenciales desde serviceAccountKey.json (Local)");
    } catch (error) {
        console.error("🚨 ERROR: No se pudo cargar serviceAccountKey.json:", error);
        process.exit(1);
    }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        console.log("🔧 Creando serviceAccountKey.json desde FIREBASE_SERVICE_ACCOUNT (Render)...");

        // Paso 1: parsear y corregir la private_key
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
        const parsed = JSON.parse(raw);

        // Corregir manualmente la private_key
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        serviceAccount = parsed;

        // Paso 2: escribir archivo corregido
        fs.mkdirSync(path.dirname(serviceAccountPath), { recursive: true });
        fs.writeFileSync(serviceAccountPath, JSON.stringify(parsed, null, 2));
        console.log("✅ Archivo serviceAccountKey.json creado correctamente.");
    } catch (error) {
        console.error("🚨 ERROR: No se pudo crear serviceAccountKey.json:", error);
        process.exit(1);
    }
} else {
    console.error("🚨 ERROR: No se encontró serviceAccountKey.json ni la variable FIREBASE_SERVICE_ACCOUNT.");
    process.exit(1);
}

// ✅ Inicializar Firebase solo si no está ya inicializado
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "maqueta-proyecto",
    });
}

// Inicializar Firestore
const db = admin.firestore();

// Inicializar bucket de almacenamiento
const bucket = admin.storage().bucket();

console.log("✅ Firebase Admin inicializado correctamente");
console.log("📂 Bucket configurado:", bucket.name);

module.exports = { admin, bucket, db };
