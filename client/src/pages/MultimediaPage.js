// src/components/MultimediaPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import UserMultimediaUpload from '../components/UserMultimediaUpload';
import './MultimediaPage.css';

const MultimediaPage = () => {
  const [multimedia, setMultimedia] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    const collectionRef = collection(db, 'multimedia');
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const multimediaData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => item.estado === 'aprobado')
          .sort((a, b) => Date.parse(b.fechaSubida) - Date.parse(a.fechaSubida));
        setMultimedia(multimediaData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar multimedia:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const paginatedMultimedia = useMemo(
    () => multimedia.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [multimedia, currentPage]
  );

  const totalPages = useMemo(
    () => Math.ceil(multimedia.length / itemsPerPage),
    [multimedia.length, itemsPerPage]
  );

  return (
    <div className="multimedia-page">
      <button className="toggle-form-button" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Ocultar Formulario' : 'Subir Multimedia'}
      </button>
      {showForm && <UserMultimediaUpload />}

      {loading ? (
        <p className="loading-message">Cargando multimedia...</p>
      ) : (
        <>
          <div className="multimedia-grid">
          {paginatedMultimedia.length > 0 ? (
  paginatedMultimedia.map((item) => (
    <div key={item.id} className="multimedia-card" onClick={() => setSelectedMedia(item)}>
      {item.tipo === "video" ? (
        <video controls src={item.url ? item.url : "https://www.comunidadislamicatordera.org/placeholder-video.mp4"} />
      ) : (
        <audio controls src={item.url ? item.url : "https://www.comunidadislamicatordera.org/placeholder-audio.mp3"} />
      )}
      <h4>{item.titulo || "Sin título"}</h4>
      <p>{item.autor || "Desconocido"}</p>
    </div>
  ))
) : (
  <p>No hay multimedia disponible.</p>
)}

          </div>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={currentPage === index + 1 ? 'active' : ''}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedMedia && <ModalMedia media={selectedMedia} onClose={() => setSelectedMedia(null)} />}
    </div>
  );
};

const ModalMedia = ({ media, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {media.tipo === 'video' ? (
        <video controls src={media.url || ''} autoPlay aria-label={media.titulo || 'Video'}>
          Tu navegador no soporta videos.
        </video>
      ) : (
        <div>
          <img
            src={media.imagenUrl || '/placeholder-image.webp'}
            alt={media.titulo || 'Sin título'}
            className="modal-image"
          />
          <audio controls src={media.url || ''} aria-label={media.titulo || 'Audio'}>
            Tu navegador no soporta audios.
          </audio>
        </div>
      )}
      <h4>{media.titulo || 'Sin título'}</h4>
      <p>{media.autor || 'Desconocido'}</p>
      <button className="close-modal-button" onClick={onClose} aria-label="Cerrar modal">
        X
      </button>
    </div>
  </div>
);

export default MultimediaPage;
