// components/chat/ChatMessages.js
import React, { useEffect, useRef, useState } from "react";

const ChatMessages = ({ messages, currentUser }) => {
  const messagesRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Verifica si estamos cerca del fondo
  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setIsAtBottom(nearBottom);
  };

  useEffect(() => {
    if (isAtBottom) {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isAtBottom]);

  return (
    <div
      className="chatprivado-messages"
      ref={messagesRef}
      onScroll={handleScroll}
      style={{ overflowY: "auto", overflowX: "hidden" }}
    >
      {messages.map((msg, index) => {
        const bubbleClass =
          msg.senderId === currentUser.uid ? "sent" : "received";
        return (
          <div key={index} className={`chatprivado-message ${bubbleClass}`}>
            <p className="chatprivado-sender-name">
              <strong>{msg.senderName}:</strong>
            </p>
            {msg.text && <p className="chatprivado-text">{msg.text}</p>}
            {msg.audioUrl && (
              <div className="chatprivado-audio">
                <audio controls src={msg.audioUrl} />
              </div>
            )}
            {msg.fileUrl && msg.fileType === "image" && (
              <div className="chatprivado-media">
                <img
                  src={msg.fileUrl}
                  alt="Imagen"
                  className="chatprivado-media-image"
                />
              </div>
            )}
            {msg.fileUrl && msg.fileType === "video" && (
              <div className="chatprivado-media">
                <video
                  src={msg.fileUrl}
                  controls
                  className="chatprivado-media-video"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessages;
