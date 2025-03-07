import React, { useState } from "react";
import { getAuth } from "firebase/auth";
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

    // Validar tamaño y tipo de archivo
    const maxSize = newMultimedia.tipo === "audio" ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB para audio, 50MB para video
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

    // Validar tamaño de imagen (máximo 5MB)
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
  
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Error al subir multimedia al servidor.");
      }
  
      const data = await response.json();
      console.log("Archivo subido:", data);
  
      // 🔹 Agregar multimedia a Firestore con estado "pendiente"
      await addDoc(collection(db, "multimedia"), {
        titulo,
        autor,
        tipo,
        url: data.fileUrl || "",
        imagenUrl: data.imageUrl || "",
        estado: "pendiente", // 🔹 Solo se mostrará cuando un admin lo apruebe
        fechaSubida: serverTimestamp(),
      });
  
      alert("Multimedia enviada correctamente. Esperando aprobación.");
  
      // Limpiar el formulario
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
        <input
          type="file"
          accept={newMultimedia.tipo === "audio" ? "audio/*" : "video/*"}
          onChange={handleFileChange}
          required
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit" disabled={uploading}>
          {uploading ? <span>Cargando...</span> : "Subir Multimedia"}
        </button>
      </form>

      {/* Mostrar las URLs de los archivos subidos */}
      {uploadedUrls.fileUrl && (
        <p>
          Archivo subido:{" "}
          <a href={uploadedUrls.fileUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrls.fileUrl}
          </a>
        </p>
      )}
      {uploadedUrls.imageUrl && (
        <p>
          Imagen subida:{" "}
          <a href={uploadedUrls.imageUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrls.imageUrl}
          </a>
        </p>
      )}
    </section>
  );
};

export default UserMultimediaUpload;

