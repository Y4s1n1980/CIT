import React, { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

  // Manejar el cambio en el archivo principal
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const maxSize = newMultimedia.tipo === "audio" ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB audio, 50MB video
    if (selectedFile.size > maxSize) {
      alert(`El archivo excede el tamaño máximo permitido (${maxSize / (1024 * 1024)} MB).`);
      return;
    }

    setNewMultimedia({ ...newMultimedia, file: selectedFile });
  };

  // Manejar el cambio en la imagen opcional
  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (!selectedImage) return;

    const maxImageSize = 5 * 1024 * 1024; // 5MB
    if (selectedImage.size > maxImageSize) {
      alert(`La imagen excede el tamaño máximo permitido (5 MB).`);
      return;
    }

    setNewMultimedia({ ...newMultimedia, imagen: selectedImage });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { titulo, autor, tipo, file, imagen } = newMultimedia;

    if (!file || !titulo || !autor) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("titulo", titulo);
      formData.append("autor", autor);
      formData.append("tipo", tipo);
      if (imagen) formData.append("imagen", imagen);

      const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;
      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      console.log("Respuesta del servidor:", response);

      if (!response.ok) {
        console.error("Error en la respuesta del servidor:", await response.text());
        throw new Error("Error al subir multimedia al servidor.");
      }

      const data = await response.json();
      console.log("Archivo subido:", data);

      // Guardar en Firestore
      await addDoc(collection(db, "multimedia"), {
        titulo,
        autor,
        tipo,
        url: data.fileUrl || "https://www.comunidadislamicatordera.org/placeholder-video.mp4",
        imagenUrl: data.imageUrl || "https://www.comunidadislamicatordera.org/placeholder-image.webp",
        estado: "pendiente",
        fechaSubida: serverTimestamp(),
      });

      setUploadedUrls({
        fileUrl: data.fileUrl || "https://www.comunidadislamicatordera.org/placeholder-video.mp4",
        imageUrl: data.imageUrl || "https://www.comunidadislamicatordera.org/placeholder-image.webp",
      });

      alert("Multimedia enviada correctamente. Esperando aprobación.");

      setNewMultimedia({
        titulo: "",
        autor: "",
        tipo: "video",
        file: null,
        imagen: null,
      });

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
        <input
          type="text"
          placeholder="Título"
          value={newMultimedia.titulo}
          onChange={(e) => setNewMultimedia({ ...newMultimedia, titulo: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Autor"
          value={newMultimedia.autor}
          onChange={(e) => setNewMultimedia({ ...newMultimedia, autor: e.target.value })}
          required
        />
        <select
          value={newMultimedia.tipo}
          onChange={(e) => setNewMultimedia({ ...newMultimedia, tipo: e.target.value })}
        >
          <option value="video">Video</option>
          <option value="audio">Audio</option>
        </select>
        <input type="file" accept="video/*,audio/*" onChange={handleFileChange} required />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit" disabled={uploading}>
          {uploading ? <span>Cargando...</span> : "Subir Multimedia"}
        </button>
      </form>

      {/* Mostrar la multimedia subida */}
      {uploadedUrls.fileUrl && (
        <div>
          <p>Archivo subido:</p>
          {newMultimedia.tipo === "video" ? (
            <video controls width="300">
              <source src={uploadedUrls.fileUrl} type="video/mp4" />
              Tu navegador no soporta videos.
            </video>
          ) : (
            <audio controls>
              <source src={uploadedUrls.fileUrl} type="audio/mp3" />
              Tu navegador no soporta audios.
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
