const { collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const { db } = require("../client/src/services/firebase"); 

const updateImageUrls = async () => {
    const serviciosCollection = collection(db, "servicios");
    const querySnapshot = await getDocs(serviciosCollection);

    querySnapshot.forEach(async (document) => {
        const servicio = document.data();
        if (servicio.imagenUrl && !servicio.imagenUrl.startsWith("http")) {
            const fullUrl = `http://localhost:5000${servicio.imagenUrl}`;
            await updateDoc(doc(db, "servicios", document.id), { imagenUrl: fullUrl });
            console.log(`Actualizada URL del servicio: ${document.id}`);
        }
    });
};

updateImageUrls();

