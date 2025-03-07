import React, { useState } from 'react';
import './Historia.css';

const initialImages = [
    '/clases 1 1.jpeg',
    '/clases 21.jpeg',
    '/clases 22.jpeg',
    '/clases 112.jpeg',
    '/clases 113.jpeg',
    '/fachada-masjid-tordera.jpeg',
    '/clases 1.jpeg',
    '/clases 113.jpeg',
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
                Nuestra mezquita tiene una rica historia de apoyo y comunidad que se remonta a décadas.
                Es un lugar para el aprendizaje, la adoración y la unión comunitaria, siempre promoviendo valores de paz y solidaridad.
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
            La Comunidad Islámica de Tordera comenzó hace más de quince años como un pequeño grupo de personas con el sueño de construir un espacio de encuentro,
             aprendizaje y espiritualidad. Desde entonces, se ha dedicado a servir no solo a la comunidad musulmana, sino a toda la sociedad, fomentando valores de convivencia,
              solidaridad y respeto mutuo. La comunidad está formada por personas de más de diez nacionalidades diferentes, lo que refleja su carácter inclusivo y diverso. 
              Con el esfuerzo continuo de sus miembros, la mezquita se ha convertido en un lugar donde se fortalecen los lazos comunitarios y se promueven proyectos sociales 
              y educativos que benefician a todos, sin importar su origen o creencias. A través de actividades culturales, religiosas y de apoyo social, 
              la comunidad sigue trabajando incansablemente para construir puentes de entendimiento y unidad.
            </p>
            </div>
        </div>

       

    );
};

export default Historia;
