import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const BASE_URL = process.env.REACT_APP_BASE_URL || "https://cit-backend-iuqy.onrender.com";

const uploadFile = async (file) => {
  if (!file) return null;
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Error en la respuesta del servidor:", await response.text());
      throw new Error("Error al subir el archivo.");
    }

    const result = await response.json();
    return result.fileUrl;
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return null;
  }
};

const UserMultimediaUpload = () => {
  const [newMultimedia, setNewMultimedia] = useState({
    titulo: "",
    autor: "",
    tipo: "video",
    file: null,
    imagen: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState({ fileUrl: "", imageUrl: "" });
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    const verificarUltimaSubida = async () => {
      const q = query(
        collection(db, "multimedia"),
        where("autor", "==", newMultimedia.autor),
        orderBy("fechaSubida", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const fecha = doc.data().fechaSubida?.toDate();
        if (fecha) {
          const diffMs = new Date() - fecha;
          const diffDias = diffMs / (1000 * 60 * 60 * 24);
          if (diffDias < 7) setBloqueado(true);
        }
      }
    };
    if (newMultimedia.autor) verificarUltimaSubida();
  }, [newMultimedia.autor]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const maxSize = newMultimedia.tipo === "audio" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert(`El archivo excede el tamaño máximo permitido (${maxSize / (1024 * 1024)} MB).`);
      return;
    }
    setNewMultimedia({ ...newMultimedia, file: selectedFile });
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (!selectedImage) return;
    const maxImageSize = 5 * 1024 * 1024;
    if (selectedImage.size > maxImageSize) {
      alert(`La imagen excede el tamaño máximo permitido (5 MB).`);
      return;
    }
    setNewMultimedia({ ...newMultimedia, imagen: selectedImage });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bloqueado) {
      alert("Ya has enviado multimedia esta semana. Puedes subir de nuevo en 7 días.");
      return;
    }
    const { titulo, autor, tipo, file, imagen } = newMultimedia;
    if (!file || !titulo || !autor) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
    setUploading(true);
    try {
      const fileUrl = await uploadFile(file);
      if (!fileUrl) throw new Error("Error al subir el archivo principal.");
      let imageUrl = "https://www.comunidadislamicatordera.org/placeholder-image.webp";
      if (imagen) {
        const uploadedImageUrl = await uploadFile(imagen);
        if (uploadedImageUrl) imageUrl = uploadedImageUrl;
      }
      await addDoc(collection(db, "multimedia"), {
        titulo,
        autor,
        tipo,
        url: fileUrl,
        imagenUrl: imageUrl,
        estado: "pendiente",
        fechaSubida: serverTimestamp(),
      });
      setUploadedUrls({ fileUrl, imageUrl });
      alert("Multimedia enviada correctamente. Esperando aprobación. Podrás volver a subir en 7 días.");
      setNewMultimedia({ titulo: "", autor: "", tipo: "video", file: null, imagen: null });
    } catch (error) {
      console.error("Error al subir multimedia:", error);
      alert("Error al subir multimedia.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="user-multimedia-upload">
      <h2>Subir Multimedia</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Título" value={newMultimedia.titulo} onChange={(e) => setNewMultimedia({ ...newMultimedia, titulo: e.target.value })} required />
        <input type="text" placeholder="Autor" value={newMultimedia.autor} onChange={(e) => setNewMultimedia({ ...newMultimedia, autor: e.target.value })} required />
        <select value={newMultimedia.tipo} onChange={(e) => setNewMultimedia({ ...newMultimedia, tipo: e.target.value })}>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
        </select>
        <input type="file" accept="video/*,audio/*" onChange={handleFileChange} required />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit" disabled={uploading}>{uploading ? <span>Cargando...</span> : "Subir Multimedia"}</button>
      </form>

      {uploadedUrls.fileUrl && (
        <div>
          <p>Archivo subido:</p>
          {newMultimedia.tipo === "video" ? (
            <video controls width="300">
              <source src={uploadedUrls.fileUrl} type="video/mp4" />
            </video>
          ) : (
            <audio controls>
              <source src={uploadedUrls.fileUrl} type="audio/mp3" />
            </audio>
          )}
        </div>
      )}

      {uploadedUrls.imageUrl && (
        <div>
          <p>Imagen subida:</p>
          <img src={uploadedUrls.imageUrl} alt="Imagen subida" width="200" />
        </div>
      )}
    </section>
  );
};

export default UserMultimediaUpload;
