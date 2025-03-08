import React from "react";

const ChatNotifications = ({ recipientEmail, senderName, message }) => {
    const sendNotification = async () => {
        if (!recipientEmail || !senderName || !message) {
            console.error("Faltan datos para enviar la notificación.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipient: recipientEmail,
                    sender: senderName,
                    message: message,
                }),
            });

            if (!response.ok) throw new Error("Error al enviar la notificación.");
            
            console.log("Notificación enviada con éxito");
        } catch (error) {
            console.error("Error al enviar la notificación:", error);
        }
    };

    return (
        <button onClick={sendNotification} className="send-notification-btn">
            Enviar Notificación
        </button>
    );
};

export default ChatNotifications;
