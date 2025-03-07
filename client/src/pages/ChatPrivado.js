import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import './ChatBase.css';
import emailjs from 'emailjs-com';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop, faSmile } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

const ChatPrivado = () => {
    const { contactId } = useParams();
    const { currentUser } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [receiverEmail, setReceiverEmail] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchReceiverInfo = async () => {
            const contactRef = doc(db, 'users', contactId);
            const contactSnap = await getDoc(contactRef);
            if (contactSnap.exists()) {
                setReceiverEmail(contactSnap.data().email);
                setReceiverName(contactSnap.data().name);
            }
        };
        fetchReceiverInfo();
    }, [contactId]);

    useEffect(() => {
        const q = query(
            collection(db, 'chat-escuela'),
            where('chatRoomId', '==', contactId),
            orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages = querySnapshot.docs.map(doc => doc.data());
            setMessages(messages);
        });

        return () => unsubscribe();
    }, [contactId]);

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
        if (!message && !audioBlob) return;

        const messageData = {
            text: message || '',
            createdAt: new Date(),
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Usuario Anónimo",
            chatRoomId: contactId
        };

        if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            messageData.audioUrl = audioUrl;
        }

        await addDoc(collection(db, 'chat-escuela'), messageData);
        setMessage('');
        setAudioBlob(null);
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };

    const addEmoji = (emoji) => {
        setMessage(message + emoji.native);
        setShowEmojiPicker(false);
    };

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className="chat-message">
                            <p><strong>{msg.senderName}:</strong> {msg.text}</p>
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
                        placeholder="Escribe un mensaje..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="text-input"
                    />
                    <button type="submit" className="send-button">Enviar</button>
                </form>
                {showEmojiPicker && (
                    <Picker data={data} onEmojiSelect={addEmoji} />
                )}
            </div>
        </div>
    );
};

export default ChatPrivado;
