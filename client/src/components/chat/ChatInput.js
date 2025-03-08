import React, { useState } from "react";
import { db } from "../../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import ChatRecorder from "./ChatRecorder";
import ChatEmojiPicker from "./ChatEmojiPicker";
import ChatMediaUpload from "./ChatMediaUpload";

const ChatInput = ({ contactId, receiverEmail }) => {
    const [message, setMessage] = useState("");
    const [audioBlob, setAudioBlob] = useState(null);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message && !audioBlob) return;

        const messageData = {
            text: message || "",
            createdAt: serverTimestamp(),
            chatRoomId: contactId,
        };

        if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            messageData.audioUrl = audioUrl;
        }

        await addDoc(collection(db, "chat-escuela"), messageData);
        setMessage("");
        setAudioBlob(null);
    };

    return (
        <form onSubmit={handleSendMessage} className="chat-input">
            <ChatEmojiPicker setMessage={setMessage} />
            <ChatRecorder setAudioBlob={setAudioBlob} />
            <ChatMediaUpload />
            <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-input"
            />
            <button type="submit" className="send-button">Enviar</button>
        </form>
    );
};

export default ChatInput;
