// components/chat/ChatInput.js
import React, { useState, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import ChatRecorder from "./ChatRecorder";
import ChatEmojiPicker from "./ChatEmojiPicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faTimes } from "@fortawesome/free-solid-svg-icons";

const ChatInput = ({ contactId, currentUser }) => {
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  // Detecta la tecla Enter para enviar (sin Shift)
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "NumpadEnter") && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Función para enviar el mensaje (texto, audio y/o archivo adjunto)
  const handleSendMessage = async () => {
    if (!message.trim() && !audioBlob && !attachedFile) return;
    if (!contactId) return;

    let fileData = {};
    // Si hay un archivo adjunto, se sube primero
    if (attachedFile) {
      const formData = new FormData();
      formData.append("file", attachedFile);
      try {
        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Error al subir archivo.");
        }
        fileData.fileUrl = data.fileUrl;
        fileData.fileType = attachedFile.type.startsWith("image/")
          ? "image"
          : "video";
      } catch (error) {
        console.error("Error al subir archivo:", error);
        alert("Error al subir archivo.");
        return;
      }
    }

    // Preparamos el objeto mensaje
    const messageData = {
      text: message.trim(),
      createdAt: serverTimestamp(),
      chatRoomId: contactId,
      senderId: currentUser.uid,
      senderName:
        currentUser.displayName || currentUser.email || "Usuario Desconocido",
      ...fileData,
    };

    // Si hay audio, se añade su URL local
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      messageData.audioUrl = audioUrl;
    }

    try {
      await addDoc(collection(db, "chat-escuela"), messageData);
      setMessage("");
      setAudioBlob(null);
      setAttachedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (textInputRef.current) textInputRef.current.focus();
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  // Manejar la selección de archivo sin enviarlo inmediatamente
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !contactId) return;

    // Validar tipo de archivo (opcional)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Solo se permiten imágenes y videos.");
      return;
    }
    setAttachedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (textInputRef.current) textInputRef.current.focus();
  };

  // Función para eliminar el archivo adjunto antes de enviar
  const removeAttachedFile = () => {
    setAttachedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="chatprivado-input-bar">
      <input
        ref={textInputRef}
        type="text"
        className="chatprivado-text-input"
        placeholder="Escribe un mensaje..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Vista previa del archivo adjunto */}
      {attachedFile && previewUrl && (
        <div className="chatprivado-file-preview">
          {attachedFile.type.startsWith("image/") ? (
            <img
              src={previewUrl}
              alt="Vista previa"
              className="chatprivado-preview-image"
            />
          ) : (
            <div className="chatprivado-preview-file">
              <FontAwesomeIcon icon={faPaperclip} />
              <span>{attachedFile.name}</span>
            </div>
          )}
          <button
            type="button"
            className="chatprivado-remove-file-btn"
            onClick={removeAttachedFile}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* Botón de Emoji */}
      <ChatEmojiPicker setMessage={setMessage} />

      {/* Botón para seleccionar archivo */}
      <button
        type="button"
        className="chatprivado-icon-button"
        onClick={() => fileInputRef.current.click()}
      >
        <FontAwesomeIcon icon={faPaperclip} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*,video/*"
        onChange={handleFileSelect}
      />

      {/* Botón de grabación de audio */}
      <ChatRecorder setAudioBlob={setAudioBlob} />

      {/* Botón Enviar */}
      <button
        type="button"
        onClick={handleSendMessage}
        className="send-button"
      >
        Enviar
      </button>
    </div>
  );
};

export default ChatInput;
