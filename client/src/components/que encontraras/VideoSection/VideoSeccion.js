import React from 'react';
import './VideoSection.css';

const VideoSeccion = () => (
    <section className="video-seccion">
          <p>Este breve video te da una idea de todo lo que hacemos</p>
        <video controls muted autoPlay loop>
        <source src="/videos/video-pagina.mp4" type="video/mp4" />

            Tu navegador no admite el video.
        </video>
    </section>
);

export default VideoSeccion;
