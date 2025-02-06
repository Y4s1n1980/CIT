const admin = require("firebase-admin"); 
const serviceAccount = require("../config/serviceAccountKey.json"); 

// Inicializa Firebase Admin 
console.log('Inicializando Firebase Admin con el bucket:', serviceAccount.project_id);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "maqueta-proyecto", 
  });
}

// Inicializar bucket de almacenamiento
const bucket = admin.storage().bucket();
console.log('Bucket configurado:', bucket.name);

// Inicializar Firestore
const db = admin.firestore();

module.exports = { admin, bucket, db };
