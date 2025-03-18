// src/Layout/PublicLayout.js
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CookieBanner from '../components/CookieBanner';

const PublicLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // Forzar scroll al tope al cambiar de ruta
    window.scrollTo(0, 0);
    // Restablecer cualquier estilo global modificado (ejemplo)
    document.body.style.marginTop = '0';
  }, [location.pathname]);

  return (
    <>
      {/* Remontamos el Navbar para que se reinicie */}
      <Navbar key={location.pathname} />
      <Outlet />
      <CookieBanner />
    </>
  );
};

export default PublicLayout;
