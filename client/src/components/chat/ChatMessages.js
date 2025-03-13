// ChatMessages.js
import React, { useEffect, useRef } from "react";

const ChatMessages = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((msg, index) => {
        // Si el senderId coincide con currentUser.uid => es "sent"
        const bubbleClass = (msg.senderId === currentUser.uid) ? "sent" : "received";

        return (
          <div key={index} className={`chat-message ${bubbleClass}`}>
            <p>
              <strong>{msg.senderName}:</strong> {msg.text}
            </p>
            {msg.audioUrl && <audio controls src={msg.audioUrl}></audio>}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
