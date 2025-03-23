//scripts/updateImageUrls.js
const { db } = require("../server/firebaseAdmin");

const fixFirestoreUrls = async () => {
  const targets = ["multimedia", "articulos"];

  for (const collectionName of targets) {
    const snapshot = await db.collection(collectionName).get();

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
        await db.collection(collectionName).doc(docSnap.id).update(updates);
        console.log(`✅ Documento ${docSnap.id} actualizado en ${collectionName}`);
      }
    }
  }
};

module.exports = { fixFirestoreUrls };

