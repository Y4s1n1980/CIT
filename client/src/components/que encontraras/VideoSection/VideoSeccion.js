import React from 'react';
import './VideoSection.css';

const VideoSeccion = () => (
    <section className="video-seccion">
        <video controls muted autoPlay loop>
            <source src="/videos/intro.mp4" type="video/mp4" />
            Tu navegador no admite el video.
        </video>
    </section>
);

export default VideoSeccion;
