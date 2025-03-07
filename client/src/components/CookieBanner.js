// src/components/CookieBanner.js
import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'true');
        setShowBanner(false);
    };

    return (
        showBanner && (
            <div className="cookie-banner">
                <p>Este sitio usa cookies para mejorar tu experiencia. Al continuar, aceptas nuestro uso de cookies.</p>
                <button onClick={acceptCookies}>Aceptar</button>
            </div>
        )
    );
};

export default CookieBanner;
