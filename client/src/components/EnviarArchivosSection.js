import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import './EnviarArchivosSection.css';

const EnviarArchivosSection = () => {
    const { currentUser } = useAuth();
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [studentName, setStudentName] = useState(currentUser.displayName || '');

    useEffect(() => {
        // Obtener lista de admins y profesores desde Firestore
        const fetchRecipients = async () => {
            const q = query(collection(db, 'users'), where('role', 'in', ['admin', 'profesor']));
            const querySnapshot = await getDocs(q);
            const recipientList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || 'Nombre desconocido',
            }));
            setRecipients(recipientList);
        };

        fetchRecipients();
    }, []);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file || !selectedRecipient) {
            alert("Selecciona un archivo y un destinatario.");
            return;
        }
    
        try {
            console.log("Enviando archivo:", file.name);
    
            const formData = new FormData();
            formData.append("file", file);
            formData.append("coleccionDestino", "studentSubmissions");
            formData.append("studentId", currentUser.uid);
            formData.append("studentName", studentName);
            formData.append("studentEmail", currentUser.email || "Email desconocido");
            formData.append("recipientId", selectedRecipient);
            formData.append("recipientName", recipients.find(r => r.id === selectedRecipient)?.name || "Nombre desconocido");
            formData.append("message", message);
    
            const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://cit-backend-iuqy.onrender.com';
            const response = await fetch(`${BASE_URL}/upload`, {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            console.log("Respuesta del servidor:", data);
    
            if (response.ok && data.fileUrl) {
                console.log("Guardando en Firestore...");
                await addDoc(collection(db, "studentSubmissions"), {
                    fileUrl: data.fileUrl,
                    fileName: file.name,
                    studentId: currentUser.uid,
                    studentName,
                    studentEmail: currentUser.email || "Email desconocido",
                    recipientId: selectedRecipient,
                    recipientName: recipients.find(r => r.id === selectedRecipient)?.name || "Nombre desconocido",
                    message,
                    submittedAt: new Date(),
                });
    
                alert("Archivo enviado correctamente");
                setFile(null);
                setMessage("");
                setSelectedRecipient("");
            } else {
                console.error("Error en la respuesta del servidor:", data);
                alert("Hubo un error al enviar el archivo.");
            }
        } catch (error) {
            console.error("Error al enviar el archivo:", error);
            alert("Hubo un error al enviar el archivo.");
        }
    };
    

    return (
        <div>
            <h2>Enviar Archivos</h2>

            <form onSubmit={handleFileUpload}>
                <label htmlFor="recipient">Selecciona un Destinatario:</label>
                <select
                    id="recipient"
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    required
                >
                    <option value="">Selecciona un destinatario</option>
                    {recipients.map((recipient) => (
                        <option key={recipient.id} value={recipient.id}>
                            {recipient.name}
                        </option>
                    ))}
                </select>

                <label htmlFor="message">Mensaje Opcional:</label>
                <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje para el destinatario"
                ></textarea>

                <label htmlFor="file">Selecciona un Archivo:</label>
                <input
                    type="file"
                    id="file"
                    onChange={(e) => setFile(e.target.files[0])} // Cambiar el estado del archivo seleccionado
                    required
                />

                <label htmlFor="studentEmail">Tu Email:</label>
                <input
                    type="email"
                    id="studentEmail"
                    value={currentUser.email}
                    readOnly
                />

                <label htmlFor="studentName">Tu Nombre:</label>
                <input
                    type="text"
                    id="studentName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Escribe tu nombre y apellido"
                />

                <button type="submit">Enviar</button>
            </form>
        </div>
    );
};

export default EnviarArchivosSection;
