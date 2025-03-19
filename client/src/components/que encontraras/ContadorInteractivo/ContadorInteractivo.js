import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import './ContadorInteractivo.css';

const ContadorInteractivo = () => {
  const datosRapidos = [
    { etiqueta: 'Usuarios Activos', cantidad: 500 },
    { etiqueta: 'Eventos Realizados', cantidad: 120 },
    { etiqueta: 'Comentarios', cantidad: 1350 },
  ];

  return (
    <section className="contador-section">
      <h2 className="contador-titulo">Únete y participa activamente</h2>
      <div className="contador-container">
        {datosRapidos.map((dato, index) => (
          <motion.div
            className="contador-item"
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.4 }}
          >
            <div className="contador-circulo">
              <CountUp
                start={0}
                end={dato.cantidad}
                duration={3}
                delay={0.2}
                suffix="+"
                enableScrollSpy
                scrollSpyDelay={200}
              >
                {({ countUpRef }) => (
                  <span className="contador-numero" ref={countUpRef} />
                )}
              </CountUp>
            </div>
            <span className="contador-etiqueta">{dato.etiqueta}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ContadorInteractivo;
