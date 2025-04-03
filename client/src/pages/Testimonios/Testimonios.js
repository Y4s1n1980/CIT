// src/pages/Testimonios.js
import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import Slider from 'react-slick';
import './Testimonios.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Testimonios = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [newTestimonio, setNewTestimonio] = useState('');
  const [name, setName] = useState('');

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    cssEase: "ease-in-out",
    pauseOnHover: true,
  };

  useEffect(() => {
    const fetchTestimonios = async () => {
      const testimoniosSnapshot = await getDocs(collection(db, 'testimonios'));
      const testimoniosData = testimoniosSnapshot.docs.map((doc) => doc.data());
      setTestimonios(testimoniosData);
    };
    fetchTestimonios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'testimonios'), {
        name: name || 'Anónimo',
        text: newTestimonio,
        createdAt: new Date(),
      });
      setNewTestimonio('');
      setName('');
    } catch (error) {
      console.error('Error al enviar el testimonio: ', error);
    }
  };

  return (
    <section className="testimonios-section">
      <h1 className="testimonios-title">
        Testimonios sobre la Comunitat Islàmica de Tordera
      </h1>
      <p className="testimonios-subtitle">
        Conoce la experiencia de personas que han visitado nuestra mezquita en Tordera o participado en nuestros servicios islámicos y eventos comunitarios.
      </p>

      <Slider {...settings}>
        {testimonios.map((testimonio, index) => (
          <div key={index} className="testimonio-container">
            <div className="testimonio-content">
              <h2 className="testimonio-name">{testimonio.name}</h2>
              <p className="testimonio-text">"{testimonio.text}"</p>
            </div>
          </div>
        ))}
      </Slider>

      <form onSubmit={handleSubmit} className="testimonio-form">
        <h2>Comparte tu experiencia</h2>
        <p>
          ¿Has visitado nuestra mezquita o participado en alguna actividad de la comunidad islámica de Tordera? ¡Cuéntanos!
        </p>
        <input
          type="text"
          placeholder="Tu nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Escribe tu testimonio..."
          value={newTestimonio}
          onChange={(e) => setNewTestimonio(e.target.value)}
          required
        />
        <button type="submit" className="submit-testimonio-button">
          Enviar Testimonio
        </button>
      </form>
    </section>
  );
};

export default Testimonios;
