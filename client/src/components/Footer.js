import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import MapComponent from "../components/MapComponent"; 
import Newsletter from './Newsletter';

const Footer = () => {

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>Comunitat Islàmica Tordera</h3>
                    <p><FontAwesomeIcon icon={faPhone} /> (+34) 630 630 630</p>
                    <p>Tel: (+34) 630 630 630</p>
                    <div className="social-icons">
                    <a href="https://www.facebook.com/profile.php?id=61574460066780" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faFacebook} />
                    </a>
                    <a href="https://www.instagram.com/comunidadislamicatordera/" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faInstagram} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faTwitter} />
                    </a>
                    <a href="https://www.youtube.com/@comunidadislamicatordera" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faYoutube} />
                    </a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Links</h4>
                    <ul>
                        <li><a href="/nosotros">Acerca de Nosotros</a></li>
                        <li><Link to="/privacy">Política de Privacidad</Link></li>
                        <li><Link to="/terms">Condiciones de Uso</Link></li>
                        <li><a href="/sitemap">Mapa del Sitio</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Mapa del Sitio</h4>
                    <MapComponent />
                </div>

                <div className="footer-section">
                    <Newsletter />
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2023 CIT. Todos los derechos reservados.</p>
                <a href="https://wa.me/662031368" target="_blank" rel="noopener noreferrer" className="whatsapp-button">
                    WhatsApp
                </a>
            </div>
        </footer>
    );
};

export default Footer;
