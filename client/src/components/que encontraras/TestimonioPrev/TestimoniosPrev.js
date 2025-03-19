import React from 'react';
import './TestimoniosPrev.css';

const testimonios = [
    {
        nombre: "Sara R.",
        comentario: "Esta comunidad cambió mi forma de ver las cosas. ¡Excelente!",
        imagen: "/images/testimonios/sara.jpg"
    },
    {
        nombre: "Ahmed K.",
        comentario: "La plataforma es intuitiva, interactiva y muy útil. La recomiendo a todos.",
        imagen: "/images/testimonios/ahmed.jpg"
    },
    {
        nombre: "Laura M.",
        comentario: "¡Maravillosa experiencia! Encontré justo lo que buscaba.",
        imagen: "/images/testimonios/laura.jpg"
    }
];

const TestimoniosPrev = () => (
    <section className="testimonios-prev">
        <h2 className="testimonios-prev-title">Lo que dicen nuestros usuarios</h2>
        <div className="testimonios-prev-container">
            {testimonios.map((testimonio, index) => (
                <div key={index} className="testimonio-card">
                    <img src={testimonio.imagen} alt={`Foto de ${testimonio.nombre}`} className="testimonio-imagen"/>
                    <p className="testimonio-comentario">"{testimonio.comentario}"</p>
                    <h4 className="testimonio-nombre">- {testimonio.nombre}</h4>
                </div>
            ))}
        </div>
    </section>
);

export default TestimoniosPrev;
