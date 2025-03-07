import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './ArticleManagementSection.css';

const ArticleManagementSection = () => {
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 5;
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const articlesCollection = collection(db, 'articulos');
                const articlesSnapshot = await getDocs(articlesCollection);
                const fetchedArticles = articlesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                
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

    const uploadImage = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('http://localhost:5000/upload-image', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            return data.imageUrl || null;
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            return null;
        }
    };

    const handleApproveArticle = async (articleId) => {
        try {
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }
            const updateData = { estado: 'aprobado', fechaAprobacion: new Date() };
            if (imageUrl) {
                updateData.imagenUrl = imageUrl;
            }
            await updateDoc(doc(db, 'articulos', articleId), updateData);
            setArticles((prevArticles) =>
                prevArticles.map((article) =>
                    article.id === articleId ? { ...article, ...updateData } : article
                )
            );
        } catch (error) {
            console.error('Error al aprobar el artículo:', error);
        }
    };

    const handleDeleteArticle = async (articleId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
            await deleteDoc(doc(db, 'articulos', articleId));
            setArticles((prev) => prev.filter((article) => article.id !== articleId));
        }
    };

    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
    const totalPages = Math.ceil(articles.length / articlesPerPage);

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
                    {currentArticles.map((article) => (
                        <tr key={article.id}>
                            <td>{article.id}</td>
                            <td>{article.titulo}</td>
                            <td>{article.autor}</td>
                            <td>{article.estado}</td>
                            <td>
                                {article.estado === 'pendiente' && (
                                    <div>
                                        <button onClick={() => handleApproveArticle(article.id)} className="approve-button">
                                            Aprobar
                                        </button>
                                    </div>
                                )}
                                <button onClick={() => handleDeleteArticle(article.id)} className="delete-button">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    Anterior
                </button>
                {[...Array(totalPages)].map((_, index) => (
                    <button key={index} onClick={() => setCurrentPage(index + 1)} className={currentPage === index + 1 ? 'active' : ''}>
                        {index + 1}
                    </button>
                ))}
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Siguiente
                </button>
            </div>
        </section>
    );
};

export default ArticleManagementSection;
