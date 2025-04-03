// src/components/Footer.js
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
                    <h3>Comunitat Islàmica Tordera - Mezquita</h3>
                    <p><FontAwesomeIcon icon={faPhone} /> Teléfono: (+34) 617 45 94 76</p>
                    <p>Dirección: Carrer Sant Antoni, 11, 08490 Tordera, Barcelona</p>
                    <p>Centro religioso, educativo y comunitario musulmán.</p>
                    <div className="social-icons">
                        <a href="https://www.facebook.com/profile.php?id=61574460066780" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FontAwesomeIcon icon={faFacebook} />
                        </a>
                        <a href="https://www.instagram.com/comunidadislamicatordera/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <FontAwesomeIcon icon={faTwitter} />
                        </a>
                        <a href="https://www.youtube.com/@comunidadislamicatordera" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <FontAwesomeIcon icon={faYoutube} />
                        </a>
                    </div>
                </div>

                <div className="footer-section">
                    
                    <ul>
                        <li><a href="/nosotros">Sobre la Comunidad</a></li>
                        <li><Link to="/privacy">Política de Privacidad</Link></li>
                        <li><Link to="/terms">Condiciones de Uso</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    
                    <MapComponent />
                </div>

                <div className="footer-section">
                    
                    <Newsletter />
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    © {new Date().getFullYear()} Comunitat Islàmica de Tordera. Todos los derechos reservados.
                    Centro Islámico, mezquita, oración y servicios comunitarios en Tordera.
                </p>
                <a href="https://wa.me/662031368" target="_blank" rel="noopener noreferrer" className="whatsapp-button" aria-label="WhatsApp">
                    WhatsApp
                </a>
            </div>
        </footer>
    );
};

export default Footer;
