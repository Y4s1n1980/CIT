import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, getDoc, addDoc, collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext'; 
import './Articulo.css';

const Articulo = () => {
    const { id } = useParams();
    const { currentUser } = useAuth(); 
    const [article, setArticle] = useState(null);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchArticle = async () => {
            const articleRef = doc(db, 'articulos', id);
            const articleSnap = await getDoc(articleRef);
            if (articleSnap.exists()) {
                setArticle(articleSnap.data());
            } else {
                console.log("No se encontró el artículo");
            }
        };

        const fetchComments = () => {
            const commentsRef = collection(db, 'comentarios');
            const q = query(commentsRef, where('articleId', '==', id));
            onSnapshot(q, (snapshot) => {
                const commentsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setComments(commentsData);
            });
        };

        fetchArticle();
        fetchComments();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (comment.trim() && currentUser) {
            try {
                await addDoc(collection(db, 'comentarios'), {
                    autor: currentUser.displayName || "Anónimo",
                    autorEmail: currentUser.email || "Sin email",
                    contenido: comment,
                    fecha: Timestamp.now(),
                    articleId: id,
                });
                setComment('');
            } catch (error) {
                console.error("Error al enviar el comentario:", error);
            }
        }
    };

    if (!article) {
        return <p>Cargando...</p>;
    }

    return (
        <div className="articulo-page">
            <h1>{article.titulo}</h1>
            {article.imagenUrl && (
                <img src={article.imagenUrl} alt="Imagen del artículo" className="article-image" />
            )}
            <p>{article.contenido}</p>

            <div className="comments-section">
                <h3>Comentarios</h3>
                {comments.map((comment) => (
                    <div key={comment.id} className="user-comment">
                        <p><strong>{comment.autor}</strong> ({comment.autorEmail})</p>
                        <p>{comment.contenido}</p>
                        <p className="comment-date">{new Date(comment.fecha.toDate()).toLocaleString()}</p>
                    </div>
                ))}
                <form onSubmit={handleCommentSubmit} className="comment-form">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Deja un comentario..."
                    ></textarea>
                    <button type="submit">Enviar</button>
                </form>
            </div>
        </div>
    );
};

export default Articulo;