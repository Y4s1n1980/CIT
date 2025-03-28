import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NoticiasSection.css';


const NoticiasSection = () => {
  const navigate = useNavigate();

  return (
    <section className="news-section">
      <h2>Nuestras Noticias y Novedades</h2>
      <p className="news-description">
        Mantente informado sobre las últimas novedades, eventos y actualizaciones de nuestra comunidad.
        Descubre todo lo que está sucediendo y mantente al día con nuestra sección de noticias.
      </p>
      <button onClick={() => navigate('/noticias')} className="news-button">
        Ver Todas las Noticias
      </button>
    </section>
  );
};

export default NoticiasSection;
