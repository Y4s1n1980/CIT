// src/pages/Explora.js
import React from 'react';
import VideoSeccion from '../components/que encontraras/VideoSection/VideoSeccion';
import Funcionalidades from '../components/que encontraras/Funcionalidades/Funcionalidades';
import HeroExplora from '../components/que encontraras/HeroExplora/HeroExplora';
import TestimoniosPrev from '../components/que encontraras/TestimonioPrev/TestimoniosPrev';
import ContadorInteractivo from '../components/que encontraras/ContadorInteractivo/ContadorInteractivo';
import RedesSocialesPrev from '../components/que encontraras/RedesSociales/RedesSocialesPrev';
import CTARegistro from '../components/que encontraras/CTARegistro/CTARegistro';
import ContactoPrev from '../components/que encontraras/ContactoPrev/ContactoPrev';
import RamadanCountdown from '../components/que encontraras/RamadanCountdown/RamadanCountdown';


const Explora = () => {
    return (
        <div className="explora-page">
            <HeroExplora />
            <ContadorInteractivo />
            <VideoSeccion />
            <Funcionalidades />
            <RamadanCountdown />
            <TestimoniosPrev />
            <RedesSocialesPrev />
            <CTARegistro />
            <ContactoPrev />
        </div>
    );
};

export default Explora;
