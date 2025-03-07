// src/pages/NuestrosServicios.js
import React, { useState } from 'react';
import './NuestrosServicios.css';

const serviciosData = [
    {
        id: 'chahada',
        title: 'Chahada Nuevos Musulmanes',
        description: 'Apoyo moral y conocimiento para los nuevos musulmanes, celebrando la ceremonia islámica de la Chahada.',
        image: '/gallery-image1.jpg',
        details: 'Ofrecemos sesiones privadas para los nuevos musulmanes, asegurándonos de que entiendan los principios básicos del Islam y tengan apoyo continuo.',
    },
    {
        id: 'estudios-arabe',
        title: 'Estudios de Árabe',
        description: 'Clases de la lengua árabe para todos los niveles, incluyendo clases individuales con tecnología moderna.',
        image: '/gallery-image2.jpg',
        details: 'Nuestros cursos incluyen gramática, lectura, escritura y conversación, diseñados para no araboparlantes.',
    },
    {
        id: 'estudios-curanicos',
        title: 'Estudios Coránicos',
        description: 'Reuniones para lectura conjunta de versículos de diferentes suras del Corán.',
        image: '/gallery-image3.jpg',
        details: 'Estas reuniones promueven la comprensión y memorización del Corán, abiertas para todos los niveles.',
    },
    {
        id: 'renovacion-masijd',
        title: 'Renovaciones y Mantenimiento',
        description: 'Renovación y mantenimiento constante de las instalaciones para ofrecer mejores espacios.',
        image: '/gallery-image4.jpg',
        details: 'Trabajamos continuamente para mejorar nuestras instalaciones, incluyendo áreas de oración y espacios comunitarios.',
    },
    {
        id: 'estudios-islamicos',
        title: 'Charlas y Eventos Islámicos',
        description: 'Charlas sobre Sunna, Hadith, Fiqh, y más, los fines de semana.',
        image: '/hero2.jpeg',
        details: 'Sesiones informativas para explorar temas relevantes en la práctica islámica moderna.',
    },
    {
        id: 'estudios-sunna',
        title: 'Derecho Islámico',
        description: 'Charlas sobre las doctrinas y la Charia islámica simplificada.',
        image: '/hero4.jpeg',
        details: 'Un espacio para aprender sobre los fundamentos del derecho islámico y cómo se aplica hoy en día.',
    },
];
const NuestrosServicios = () => {
    const [expandedCard, setExpandedCard] = useState(null); // Card expandida

    const openCard = (id) => {
        setExpandedCard(id); // Abre la card
    };

    const closeCard = () => {
        setExpandedCard(null); // Cierra la card
    };

    return (
        <div className="nuestros-servicios">
            <h1 className="title">Nuestros Servicios</h1>
            <div className="services-grid">
                {serviciosData.map((servicio) => (
                    <div
                        key={servicio.id}
                        className={`service-card ${expandedCard === servicio.id ? 'expanded' : ''}`}
                        onClick={() => openCard(servicio.id)} // Abre la card
                    >
                        <img src={servicio.image} alt={servicio.title} className="service-image" loading="lazy"
                             width="300" 
                             height="200"
                             onError={(e) => e.target.src = "/fallback-image.jpg"} // Imagen de respaldo si falla 
                             />
                        <h3 className="service-title">{servicio.title}</h3>
                        {expandedCard !== servicio.id && (
                            <p className="service-description">
                                {servicio.description.substring(0, 50)}...
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Contenido expandido */}
            {expandedCard && (
                <div className="expanded-card-overlay">
                    <div className="expanded-card">
                        <button className="close-button" onClick={closeCard}>
                            &times;
                        </button>
                        <div className="expanded-card-content">
                            <img
                                src={serviciosData.find((s) => s.id === expandedCard).image}
                                alt={serviciosData.find((s) => s.id === expandedCard).title}
                                className="expanded-image"
                                loading="lazy" 
                                width="300" 
                                height="200"
                                onError={(e) => e.target.src = "/fallback-image.jpg"} 
                            />
                            <h2 className="expanded-title">
                                {serviciosData.find((s) => s.id === expandedCard).title}
                            </h2>
                            <p className="expanded-description">
                                {serviciosData.find((s) => s.id === expandedCard).details}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NuestrosServicios;
