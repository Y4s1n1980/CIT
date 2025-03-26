// src/components/CookieBanner.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './CookieBanner.css';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const consent = Cookies.get('cookieConsent');
    if (!consent && location.pathname !== '/privacy' && location.pathname !== '/terms') {
      setShowBanner(true);
    }
  }, [location.pathname]);

  const acceptCookies = () => {
    Cookies.set('cookieConsent', 'true', { expires: 365 });
    setShowBanner(false);
  };

  const declineCookies = () => {
    Cookies.remove('cookieConsent');
    Cookies.set('cookieConsent', 'false', { expires: 1 });
    setShowBanner(false);
    navigate('/explora');
  };

  // Para volver a mostrar el banner si el usuario declina y luego navega
  useEffect(() => {
    const consent = Cookies.get('cookieConsent');
    if (consent === 'false') {
      Cookies.remove('cookieConsent');
    }
  }, [location.pathname]);

  // Geolocalización solo para Europa
  useEffect(() => {
    const checkConsent = () => {
      const consent = Cookies.get('cookieConsent');
      const isLegalPage = location.pathname === '/privacy' || location.pathname === '/terms';
      if (consent || isLegalPage) return;

      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data && data.continent_code === 'EU') {
            setShowBanner(true);
          }
        })
        .catch(() => {
          setShowBanner(true); // fallback
        });
    };

    checkConsent();
  }, [location.pathname]);

  if (['/privacy', '/terms', '/cookies-bloqueadas'].includes(location.pathname)) return null;

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
