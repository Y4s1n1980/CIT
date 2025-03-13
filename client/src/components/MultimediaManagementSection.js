import React, { useState, useEffect } from 'react';
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../services/firebase';
import './MultimediaManagementSection.css';

const MultimediaManagementSection = ({ isAdmin }) => {
  const [multimedia, setMultimedia] = useState([]);
  const [preview, setPreview] = useState(null);

  // Estados para “Ver más”
  const [pendingItemsToShow, setPendingItemsToShow] = useState(6);
  const [approvedItemsToShow, setApprovedItemsToShow] = useState(6);

  // Cargar multimedia desde Firestore
  useEffect(() => {
    const multimediaCollection = collection(db, 'multimedia');
    const q = query(multimediaCollection, orderBy('fechaSubida', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const multimediaData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setMultimedia(multimediaData);
    });

    return () => unsubscribe(); // Limpiar suscripción al desmontar
  }, []);

  // Aprobar multimedia (cambia estado de "pendiente" a "aprobado")
  const handleApproveMultimedia = async (multimediaId) => {
    try {
      const multimediaDocRef = doc(db, 'multimedia', multimediaId);
      await updateDoc(multimediaDocRef, { estado: 'aprobado' });

      setMultimedia((prev) =>
        prev.map((item) =>
          item.id === multimediaId ? { ...item, estado: 'aprobado' } : item
        )
      );
    } catch (error) {
      console.error('Error al aprobar multimedia:', error);
    }
  };

  // Activar/Desactivar multimedia ya aprobada
  const handleToggleMultimedia = async (multimediaId, estadoActual) => {
    try {
      const nuevoEstado =
        estadoActual === 'aprobado' ? 'desactivado' : 'aprobado';
      const multimediaDocRef = doc(db, 'multimedia', multimediaId);

      await updateDoc(multimediaDocRef, { estado: nuevoEstado });

      setMultimedia((prev) =>
        prev.map((item) =>
          item.id === multimediaId ? { ...item, estado: nuevoEstado } : item
        )
      );
    } catch (error) {
      console.error(`Error al cambiar estado:`, error);
    }
  };

  // Rechazar multimedia (borra el doc en Firestore)
  const handleRejectMultimedia = async (multimediaId) => {
    try {
      await deleteDoc(doc(db, 'multimedia', multimediaId));
      setMultimedia((prev) => prev.filter((item) => item.id !== multimediaId));
    } catch (error) {
      console.error('Error al rechazar multimedia:', error);
    }
  };

  // Eliminar multimedia aprobada (similar a rechazar, pero en otra sección)
  const handleDeleteMultimedia = async (multimediaId) => {
    try {
      await deleteDoc(doc(db, 'multimedia', multimediaId));
      setMultimedia((prev) => prev.filter((item) => item.id !== multimediaId));
    } catch (error) {
      console.error('Error al eliminar multimedia:', error);
    }
  };

  // Previsualizar multimedia (abre modal)
  const handlePreview = (item) => setPreview(item);
  const closePreview = () => setPreview(null);

  // Filtrar en pendientes y aprobadas/desactivadas
  const pendingItems = multimedia.filter((item) => item.estado === 'pendiente');
  const approvedItems = multimedia.filter(
    (item) => item.estado === 'aprobado' || item.estado === 'desactivado'
  );

  // Cortar la lista según “Ver más”
  const displayedPending = pendingItems.slice(0, pendingItemsToShow);
  const displayedApproved = approvedItems.slice(0, approvedItemsToShow);

  // Handlers para “Ver más”
  const handleShowMorePending = () =>
    setPendingItemsToShow((prev) => prev + 6);
  const handleShowMoreApproved = () =>
    setApprovedItemsToShow((prev) => prev + 6);

  return (
    <section className="multimedia-management">
      <h3>Multimedia Pendiente</h3>

      {/* Mensaje cuando no hay multimedia pendiente */}
      {pendingItems.length === 0 && (
        <div className="empty-state-card">
          <h4>No hay multimedia pendiente</h4>
          <p>Por ahora no hay contenido pendiente de aprobación.</p>
        </div>
      )}

      <div className="pending-multimedia">
        {displayedPending.map((item) => (
          <div key={item.id} className="multimedia-card">
            {item.tipo === 'video' ? (
              <video
                src={item.url}
                controls
                onClick={() => handlePreview(item)}
              />
            ) : (
              <audio src={item.url} controls />
            )}
            <h4>{item.titulo || 'Sin título'}</h4>
            <p>{item.autor || 'Desconocido'}</p>
            <div className="actions">
              {/* Botón Aprobar */}
              <button onClick={() => handleApproveMultimedia(item.id)}>
                Aprobar
              </button>
              {/* Botón Rechazar (elimina) */}
              <button onClick={() => handleRejectMultimedia(item.id)}>
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ver más en pendientes, solo si quedan más por mostrar */}
      {displayedPending.length < pendingItems.length && (
        <button className="load-more-button" onClick={handleShowMorePending}>
          Ver más
        </button>
      )}

      <h3 style={{ marginTop: '40px' }}>Multimedia Aprobada</h3>
      {approvedItems.length === 0 && (
        <div className="empty-state-card">
          <h4>No hay multimedia aprobada</h4>
          <p>Cuando apruebes contenido, aparecerá aquí.</p>
        </div>
      )}
      <div className="approved-multimedia">
        {displayedApproved.map((item) => (
          <div
            key={item.id}
            className={`multimedia-card ${
              item.estado === 'desactivado' ? 'desactivated' : ''
            }`}
          >
            {item.tipo === 'video' ? (
              <video src={item.url} controls />
            ) : (
              <audio src={item.url} controls />
            )}
            <h4>{item.titulo || 'Sin título'}</h4>
            <p>{item.autor || 'Desconocido'}</p>
            <div className="actions">
              {/* Activar/Desactivar */}
              <button onClick={() => handleToggleMultimedia(item.id, item.estado)}>
                {item.estado === 'aprobado' ? 'Desactivar' : 'Activar'}
              </button>

              {/* Eliminar definitivo (solo si isAdmin, si lo deseas) */}
              {isAdmin && (
                <button onClick={() => handleDeleteMultimedia(item.id)}>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ver más en aprobados, solo si quedan más por mostrar */}
      {displayedApproved.length < approvedItems.length && (
        <button className="load-more-button" onClick={handleShowMoreApproved}>
          Ver más
        </button>
      )}

      {/* Modal de previsualización */}
      {preview && (
        <div className="preview-modal">
          <div className="preview-content">
            <button className="close-button" onClick={closePreview}>
              X
            </button>
            {preview.tipo === 'video' ? (
              <video src={preview.url} controls autoPlay />
            ) : (
              <audio src={preview.url} controls autoPlay />
            )}
            <h4>{preview.titulo}</h4>
            <p>{preview.autor}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default MultimediaManagementSection;
