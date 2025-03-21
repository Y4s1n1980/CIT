// src/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
console.log("🔍 API KEY:", process.env.REACT_APP_FIREBASE_API_KEY);
console.log("🔍 PROJECT ID:", process.env.REACT_APP_FIREBASE_PROJECT_ID);


// Verificación de variables de entorno
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn("⚠️ ADVERTENCIA: Las credenciales de Firebase están vacías o incorrectas.");
} else {
    console.log("✅ Firebase inicializado correctamente.");
}

// Inicializar Firebase solo si no ha sido inicializado previamente
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportar servicios de Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 🔥 FUNCION PARA OBTENER DATOS DE MULTIMEDIA 🔥
export const obtenerDatos = async () => {
    try {
        const q = query(collection(db, "multimedia"), orderBy("fecha", "desc"), limit(10));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("⚠️ Error obteniendo datos de multimedia:", error);
        return [];
    }
};

export { auth, db, storage };
