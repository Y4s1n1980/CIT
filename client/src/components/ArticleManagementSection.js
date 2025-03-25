// ArticleManagementSection.js

import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import './ArticleManagementSection.css';

const ArticleManagementSection = () => {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  // 🔹 1) Objetos para almacenar archivo y URL de vista previa, indexados por articleId
  const [imageFiles, setImageFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesCollection = collection(db, 'articulos');
        const articlesSnapshot = await getDocs(articlesCollection);
        const fetchedArticles = articlesSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        // Ordenar artículos, primero los 'pendiente' (opcional)
        const sortedArticles = fetchedArticles.sort((a, b) => {
          if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
          if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
          return 0;
        });

        setArticles(sortedArticles);
      } catch (error) {
        console.error('Error al cargar los artículos:', error);
      }
    };
    fetchArticles();
  }, []);

  // 🔹 2) Función para subir la imagen al servidor
  const uploadImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      // Cambia la URL si tu endpoint es distinto
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      return data.fileUrl || null;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      return null;
    }
  };

  // 🔹 3) Manejo de aprobaciones
  const handleApproveArticle = async (articleId) => {
    try {
      // Tomamos el archivo según el articleId
      const file = imageFiles[articleId];
      console.log("Approving article:", articleId, "with file:", file);
      let imageUrl = null;
      if (file) {
        imageUrl = await uploadImage(file);
        console.log("Subido. URL devuelta:", imageUrl);
      }

      // Construimos el objeto con los cambios
      const updateData = {
        estado: 'aprobado',
        fechaAprobacion: new Date(),
      };
      if (imageUrl) {
        updateData.imagenUrl = imageUrl;
      }

      // Actualizamos el doc en Firestore
      await updateDoc(doc(db, 'articulos', articleId), updateData);

      // Actualizamos el estado local para que se reflejen cambios en pantalla
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === articleId ? { ...article, ...updateData } : article
        )
      );

      // (Opcional) Limpiar la vista previa y el archivo para este artículo
      setPreviewUrls((prev) => ({ ...prev, [articleId]: undefined }));
      setImageFiles((prev) => ({ ...prev, [articleId]: undefined }));

    } catch (error) {
      console.error('Error al aprobar el artículo:', error);
    }
  };

  // 🔹 4) Manejo de eliminación
  const handleDeleteArticle = async (articleId) => {
    if (
      window.confirm('¿Estás seguro de que deseas eliminar este artículo?')
    ) {
      await deleteDoc(doc(db, 'articulos', articleId));
      setArticles((prev) => prev.filter((article) => article.id !== articleId));

      // También podrías limpiar la imagen del state
      setPreviewUrls((prev) => {
        const copy = { ...prev };
        delete copy[articleId];
        return copy;
      });
      setImageFiles((prev) => {
        const copy = { ...prev };
        delete copy[articleId];
        return copy;
      });
    }
  };

  // 🔹 Paginación
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  // 🔹 Render del componente
  return (
    <section className="article-management">
      <h2>Gestión de Artículos</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentArticles.map((article) => {
            // Tomamos la URL de vista previa (si existe) para este artículo
            const previewUrl = previewUrls[article.id];

            return (
              <tr key={article.id}>
                <td>{article.id}</td>
                <td>{article.titulo}</td>
                <td>{article.autor}</td>
                <td>{article.estado}</td>
                <td>
                  {/* Solo mostramos input si está pendiente */}
                  {article.estado === 'pendiente' && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Input para subir imagen */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const fileSelected = e.target.files[0];
                          console.log("File selected for article:", article.id, fileSelected);
                          // Actualizamos state
                          setImageFiles((prev) => ({
                            ...prev,
                            [article.id]: fileSelected,
                          }));
                          // Generamos vista previa
                          setPreviewUrls((prev) => ({
                            ...prev,
                            [article.id]: fileSelected
                              ? URL.createObjectURL(fileSelected)
                              : undefined,
                          }));
                        }}
                      />
                      {/* Vista previa si existe */}
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          style={{ width: '100px', marginTop: '8px' }}
                        />
                      )}

                      {/* Botón aprobar */}
                      <button
                        onClick={() => handleApproveArticle(article.id)}
                        className="approve-button"
                      >
                        Aprobar
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="delete-button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
};

export default ArticleManagementSection;
