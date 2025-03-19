import React from 'react';
import { Link } from 'react-router-dom';
import './ContactoPrev.css';

const ContactoPrev = () => {
    return (
        <section className="contacto-prev-section">
            <div className="contacto-prev-container">
                <div className="contacto-prev-text">
                    <h2>¿Tienes dudas o preguntas?</h2>
                    <p>
                        Estamos aquí para ayudarte. Si tienes cualquier consulta, no dudes en contactar con nosotros.
                        Nuestro equipo estará encantado de atenderte.
                    </p>
                    <Link to="/contacto" className="contacto-prev-btn">
                        Contacta con nosotros
                    </Link>
                </div>
                <div className="contacto-prev-media">
                    <video autoPlay muted loop className="contacto-prev-video">
                        <source src="/videos/contacto-preview.mp4" type="video/mp4" />
                        Tu navegador no admite videos.
                    </video>
                </div>
            </div>
        </section>
    );
};

export default ContactoPrev;
