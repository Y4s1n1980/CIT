// components/chat/ChatMediaUpload.js
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

const ChatMediaUpload = ({ onFileSelected }) => {
  // Manejar la selección de archivos
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validar el tipo de archivo (opcional)
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

    // Notificar al componente padre con el archivo seleccionado
    onFileSelected(selectedFile);
  };

  return (
    <div className="chat-media-upload">
      {/* Ocultamos el input file y lo activamos mediante una etiqueta label */}
      <input
        type="file"
        id="chatFileInput"
        style={{ display: "none" }}
        accept="image/*,video/*"
        onChange={handleFileChange}
      />
      <label htmlFor="chatFileInput" className="chatprivado-icon-button">
        <FontAwesomeIcon icon={faPaperclip} />
      </label>
    </div>
  );
};

export default ChatMediaUpload;
