import React from 'react';
import './RedesSocialesPrev.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

const RedesSocialesPrev = () => {
  return (
    <section className="redes-sociales-prev">
      <h2>Síguenos en Redes Sociales</h2>
      <div className="redes-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faFacebook} className="social-icon facebook" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} className="social-icon instagram" />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faYoutube} className="social-icon youtube" />
        </a>
      </div>
    </section>
  );
};

export default RedesSocialesPrev;
