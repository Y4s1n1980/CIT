const { collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const { db } = require("../client/src/services/firebase");

module.exports.fixFirestoreUrls = async () => {
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
        console.log(`✅ Documento ${docSnap.id} actualizado en ${collectionName}`);
      }
    }
  }
};
