import React, { useEffect, useRef } from "react";

const ChatMessages = ({ messages }) => {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="chat-messages">
            {messages.map((msg, index) => (
                <div key={index} className="chat-message">
                    <p><strong>{msg.senderName}:</strong> {msg.text}</p>
                    {msg.audioUrl && <audio controls src={msg.audioUrl}></audio>}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
