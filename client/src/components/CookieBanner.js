// src/components/CookieBanner.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import './CookieBanner.css';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkConsent = () => {
      const consent = Cookies.get('cookieConsent');
      const isLegalPage = location.pathname === '/privacy' || location.pathname === '/terms';
      if (consent || isLegalPage) return;

      // Geolocalización para detectar si es Europa (EU)
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data && data.continent_code === 'EU') {
            setShowBanner(true);
          }
        })
        .catch(() => {
          // En caso de fallo, mostrar el banner como precaución
          setShowBanner(true);
        });
    };

    checkConsent();
  }, [location.pathname]);

  const acceptCookies = () => {
    Cookies.set('cookieConsent', 'true', { expires: 365 });
    setShowBanner(false);
  };

  const declineCookies = () => {
    Cookies.set('cookieConsent', 'false', { expires: 365 });
    setShowBanner(false);
  };

  if (location.pathname === '/privacy' || location.pathname === '/terms') return null;

  return (
    showBanner && (
      <div className="cookie-overlay">
        <div className="cookie-modal">
          <h2>Tu Privacidad Importa</h2>
          <p>
            Usamos cookies para personalizar tu experiencia y analizar nuestro tráfico,
            incluyendo servicios de terceros como Stripe e IslamicFinder.
            Al hacer clic en <strong>Aceptar</strong>, nos autorizas a hacerlo. <br />
            Consulta nuestras <a href="/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a> y <a href="/terms" target="_blank" rel="noopener noreferrer">Términos</a>.
          </p>
          <div className="cookie-actions">
            <button onClick={acceptCookies} className="btn accept">Aceptar</button>
            <button onClick={declineCookies} className="btn decline">Declinar</button>
          </div>
        </div>
      </div>
    )
  );
};

export default CookieBanner;
