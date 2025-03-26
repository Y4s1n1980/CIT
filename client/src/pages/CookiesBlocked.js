// src/pages/CookiesBloqueadas.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CookiesBloqueadas.css';

const CookiesBloqueadas = () => {
  const navigate = useNavigate();

  const volverAtras = () => {
    navigate(-1);
  };

  return (
    <div className="cookies-blocked-container">
      <div className="cookies-blocked-content">
        <h1>Has rechazado las cookies</h1>
        <p>
          Entendemos tu decisión. Sin embargo, para poder usar correctamente este sitio
          web, necesitamos almacenar cookies esenciales que permiten funcionalidades básicas
          como navegación, autenticación y seguridad.
        </p>
        <p>
          Si cambias de opinión, puedes volver atrás y aceptar las cookies en el banner
          que aparecerá al navegar.
        </p>

        <div className="cookies-blocked-buttons">
          <button onClick={volverAtras} className="btn volver">
            Volver atrás
          </button>
          <a href="/privacy" className="btn info" target="_blank" rel="noopener noreferrer">
            Ver Política de Privacidad
          </a>
        </div>
      </div>
    </div>
  );
};

export default CookiesBloqueadas;
