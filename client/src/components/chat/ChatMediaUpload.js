// components/chat/ChatMediaUpload.js
import React, { useState } from "react";
import { storage, db } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ChatMediaUpload = ({ contactId, currentUser }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Manejar la selección de archivos
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validar el tipo de archivo
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/webm"
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Solo se permiten imágenes y videos.");
      return;
    }

    setFile(selectedFile);
  };

  // Subir archivo a Firebase Storage
  const handleUpload = async () => {
    if (!file) {
      alert("Selecciona un archivo primero.");
      return;
    }
    if (!currentUser) {
      alert("No hay usuario logueado.");
      return;
    }
    if (!contactId) {
      alert("No hay contactId definido.");
      return;
    }

    setUploading(true);

    try {
      const storageRef = ref(storage, `chat_uploads/${currentUser.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      // Guardar en Firestore
      await addDoc(collection(db, "chat-escuela"), {
        chatRoomId: contactId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "Usuario Anónimo",
        fileUrl: fileURL,
        fileType: file.type.startsWith("image/") ? "image" : "video",
        createdAt: serverTimestamp()
      });

      alert("Archivo subido con éxito.");
      setFile(null);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      alert("Error al subir el archivo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="chat-media-upload">
      <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Subiendo..." : "Subir Archivo"}
      </button>
    </div>
  );
};

export default ChatMediaUpload;
