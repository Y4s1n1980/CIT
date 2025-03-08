import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import ChatRecorder from "../components/chat/ChatRecorder";
import ChatEmojiPicker from "../components/chat/ChatEmojiPicker";
import ChatMediaUpload from "../components/chat/ChatMediaUpload";
import ChatCamera from "../components/chat/ChatCamera";
import ChatNotifications from "../components/chat/ChatNotifications";
import ChatVideoCall from "../components/chat/ChatVideoCall";
import "./ChatBase.css";
import { useAuth } from "../contexts/AuthContext";

const ChatPrivado = () => {
    const { contactId } = useParams();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [receiverEmail, setReceiverEmail] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchReceiverInfo = async () => {
            const contactRef = doc(db, "users", contactId);
            const contactSnap = await getDoc(contactRef);
            if (contactSnap.exists()) {
                setReceiverEmail(contactSnap.data().email);
            }
        };
        fetchReceiverInfo();
    }, [contactId]);

    useEffect(() => {
        const q = query(
            collection(db, "chat-escuela"),
            where("chatRoomId", "==", contactId),
            orderBy("createdAt", "asc")
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setMessages(querySnapshot.docs.map((doc) => doc.data()));
        });

        return () => unsubscribe();
    }, [contactId]);

    return (
        <div className="chat-page">
            <div className="chat-container">
                <ChatMessages messages={messages} />
                <ChatInput contactId={contactId} receiverEmail={receiverEmail} messagesEndRef={messagesEndRef} />
                <ChatEmojiPicker />
                <ChatRecorder />
                <ChatMediaUpload />
                <ChatCamera />
                <ChatNotifications recipientEmail={receiverEmail} senderName={currentUser.displayName} />
                <ChatVideoCall contactId={contactId} currentUser={currentUser} />
            </div>
        </div>
    );
};

export default ChatPrivado;
