// src/pages/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import {collection,addDoc,query,onSnapshot,orderBy,doc,getDoc,setDoc} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from '../services/firebase';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop, faSmile } from '@fortawesome/free-solid-svg-icons';
import './ChatBase.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [hasAccess, setHasAccess] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Verificar acceso al chat y crear solicitud si no existe
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setCurrentUser(user);

      const requestRef = doc(db, "chatAccessRequests", user.uid);
      const requestSnap = await getDoc(requestRef);

      if (requestSnap.exists()) {
        const data = requestSnap.data();
        if (data.estado === 'approved') {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          setRequestSent(true);
        }
      } else {

        // Obtener el nombre desde la colección users
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const fullName = userData?.name || "Desconocido";
        await setDoc(doc(db, "chatAccessRequests", user.uid), {
          userId: user.uid,
          email: user.email,
          name: fullName,
          estado: 'pending',
          createdAt: new Date(),
        });
        setHasAccess(false);
        setRequestSent(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Escuchar mensajes si tiene acceso
  useEffect(() => {
    if (!hasAccess) return;

    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [hasAccess]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          setAudioBlob(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      }).catch(error => {
        console.error("Error accessing microphone:", error);
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage && !audioBlob) return;

    const messageData = {
      text: newMessage || '',
      createdAt: new Date(),
      uid: currentUser.uid,
      userName: currentUser.email,
    };

    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      messageData.audioUrl = audioUrl;
    }

    try {
      await addDoc(collection(db, "messages"), messageData);
      setNewMessage('');
      setAudioBlob(null);
      inputRef.current.focus();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsRecording(false);
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(newMessage + emoji.native);
    setShowEmojiPicker(false);
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (hasAccess === null) {
    return <div className="chat-page"><p>Verificando permisos de acceso al chat...</p></div>;
  }

  if (!hasAccess) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <p className="chat-info">
            {requestSent
              ? "Tu solicitud para acceder al chat ha sido enviada. Espera aprobación."
              : "No tienes acceso al chat."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.uid === currentUser.uid ? 'sent' : 'received'}`}
            >
              <div className="message-header">
                <span className="message-username">{message.userName}</span>
                <span className="message-time">{new Date(message.createdAt.seconds * 1000).toLocaleTimeString()}</span>
              </div>
              <div className="message-content">
                <p>{message.text}</p>
                {message.audioUrl && (
                  <audio controls className="audio-player">
                    <source src={message.audioUrl} type="audio/wav" />
                    Tu navegador no soporta audio.
                  </audio>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input">
          <div className="input-left">
            <button type="button" className="icon-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <FontAwesomeIcon icon={faSmile} />
            </button>
            <button type="button" className="icon-button" onClick={toggleRecording}>
              <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} />
            </button>
          </div>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje"
            className="text-input"
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
          <button type="submit" className="send-button">Enviar</button>
        </form>

        {showEmojiPicker && (
          <Picker data={data} onEmojiSelect={addEmoji} />
        )}
      </div>
    </div>
  );
}

export default Chat;
