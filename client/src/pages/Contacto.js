import React, { useState } from 'react';
import './Contacto.css';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import emailjs from 'emailjs-com';

const Contacto = () => {
    const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Guardar en Firestore
            await addDoc(collection(db, 'contactMessages'), {
                ...formData,
                timestamp: Timestamp.now(),
            });
    
            // Enviar correo con EmailJS
            const templateParams = {
                from_name: formData.nombre,
                from_email: formData.email,
                message: formData.mensaje,
                to_email: process.env.REACT_APP_ADMIN_NOTIFICATION_EMAIL, // Correo del admin
            };
    
            await emailjs.send(
                process.env.REACT_APP_EMAILJS_SERVICE_ID,
                process.env.REACT_APP_EMAILJS_TEMPLATE_ID_ADMIN, // Cambiar por la plantilla de contacto
                templateParams,
                process.env.REACT_APP_EMAILJS_USER_ID
            );
    
            // Mensaje de éxito
            setSuccessMessage('Tu mensaje ha sido enviado correctamente.');
            setErrorMessage('');
            setFormData({ nombre: '', email: '', mensaje: '' });
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            setErrorMessage('Hubo un problema al enviar tu mensaje. Intenta nuevamente.');
            setSuccessMessage('');
        }
    };
    

    return (
        <div className="contacto-page">
            <section className="contacto-hero">
                <h1>"Contáctanos"</h1>
                <p>Estamos para ayudarte. Envía tus preguntas o comentarios</p>
            </section>

            <div className="contacto-container">
                <div className="contacto-form-section">
                    <h2>Envía tu Mensaje</h2>
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Tu nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Tu email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="mensaje"
                            placeholder="Tu mensaje"
                            value={formData.mensaje}
                            onChange={handleChange}
                            required
                        ></textarea>
                        <button type="submit">Enviar</button>
                    </form>
                </div>
                <div className="contacto-info-section">
                    <h2>Información de Contacto</h2>
                    <p>Dirección: Calle Sant Antoni 11, Tordera, España</p>
                    <p>Teléfono: +34 630 630 630</p>
                    <p>Email: comunidadislamicatordera@gmail.com</p>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.613273292662!2d2.71754!3d41.698527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12bb10769d0a1c53%3A0xa982ccbd1244ec56!2sCarrer%20Sant%20Antoni%2C%2011%2C%2008490%20Tordera%2C%20Barcelona%2C%20Spain!5e0!3m2!1sen!2sus!4v1639054384059!5m2!1sen!2sus"
                        width="100%"
                        height="250"
                        allowFullScreen=""
                        loading="lazy"
                        title="Mapa de ubicación"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Contacto;
