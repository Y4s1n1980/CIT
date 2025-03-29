import React from 'react';
import './CalendarioSection.css';

const CalendarioSection = () => {
  return (
    <section className="calendario-section">
      <h2>Calendario Escolar</h2>
      <div className="calendario-wrapper">
        <iframe
          title="Calendario Escolar"
          className="calendario-embed"
          src="https://calendar.google.com/calendar/embed?src=comunidadislamicatordera%40gmail.com&ctz=Europe%2FMadrid"
          frameBorder="0"
          scrolling="no"
        ></iframe>
      </div>
    </section>
  );
};

export default CalendarioSection;

