import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import './UploadSchoolDocument.css';

const UploadSchoolDocument = ({ onUpload }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [className, setClassName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Por favor, selecciona un archivo.');
            return;
        }

        setLoading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                await addDoc(collection(db, 'schoolDocuments'), {
                    title,
                    description,
                    fileUrl: reader.result, // Guardar en base64
                    class: className,
                    uploadedAt: Timestamp.now(),
                });

                alert('Documento subido correctamente.');
                if (onUpload) {
                    onUpload();
                }

                // Resetear el formulario
                setTitle('');
                setDescription('');
                setFile(null);
                setClassName('');
                document.getElementById("fileInput").value = "";
            };
        } catch (error) {
            console.error('Error subiendo documento:', error);
            alert('Error al subir el documento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-document">
            <h2>Subir Documento Escolar</h2>
            <form onSubmit={handleUpload}>
                <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <textarea placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input 
                    id="fileInput" 
                    type="file" 
                    accept=".pdf,.doc,.docx,.jpg,.png" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    required 
                />
                <input type="text" placeholder="Clase" value={className} onChange={(e) => setClassName(e.target.value)} required />
                <button type="submit" disabled={loading}>{loading ? 'Subiendo...' : 'Subir Documento'}</button>
            </form>
        </div>
    );
};

export default UploadSchoolDocument;
