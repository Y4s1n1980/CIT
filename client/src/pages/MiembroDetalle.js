// src/pages/MiembroDetalle.js
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faYoutube, faLinkedin, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';
import './MiembroDetalle.css';

const MiembroDetalle = () => {
    const { nombre } = useParams();
    const location = useLocation();
    const miembro = location.state?.miembro || { nombre };

    if (!miembro) {
        return <p>No se encontró la información del miembro.</p>;
    }

    const handleWhatsAppClick = () => {
        window.open(`https://wa.me/${miembro.telefono.replace(/\s+/g, '')}`, '_blank');
    };

    return (
        <div className="miembro-detalle">
            {/* Información del miembro */}
            <div className="info">
                <h2>{miembro.nombre || { nombre }} {miembro.apellido}</h2>
                <p><strong>Puesto:</strong> {miembro.puesto}</p>
                <p><strong>Email:</strong> <a href={`mailto:${miembro.email}`}>{miembro.email}</a></p>
                <p>
                    <strong>Teléfono:</strong> 
                    <span onClick={handleWhatsAppClick} className="whatsapp-link">
                        {miembro.telefono}
                    </span>
                </p>
                <p className="descripcion">{miembro.descripcion}</p>

                {/* Redes Sociales */}
                <div className="redes-sociales">
                    {miembro.facebook && (
                        <a href={miembro.facebook} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faFacebook} />
                        </a>
                    )}
                    {miembro.youtube && (
                        <a href={miembro.youtube} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faYoutube} />
                        </a>
                    )}
                    {miembro.linkedin && (
                        <a href={miembro.linkedin} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faLinkedin} />
                        </a>
                    )}
                    {miembro.instagram && (
                        <a href={miembro.instagram} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                    )}
                    {miembro.tiktok && (
                        <a href={miembro.tiktok} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faTiktok} />
                        </a>
                    )}
                </div>
            </div>

            {/* Imagen del miembro */}
            <div className="imagen">
                <img src={miembro.imagenUrl} alt={miembro.nombre}  loading="lazy" />
            </div>
        </div>
    );
};

export default MiembroDetalle;
