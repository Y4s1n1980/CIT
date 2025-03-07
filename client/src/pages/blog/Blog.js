import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; 
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Blog.css';

const Blog = () => {
    const { currentUser } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [author, setAuthor] = useState('');
    const [email, setEmail] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [approvedArticles, setApprovedArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 3;

    useEffect(() => {
        const fetchApprovedArticles = async () => {
            const articlesCollection = collection(db, 'articulos');
            const articlesSnapshot = await getDocs(articlesCollection);
            const approved = articlesSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(article => article.estado === 'aprobado');
            setApprovedArticles(approved);
        };
        fetchApprovedArticles();
    }, []);

    const uploadImage = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('http://localhost:5000/upload', {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let imageUrl = null;
        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }

        try {
            const newArticle = {
                autor: author || currentUser.displayName,
                autorId: currentUser.uid,
                email: email || currentUser.email,
                titulo: title,
                contenido: content,
                tags: tags,
                imagenUrl: imageUrl || '',
                estado: 'pendiente',
                fechaEnvio: Timestamp.now(),
            };

            await addDoc(collection(db, 'articulos'), newArticle);
            alert('Artículo enviado para revisión');
            setTitle('');
            setContent('');
            setTags('');
            setAuthor('');
            setEmail('');
            setImageFile(null);
            setShowForm(false);
        } catch (error) {
            console.error("Error al enviar el artículo:", error);
        } finally {
            setLoading(false);
        }
    };

    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = approvedArticles.slice(indexOfFirstArticle, indexOfLastArticle);
    const totalPages = Math.ceil(approvedArticles.length / articlesPerPage);

    return (
        <div className="blog-page">
            <button onClick={() => setShowForm(!showForm)} className="write-article-button">
                Escribir un Artículo
            </button>

            {showForm && (
                <form className="article-form" onSubmit={handleSubmit}>
                    <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <input type="text" placeholder="Autor" value={author} onChange={(e) => setAuthor(e.target.value)} />
                    <input type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <textarea placeholder="Contenido" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
                    <input type="text" placeholder="Tags (separados por comas)" value={tags} onChange={(e) => setTags(e.target.value)} />
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                    <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Artículo'}</button>
                </form>
            )}

            <div className="articles-section">
                <div className="article-cards">
                    {currentArticles.map(article => (
                        <div key={article.id} className="article-card">
                            <h2>{article.titulo}</h2>
                            {article.imagenUrl && <img src={article.imagenUrl} alt="Artículo" className="article-thumbnail" />}
                            <p>{article.contenido.slice(0, 100)}...</p>
                            <Link to={`/blog/${article.id}`} className="read-more-button">Leer más</Link>
                        </div>
                    ))}
                </div>

                {/* Paginación */}
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
            </div>
        </div>
    );
};

export default Blog;