// components/chat/ChatInput.js
import React, { useState } from "react";
import { db } from "../../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import ChatRecorder from "./ChatRecorder";
import ChatEmojiPicker from "./ChatEmojiPicker";
import ChatMediaUpload from "./ChatMediaUpload";

const ChatInput = ({ contactId, receiverEmail, currentUser }) => {
  const [message, setMessage] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);

  // Enviar texto o audio
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message && !audioBlob) return;
    if (!contactId) return;

    const messageData = {
      text: message.trim(),
      createdAt: serverTimestamp(),
      chatRoomId: contactId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || "Usuario Anónimo"
    };

    // Si hay audio, convertimos a URL local (o podríamos subirlo a Storage)
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      messageData.audioUrl = audioUrl;
    }

    try {
      await addDoc(collection(db, "chat-escuela"), messageData);
      setMessage("");
      setAudioBlob(null);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="chat-input">
      {/* Botón/Panel de Emojis */}
      <ChatEmojiPicker setMessage={setMessage} />

      {/* Botón de grabación de audio (con cancelar) */}
      <ChatRecorder setAudioBlob={setAudioBlob} />

      {/* Subir imágenes/videos */}
      <ChatMediaUpload
        contactId={contactId}
        currentUser={currentUser}
      />

      {/* Input de texto */}
      <input
        type="text"
        placeholder="Escribe un mensaje..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="text-input"
      />

      <button type="submit" className="send-button">
        Enviar
      </button>
    </form>
  );
};

export default ChatInput;
