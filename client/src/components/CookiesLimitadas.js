import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CookiesLimitadas.css';

const CookiesLimitadas = () => {
  const navigate = useNavigate();

  return (
    <div className="cookies-limitadas">
      <h1>Acceso limitado</h1>
      <p>
        Has rechazado las cookies. Algunas funcionalidades pueden estar desactivadas.
        Puedes aceptar las cookies para mejorar tu experiencia.
      </p>
      <button onClick={() => navigate('/')}>Volver al Inicio</button>
    </div>
  );
};

export default CookiesLimitadas;
