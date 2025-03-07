import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import './MultimediaManagementSection.css';

    const MultimediaManagementSection = ({ isAdmin }) => {
    const [multimedia, setMultimedia] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [preview, setPreview] = useState(null); // Previsualización
    const itemsPerPage = 5;
    const totalPages = Math.ceil(multimedia.length / itemsPerPage);
    
    // Cargar multimedia desde Firestore

useEffect(() => {
    const multimediaCollection = collection(db, "multimedia");
    const q = query(multimediaCollection, orderBy("fechaSubida", "desc"));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const multimediaData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMultimedia(multimediaData);
    });
  
    return () => unsubscribe(); // Limpiar suscripción al desmontar
  }, []);

    const handleApproveMultimedia = async (multimediaId) => {
        try {
            const multimediaDocRef = doc(db, 'multimedia', multimediaId);
            await updateDoc(multimediaDocRef, { estado: 'aprobado' });

            setMultimedia(
                multimedia.map((item) =>
                    item.id === multimediaId ? { ...item, estado: 'aprobado' } : item
                )
            );
        } catch (error) {
            console.error('Error al aprobar multimedia:', error);
        }
    };


    // ✅ Alternar Activar/Desactivar multimedia
    const handleToggleMultimedia = async (multimediaId, estadoActual) => {
        try {
            const nuevoEstado = estadoActual === 'aprobado' ? 'desactivado' : 'aprobado';
            const multimediaDocRef = doc(db, 'multimedia', multimediaId);
            await updateDoc(multimediaDocRef, { estado: nuevoEstado });

            setMultimedia(
                multimedia.map((item) =>
                    item.id === multimediaId ? { ...item, estado: nuevoEstado } : item
                )
            );
        } catch (error) {
            console.error(`Error al cambiar estado a ${estadoActual}:`, error);
        }
    };
    

    // Rechazar multimedia
    const handleRejectMultimedia = async (multimediaId) => {
        try {
            await deleteDoc(doc(db, 'multimedia', multimediaId));
            setMultimedia(multimedia.filter((item) => item.id !== multimediaId));
        } catch (error) {
            console.error('Error al rechazar multimedia:', error);
        }
    };

     // Paginación
     const paginatedItems = multimedia
     .filter((item) => item.estado === "pendiente")
     .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

const paginatedApprovedItems = multimedia
  .filter((item) => item.estado === "aprobado" || item.estado === "desactivado")
  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

     const changePage = (pageNumber) => setCurrentPage(pageNumber);
 
     // Previsualizar multimedia
     const handlePreview = (item) => setPreview(item);
     const closePreview = () => setPreview(null);

    return (
        <section className="multimedia-management">

            <h3>Multimedia Pendiente</h3>

{/* Mensaje cuando no hay multimedia pendiente */}
{paginatedItems.length === 0 && (
  <div className="empty-state-card">
    <h4>No hay multimedia pendiente</h4>
    <p>Por ahora no hay contenido pendiente de aprobación.</p>
  </div>
)}

<div className="pending-multimedia">
  {paginatedItems.map((item) => (
    <div key={item.id} className="multimedia-card">
      {item.tipo === "video" ? (
        <video src={item.url} controls onClick={() => handlePreview(item)} />
      ) : (
        <audio src={item.url} controls />
      )}
      <h4>{item.titulo || "Sin título"}</h4>
      <p>{item.autor || "Desconocido"}</p>
      <div className="actions">
        <button onClick={() => handleApproveMultimedia(item.id)}>Aprobar</button>
        <button onClick={() => handleRejectMultimedia(item.id)}>Rechazar</button>
      </div>
    </div>
  ))}
</div>



            <div className="approved-multimedia">
  {paginatedApprovedItems.map((item) => (
    <div key={item.id} className={`multimedia-card ${item.estado === "desactivado" ? "desactivated" : ""}`}>
      {item.tipo === "video" ? (
        <video src={item.url} controls />
      ) : (
        <audio src={item.url} controls />
      )}
      <h4>{item.titulo || "Sin título"}</h4>
      <p>{item.autor || "Desconocido"}</p>
      <div className="actions">
        <button onClick={() => handleToggleMultimedia(item.id, item.estado)}>
          {item.estado === "aprobado" ? "Desactivar" : "Activar"}
        </button>
      </div>
    </div>
  ))}
</div>

            {/* Paginación */}
            <div className="pagination-multimedia">
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => changePage(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

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
