import React from 'react';
import './DocumentosSection.css';


const DocumentosSection = ({
  loadingDocuments,
  currentDocs,
  expandedCardId,
  handleCardClick,
  docPage,
  totalDocPages,
  handleDocPrevPage,
  handleDocNextPage
}) => {
  return (
    <section className="documentos-section">
      <h2>Documentos Escuela Disponibles</h2>
      {loadingDocuments ? (
        <p>Cargando documentos...</p>
      ) : (
        <>
          <div className="documents-grid-documentos">
            {currentDocs.map((doc) => (
              <div
                key={doc.id}
                className={`documento-card ${expandedCardId === doc.id ? 'expanded' : ''}`}
                onClick={() => handleCardClick(doc.id)}
              >
                <h3>{doc.title}</h3>
                <p>{doc.description}</p>
                <p>Clase: {doc.class}</p>
                {doc.fileUrl && (
                  <a href={doc.fileUrl} download={doc.title} rel="noopener noreferrer">
                    Descargar
                  </a>
                )}
                {expandedCardId === doc.id && (
                  <div className="expanded-content">
                    <p>Aquí podrías mostrar detalles adicionales, etc.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="pagination-controls">
            <button onClick={handleDocPrevPage} disabled={docPage === 1}>Anterior</button>
            <span>{docPage} / {totalDocPages}</span>
            <button onClick={handleDocNextPage} disabled={docPage === totalDocPages}>Siguiente</button>
          </div>
        </>
      )}
    </section>
  );
};

export default DocumentosSection;
