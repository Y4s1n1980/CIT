import React from 'react';
import { Link } from 'react-router-dom';
import './CursosSection.css';

const CursosSection = ({ lastCourse }) => {
  return (
    <section className="cursos-section">
      <h2>Cursos</h2>
      {lastCourse ? (
        <div className="last-course">
          <img src={lastCourse.imagenUrl} alt={lastCourse.titulo} className="last-course-image" />
          <div className="last-course-info">
            <h3>{lastCourse.titulo}</h3>
            <p>{lastCourse.descripcion}</p>
            <Link to="/cursos" className="more-courses-button">Más Cursos</Link>
          </div>
        </div>
      ) : (
        <p>Cargando último curso...</p>
      )}
    </section>
  );
};

export default CursosSection;
