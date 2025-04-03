// src/pages/NuestrosServicios.js
import React, { useState } from 'react';
import './NuestrosServicios.css';

const serviciosData = [
    {
        id: 'chahada',
        title: 'Chahada Nuevos Musulmanes',
        description: 'Apoyo moral a los nuevos musulmanes, celebrando la ceremonia islámica de la Chahada.',
        image: '/gallery-image1.jpg',
        details: 'Ofrecemos sesiones privadas especialmente diseñadas para nuevos musulmanes, proporcionando una introducción clara y acogedora a los principios fundamentales del Islam. Además, brindamos apoyo continuo y acompañamiento personalizado. Este servicio es parte de nuestro compromiso como Comunitat Islàmica de Tordera con la integración religiosa en la ciudad.',
    },
    {
        id: 'estudios-arabe',
        title: 'Estudios de Árabe',
        description: 'Clases lengua árabe para todos los niveles, incluyendo clases individuales con tecnología moderna.',
        image: '/gallery-image2.jpg',
        details: 'Nuestros cursos están diseñados para no araboparlantes e incluyen gramática, lectura y conversación. La Comunitat Islàmica de Tordera se compromete con la educación lingüística como parte de sus servicios islámicos en Tordera.',
    },
    {
        id: 'estudios-coranicos',
        title: 'Estudios Coránicos',
        description: 'Lectura conjunta de versículos de diferentes suras del Corán.',
        image: '/gallery-image3.jpg',
        details: 'Reuniones abiertas a todos los niveles con el objetivo de fomentar la comprensión espiritual del Corán. Un espacio de aprendizaje esencial en nuestra mezquita de Tordera.',
    },
    {
        id: 'renovacion-masijd',
        title: 'Renovaciones y Mantenimiento',
        description: 'Renovación y mantenimiento constante de las instalaciones.',
        image: '/gallery-image4.jpg',
        details: 'Trabajamos continuamente para mejorar y ampliar nuestras instalaciones en la mezquita. Nuestro objetivo es ofrecer un lugar de oración en Tordera cómodo y accesible para todos.',
    },
    {
        id: 'estudios-islamicos',
        title: 'Charlas y Eventos Islámicos',
        description: 'Charlas sobre Sunna, Hadith, Fiqh, y más, fines de semana.',
        image: '/hero2.jpeg',
        details: 'Sesiones informativas que promueven el conocimiento religioso en la vida cotidiana. Una actividad central para fortalecer la comunidad musulmana en Tordera.',
    },
    {
        id: 'estudios-sunna',
        title: 'Derecho Islámico',
        description: 'Charlas sobre las doctrinas y la Charia islámica simplificada.',
        image: '/hero4.jpeg',
        details: 'Estudios guiados sobre la legislación islámica, aplicable a la vida moderna. Parte esencial de nuestros servicios en la Comunitat Islàmica de Tordera.',
    },
];

const NuestrosServicios = () => {
    const [expandedCard, setExpandedCard] = useState(null);

    const openCard = (id) => {
        setExpandedCard(id);
    };

    const closeCard = () => {
        setExpandedCard(null);
    };

    return (
        <div className="nuestros-servicios">
            <h1 className="title">Servicios de la Comunitat Islàmica de Tordera</h1>
            <p className="intro">
                Descubre nuestros servicios religiosos y educativos dirigidos a la comunidad musulmana de Tordera: oración, formación, eventos islámicos y más.
            </p>
            <div className="services-grid">
                {serviciosData.map((servicio) => (
                    <div
                        key={servicio.id}
                        className={`service-card ${expandedCard === servicio.id ? 'expanded' : ''}`}
                        onClick={() => openCard(servicio.id)}
                    >
                        <img
                            src={servicio.image}
                            alt={`Servicio: ${servicio.title}`}
                            className="service-image"
                            loading="lazy"
                            width="300"
                            height="200"
                            onError={(e) => (e.target.src = "/fallback-image.jpg")}
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

            {expandedCard && (
                <div className="expanded-card-overlay">
                    <div className="expanded-card">
                        <button className="close-button" onClick={closeCard}>&times;</button>
                        <div className="expanded-card-content">
                            <img
                                src={serviciosData.find((s) => s.id === expandedCard).image}
                                alt={`Detalle del servicio: ${serviciosData.find((s) => s.id === expandedCard).title}`}
                                className="expanded-image"
                                loading="lazy"
                                width="300"
                                height="200"
                                onError={(e) => (e.target.src = "/fallback-image.jpg")}
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