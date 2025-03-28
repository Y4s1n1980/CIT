import React from 'react';
import './ProgramaSemanalSection.css';


const ProgramaSemanalSection = ({
  weeklyPrograms,
  currentWeeklyPrograms,
  expandedWeeklyId,
  handleWeeklyCardClick,
  weeklyCurrentPage,
  weeklyTotalPages,
  handleWeeklyPrevPage,
  handleWeeklyNextPage
}) => {
  return (
    <section className="programa-semanal-section">
      <h2>Programa Semanal</h2>
      {weeklyPrograms.length === 0 ? (
        <p>No hay programas semanales disponibles.</p>
      ) : (
        <>
          <div className="documents-grid-programa">
            {currentWeeklyPrograms.map((programa) => (
              <div
                key={programa.id}
                className={`programa-semanal-item ${expandedWeeklyId === programa.id ? 'expanded' : ''}`}
                onClick={() => handleWeeklyCardClick(programa.id)}
              >
                <p><strong>Día:</strong> {typeof programa.day === 'object' && programa.day?.toDate
                  ? programa.day.toDate().toLocaleDateString()
                  : programa.day}</p>
                <p><strong>Clase:</strong> {programa.class}</p>
                <p><strong>Profesor:</strong> {programa.teacher}</p>
                <p><strong>Tema:</strong> {programa.subject}</p>
                {expandedWeeklyId === programa.id && (
                  <div className="expanded-content">
                    <p>Detalles adicionales del programa semanal.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="pagination-controls">
            <button onClick={handleWeeklyPrevPage} disabled={weeklyCurrentPage === 1}>Anterior</button>
            <span>{weeklyCurrentPage} / {weeklyTotalPages}</span>
            <button onClick={handleWeeklyNextPage} disabled={weeklyCurrentPage === weeklyTotalPages}>Siguiente</button>
          </div>
        </>
      )}
    </section>
  );
};

export default ProgramaSemanalSection;
