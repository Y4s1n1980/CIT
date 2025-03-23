//scripts updateImageUrls.js
const { collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const { db } = require("../client/src/services/firebase"); 

const updateImageUrls = async () => {
  const serviciosCollection = collection(db, "servicios");
  const querySnapshot = await getDocs(serviciosCollection);

  querySnapshot.forEach(async (document) => {
    const servicio = document.data();
    if (
      servicio.imagenUrl &&
      servicio.imagenUrl.startsWith("http://localhost:5000")
    ) {
      const fullUrl = servicio.imagenUrl.replace(
        "http://localhost:5000",
        "https://cit-backend-iuqy.onrender.com"
      );
      await updateDoc(doc(db, "servicios", document.id), { imagenUrl: fullUrl });
      console.log(`Actualizada URL del servicio: ${document.id}`);
    }
  });
};

// ADICIONAL: script para migrar URLs de multimedia y articulos en Firestore
const fixFirestoreUrls = async () => {
    const targets = ["multimedia", "articulos"];
  
    for (const collectionName of targets) {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
  
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const updates = {};
  
        if (data.url?.startsWith("http://localhost:5000")) {
          updates.url = data.url.replace(
            "http://localhost:5000",
            "https://cit-backend-iuqy.onrender.com"
          );
        }
  
        if (data.imagenUrl?.startsWith("http://localhost:5000")) {
          updates.imagenUrl = data.imagenUrl.replace(
            "http://localhost:5000",
            "https://cit-backend-iuqy.onrender.com"
          );
        }
  
        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, collectionName, docSnap.id), updates);
          console.log(`Document ${docSnap.id} actualizado en ${collectionName}`);
        }
      }
    }
  };
  
  fixFirestoreUrls();

