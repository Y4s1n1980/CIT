import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './RamadanCountdown.css';

const RamadanCountdown = () => {
  const targetDate = new Date('2026-02-18T00:00:00').getTime();

  // ✅ Memoizamos la función con useCallback
  const calculateTimeLeft = useCallback(() => {
    const difference = targetDate - new Date().getTime();
    if (difference <= 0) return null;

    return {
      dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
      horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutos: Math.floor((difference / 1000 / 60) % 60),
      segundos: Math.floor((difference / 1000) % 60),
    };
  }, [targetDate]); // ✅ targetDate no cambia, así que la función se mantiene estable

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]); // ✅ Ahora ESLint no se quejará

  if (!timeLeft) {
    return <div className="ramadan-countdown-completo">¡Ya llegó el Ramadán!</div>;
  }

  return (
    <section className="ramadan-countdown-section">
      <div className="countdown-container">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="countdown-title">
          Próximo Ramadán
        </motion.h2>

        <div className="countdown-items">
          {Object.entries(timeLeft).map(([unidad, valor], index) => (
            <motion.div
              key={unidad}
              className="countdown-item"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <span className="valor">{valor}</span>
              <span className="unidad">{unidad.charAt(0).toUpperCase() + unidad.slice(1)}</span>
            </motion.div>
          ))}
        </div>

        <motion.a
          href="/eventos"
          className="btn-eventos"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          Todos los eventos
        </motion.a>
      </div>
    </section>
  );
};

export default RamadanCountdown;
