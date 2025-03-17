// src/pages/NuestrosServicios.js
import React, { useState } from 'react';
import './NuestrosServicios.css';

const serviciosData = [
    {
        id: 'chahada',
        title: 'Chahada Nuevos Musulmanes',
        description: 'Apoyo moral a los nuevos musulmanes, celebrando la ceremonia islámica de la Chahada.',
        image: '/gallery-image1.jpg',
        details: 'Ofrecemos sesiones privadas especialmente diseñadas para nuevos musulmanes, proporcionando una introducción clara y acogedora a los principios fundamentales del Islam. Además, nos comprometemos a brindar apoyo continuo y acompañamiento personalizado, asegurando que cada individuo se sienta guiado y respaldado en cada paso de su camino espiritual..',
    },
    {
        id: 'estudios-arabe',
        title: 'Estudios de Árabe',
        description: 'Clases lengua árabe para todos los niveles, incluyendo clases individuales con tecnología moderna.',
        image: '/gallery-image2.jpg',
        details: 'Nuestros cursos están cuidadosamente diseñados para no araboparlantes e incluyen una enseñanza integral de la lengua árabe, abarcando gramática, lectura, escritura y conversación. A través de un enfoque dinámico y accesible, buscamos facilitar el aprendizaje del idioma y su comprensión, brindando a cada estudiante las herramientas necesarias para desenvolverse con confianza en distintos contextos.',
    },
    {
        id: 'estudios-coranicos',
        title: 'Estudios Coránicos',
        description: 'lectura conjunta de versículos de diferentes suras del Corán.',
        image: '/gallery-image3.jpg',
        details: 'Estas reuniones están dedicadas a fomentar la comprensión profunda y la memorización del Corán, ofreciendo un espacio accesible y enriquecedor para todos los niveles. Con el apoyo de guías experimentados, cada participante avanza a su propio ritmo, fortaleciendo su conexión espiritual y su conocimiento del sagrado texto.',
    },
    {
        id: 'renovacion-masijd',
        title: 'Renovaciones y Mantenimiento',
        description: 'Renovación y mantenimiento constante de las instalaciones.',
        image: '/gallery-image4.jpg',
        details: 'Trabajamos continuamente para mejorar y ampliar nuestras instalaciones, asegurando que cada espacio, desde las áreas de oración hasta los espacios comunitarios, sea acogedor, funcional y adecuado para el crecimiento espiritual y social de nuestra comunidad. Nuestro compromiso es ofrecer un entorno confortable y bien equipado para todos.',
    },
    {
        id: 'estudios-islamicos',
        title: 'Charlas y Eventos Islámicos',
        description: 'Charlas sobre Sunna, Hadith, Fiqh, y más, fines de semana.',
        image: '/hero2.jpeg',
        details: 'Ofrecemos sesiones informativas diseñadas para explorar en profundidad temas relevantes en la práctica islámica moderna. A través de debates enriquecedores y orientaciones especializadas, proporcionamos un espacio de aprendizaje donde los participantes pueden aclarar dudas, fortalecer su conocimiento y aplicar los principios islámicos en el contexto actual.',
    },
    {
        id: 'estudios-sunna',
        title: 'Derecho Islámico',
        description: 'Charlas sobre las doctrinas y la Charia islámica simplificada.',
        image: '/hero4.jpeg',
        details: 'Disponemos de un espacio dedicado al estudio de los fundamentos del derecho islámico, proporcionando una comprensión clara y accesible de sus principios y su aplicación en la vida moderna. A través de análisis detallados y ejemplos prácticos, buscamos facilitar el aprendizaje y la reflexión sobre su relevancia en el mundo actual.',
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
