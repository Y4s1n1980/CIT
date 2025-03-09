const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Ruta al archivo de credenciales
const serviceAccountPath = path.join(__dirname, "../config/serviceAccountKey.json");

// Verificar si el archivo de credenciales existe antes de cargarlo
if (!fs.existsSync(serviceAccountPath)) {
    console.error("⚠️ Error: Archivo de credenciales Firebase no encontrado:", serviceAccountPath);
    process.exit(1); // Finaliza el proceso si no se encuentra el archivo
}

const serviceAccount = require(serviceAccountPath);

// Verificar que las credenciales sean válidas
if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    console.error("⚠️ Error: Credenciales Firebase incompletas. Revisa serviceAccountKey.json.");
    process.exit(1);
}

// Inicializa Firebase Admin solo si no está inicializado
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "maqueta-proyecto.appspot.com",
    });
}

// Inicializar Firestore
const db = admin.firestore();

// Inicializar bucket de almacenamiento
const bucket = admin.storage().bucket();

console.log("✅ Firebase Admin inicializado correctamente");
console.log("📂 Bucket configurado:", bucket.name);

module.exports = { admin, bucket, db };
