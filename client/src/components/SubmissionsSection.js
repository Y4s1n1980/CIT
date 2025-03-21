import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import './SubmissionsSection.css';

const SubmissionsSection = () => {
    const [submissions, setSubmissions] = useState([]);
    const [downloaded, setDownloaded] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const submissionsPerPage = 5;

    // Función para descargar un archivo 
    const downloadFile = async (fileUrl, fileName, id) => {
        if (!fileUrl) {
            alert('Archivo no disponible para descargar.');
            return;
        }
    
        try {
            // Obtener el archivo desde Storage
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error('Error al descargar el archivo.');
            }
    
            // Convertir la respuesta en un Blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
    
            // Crear un enlace de descarga y forzar la descarga
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
    
            // Limpiar memoria
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
    
            // Marcar como descargado
            setDownloaded(prevState => ({ ...prevState, [id]: true }));
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            alert('Hubo un error al intentar descargar el archivo.');
        }
    };
    
    
    

    // Función para borrar una tarea
    const deleteSubmission = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
            try {
                await deleteDoc(doc(db, 'studentSubmissions', id));
                setSubmissions((prev) => prev.filter((submission) => submission.id !== id));
            } catch (error) {
                console.error('Error al eliminar la tarea:', error);
                alert('No se pudo eliminar la tarea.');
            }
        }
    };

    // Función para enviar un correo de notificación
    const sendEmailNotification = (submission) => {
        const templateParams = {
            to_email: submission.studentEmail,
            file_name: submission.fileName,
            message: submission.message || 'Sin mensaje adicional',
        };

        emailjs
            .send('service_id', 'template_id', templateParams, 'user_id')
            .then((response) => {
                console.log('Correo enviado:', response.status, response.text);
                alert('Correo enviado exitosamente.');
            })
            .catch((error) => {
                console.error('Error al enviar el correo:', error);
                alert('No se pudo enviar el correo.');
            });
    };

    // Cargar tareas desde Firestore
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const submissionsCollection = collection(db, 'studentSubmissions');
                const querySnapshot = await getDocs(submissionsCollection);
                const data = querySnapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                        submittedAt: doc.data().submittedAt || null,
                    }))
                    .sort((a, b) => 
                        (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0)
                    ); // Ordenar por fecha descendente
                setSubmissions(data);
            } catch (error) {
                console.error('Error al cargar las tareas:', error);
                alert('Hubo un error al cargar las tareas.');
            }
        };

        fetchSubmissions();
    }, []);

    // Paginación
    const indexOfLastSubmission = currentPage * submissionsPerPage;
    const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
    const currentSubmissions = submissions.slice(
        indexOfFirstSubmission,
        indexOfLastSubmission
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <section className="task-submissions">
            <h2>Tareas Enviadas Por Alumnos</h2>
            <table>
                <thead>
                    <tr>
                        <th>Archivo</th>
                        <th>Mensaje</th>
                        <th>Enviado por</th>
                        <th>Email</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentSubmissions.map((submission) => (
                        <tr key={submission.id}>
                            <td>{submission.fileName}</td>
                            <td>{submission.message || 'Sin mensaje'}</td>
                            <td>{submission.studentName}</td>
                            <td>{submission.studentEmail || 'Email no disponible'}</td>
                            <td>
                                {submission.submittedAt?.seconds
                                    ? new Date(
                                          submission.submittedAt.seconds * 1000
                                      ).toLocaleString()
                                    : 'Fecha no disponible'}
                            </td>
                            <td>
                                <button
                                    className={downloaded[submission.id] ? 'downloaded' : 'download'}
                                    onClick={() => downloadFile( submission.fileUrl, submission.fileName, submission.id)}
                                >
                                    {downloaded[submission.id] ? 'Descargado' : 'Descargar'}
                                </button>
                                <button onClick={() => deleteSubmission(submission.id)}>Eliminar</button>
                                <button onClick={() => sendEmailNotification(submission)}>
                                    Enviar Correo
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Paginación */}
            <div className="pagination">
                {Array.from(
                    { length: Math.ceil(submissions.length / submissionsPerPage) },
                    (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={
                                currentPage === index + 1 ? 'active' : ''
                            }
                        >
                            {index + 1}
                        </button>
                    )
                )}
            </div>
        </section>
    );
};

export default SubmissionsSection;
