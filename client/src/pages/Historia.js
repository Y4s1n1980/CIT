import React, { useState } from 'react';
import './Historia.css';

const initialImages = [
    '/clases-2.jpeg',
    '/minbarmihrab.jpg',
    '/interiormihrab.jpg',
    '/interior1.jpg',
    '/clases-4.jpeg',
    '/fachada-masjid-tordera.jpeg',
    '/clases-4.jpeg',
    '/clases-22.jpeg',
];

const Historia = () => {
    const [visibleImages, setVisibleImages] = useState(4); // Número inicial de imágenes visibles
    const [modalImage, setModalImage] = useState(null);

    const showMoreImages = () => {
        setVisibleImages((prev) => prev + 4); // Cargar 4 imágenes más
    };

    const openModal = (image) => {
        setModalImage(image); // Establecer imagen en el modal
        document.body.classList.add('modal-open'); // Evitar scroll en el fondo
    };

    const closeModal = () => {
        setModalImage(null); // Cerrar el modal
        document.body.classList.remove('modal-open'); // Permitir scroll en el fondo
    };

    return (
        <div className="historia-page">
            <h1 className="historia-title">Historia de la Mezquita</h1>
            <p className="historia-description">
            Nuestra mezquita posee una rica historia de apoyo mutuo y comunidad que se remonta a mas de una década atrás. 
            Es un espacio dedicado al aprendizaje, la adoración espiritual y la unión comunitaria, promoviendo constantemente valores de paz, 
            entendimiento y solidaridad.
            </p>

            {/* Galería de imágenes */}
            <div className="historia-gallery">
                {initialImages.slice(0, visibleImages).map((image, index) => (
                    <div key={index} className="historia-gallery-card" onClick={() => openModal(image)}>
                        <img src={image} alt={`Imagen ${index + 1}`} className="historia-gallery-image"  loading="lazy" />
                    </div>
                ))}
            </div>

            {/* Botón para cargar más imágenes */}
            {visibleImages < initialImages.length && (
                <button className="historia-load-more-button" onClick={showMoreImages}>
                    Ver más
                </button>
            )}

            {/* Modal para imágenes ampliadas */}
            {modalImage && (
                <div className="historia-modal-overlay" onClick={closeModal}>
                    <div className="historia-modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="historia-close-button" onClick={closeModal}>
                            &times;
                        </span>
                        <img src={modalImage} alt="Imagen ampliada" className="historia-modal-image" />
                    </div>
                </div>
            )}

            <div className="historia-comunidad">
            <h1 className="historia-title-comunidad">Comunidad Islamica Tordera</h1>
            <p className="historia-description-comunidad">
            La Comunidad Islámica de Tordera nació hace más de quince años impulsada por un pequeño grupo de personas unidas por un sueño compartido: 
            crear un espacio abierto para el encuentro, la espiritualidad y el aprendizaje. 
            Desde sus humildes comienzos, nuestra comunidad ha crecido hasta convertirse en un punto de referencia que no solo atiende a la comunidad musulmana, 
            sino que abre sus puertas a toda la sociedad, fomentando valores esenciales como la convivencia pacífica, la solidaridad y el respeto mutuo.
            Actualmente, somos orgullosamente una comunidad diversa y multicultural, compuesta por miembros de más de diez nacionalidades diferentes, 
            reflejando así nuestro espíritu inclusivo y abierto al diálogo. Gracias al compromiso continuo y al esfuerzo conjunto de nuestros miembros, 
            la mezquita se ha transformado en mucho más que un lugar de culto: 
            es un centro vital donde se fortalecen lazos comunitarios y se desarrollan importantes proyectos sociales y educativos que enriquecen a toda la población, 
            independientemente de su origen o creencias.
            A través de variadas actividades culturales, religiosas y de apoyo social, la Comunidad Islámica de Tordera continúa trabajando día a día, 
            con entusiasmo y dedicación, para tender puentes de entendimiento, unidad y cooperación entre todos los vecinos.


            </p>
            </div>
        </div>

       

    );
};

export default Historia;
