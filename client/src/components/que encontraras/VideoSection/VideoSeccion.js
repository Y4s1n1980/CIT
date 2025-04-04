import React from 'react';
import './VideoSection.css';

const VideoSeccion = () => {
  return (
    <section className="video-seccion">
      <div className="video-container">
        <h2 className="video-titulo">Bienvenido a Nuestra Comunidad</h2>
        <p className="video-parrafo">
          Descubre quiénes somos y por qué nuestra comunidad es un lugar para crecer, aprender y conectar.
        </p>
        <div className="video-wrapper">
          <video controls autoPlay loop muted className="video-intro">
            <source src="https://cit-backend-iuqy.onrender.com/uploads/1743761638991.mp4" type="video/mp4" />
            Tu navegador no admite el video.
          </video>
        </div>
        <a href="/nosotros" className="video-boton">Conócenos más</a>
      </div>
    </section>
  );
};

export default VideoSeccion;
