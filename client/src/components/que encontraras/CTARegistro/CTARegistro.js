import React from 'react';
import { Link } from 'react-router-dom';
import './CTARegistro.css';


const CTARegistro = () => (
    <section className="cta-registro">
        <Link to="/registro" className="btn-registro">¡Únete Ahora!</Link>
    </section>
);

export default CTARegistro;
