// pages/ChatPrivado.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import './ChatPrivado.css';

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import ChatNotifications from "../components/chat/ChatNotifications";
import ChatVideoCall from "../components/chat/ChatVideoCall";
import "./ChatBase.css";

const ChatPrivado = () => {
  const { contactId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [receiverEmail, setReceiverEmail] = useState("");

  useEffect(() => {
    const fetchReceiverInfo = async () => {
      if (!contactId) return;
      const contactRef = doc(db, "users", contactId);
      const contactSnap = await getDoc(contactRef);
      if (contactSnap.exists()) {
        setReceiverEmail(contactSnap.data().email);
      }
    };
    fetchReceiverInfo();
  }, [contactId]);

  useEffect(() => {
    if (!contactId) return;
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

  // Evitar render si no hay usuario
  if (!currentUser) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatMessages messages={messages} currentUser={currentUser}  />

        {/* 
          Un solo componente ChatInput, que incluye emojis, audio, media upload, etc.
          Se le pasa currentUser para que ChatMediaUpload pueda usar currentUser.uid
        */}
        <ChatInput
          contactId={contactId}
          receiverEmail={receiverEmail}
          currentUser={currentUser}
        />

        {/* Opcional: Notificaciones por correo */}
        <ChatNotifications
          recipientEmail={receiverEmail}
          senderName={currentUser.displayName}
          message={"¡Nuevo mensaje en el chat privado!"}
        />

        {/* Videollamada (opcional) */}
        <ChatVideoCall
          userId={currentUser.uid}
          contactId={contactId}
        />
      </div>
    </div>
  );
};

export default ChatPrivado;
