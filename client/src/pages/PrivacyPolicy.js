// src/pages/PrivacyPolicy.js
import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="legal-container">
            <h1>Política de Privacidad</h1>
            <p>
            Bienvenido a Comunidad Islámica Tordera. Respetamos tu privacidad y nos comprometemos a proteger tus datos personales.
            </p>
            <h2>1. Datos que recopilamos</h2>
            <p>- Nombre y correo electrónico cuando te suscribes o contactas con nosotros.<br></br>
               - Datos de navegación recopilados mediante cookies.</p>
            <h2>2. Uso de los datos</h2>
            <p>- Para responder consultas y mejorar nuestros servicios.<br></br>
               - Para enviar boletines informativos si el usuario lo acepta.</p>
            <h2>3. Cookies</h2>
            <p>Utilizamos cookies para mejorar tu experiencia. Puedes gestionar tus preferencias en la configuración.</p>
            <h2>4. Derechos del usuario</h2>
            <p>-Tienes derecho a acceder, modificar y eliminar tus datos personales. Contáctanos si deseas ejercer estos derechos.<br></br>
                - No vendemos ni compartimos datos con terceros sin tu .<br></br>
                - Podemos compartir información con proveedores de servicios de pago o envío de correos.</p>
            <h2>5. Contacto</h2>
            <p>Si tienes dudas, escríbenos a <a href="mailto:comunidadislamicatordera@gmail.com">nuestro correo</a>.</p>
        </div>
    );
};

export default PrivacyPolicy;
