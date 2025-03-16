import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Blog.css';

const Blog = () => {
  const { currentUser, isAdmin } = useAuth();

  // Controlar la visibilidad del formulario
  const [showForm, setShowForm] = useState(false);

  // Campos del formulario
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Estado de carga (spinner, etc.)
  const [loading, setLoading] = useState(false);

  // Artículos ya aprobados
  const [approvedArticles, setApprovedArticles] = useState([]);

  // Nuevo estado para “ver más”
  const [articlesToShow, setArticlesToShow] = useState(4); // Mostramos 4 inicialmente (puedes cambiar a 6)

  useEffect(() => {
    const fetchApprovedArticles = async () => {
      try {
        const articlesCollection = collection(db, 'articulos');
        const articlesSnapshot = await getDocs(articlesCollection);
        const approved = articlesSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((article) => article.estado === 'aprobado');
        setApprovedArticles(approved);
      } catch (error) {
        console.error('Error al cargar artículos aprobados:', error);
      }
    };
    fetchApprovedArticles();
  }, []);

  // Subir imagen (ejemplo de tu fetch al /upload)
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
      return data.fileUrl || null;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      return null;
    }
  };

  // Manejar envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    try {
      const newArticle = {
        autor: author || currentUser?.displayName || 'Desconocido',
        autorId: currentUser?.uid || null,
        email: email || currentUser?.email || 'Email desconocido',
        titulo: title,
        contenido: content,
        tags: tags,
        imagenUrl: imageUrl || '',
        estado: isAdmin ? 'aprobado' : 'pendiente',
        fechaEnvio: Timestamp.now(),
      };

      await addDoc(collection(db, 'articulos'), newArticle);
      alert('Artículo enviado para revisión.');

      // Limpiar formulario
      setTitle('');
      setContent('');
      setTags('');
      setAuthor('');
      setEmail('');
      setImageFile(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error al enviar el artículo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Artículos que se muestran (limitados por articlesToShow)
  const displayedArticles = approvedArticles.slice(0, articlesToShow);

  // Handler para el botón “Ver más”
  const handleShowMore = () => {
    // Ajusta cuántos artículos más quieres mostrar al hacer clic (puede ser +4 o +6)
    setArticlesToShow((prev) => prev + 4);
  };

  return (
    <div className="blog-page">
      {/* Botón para mostrar/ocultar formulario */}
      <button onClick={() => setShowForm(!showForm)} className="write-article-button">
        Escribir un Artículo
      </button>

      {/* Formulario de creación de artículo */}
      {showForm && (
        <form className="article-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Autor"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            placeholder="Contenido"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Tags (separados por comas)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Artículo'}
          </button>
        </form>
      )}

      {/* Sección de artículos aprobados */}
      <div className="articles-section">
        <div className="article-cards">
          {displayedArticles.map((article) => (
            <div key={article.id} className="article-card">
              <h2>{article.titulo}</h2>
              {article.imagenUrl && (
                <img
                  src={article.imagenUrl}
                  alt="Artículo"
                  className="article-thumbnail"
                />
              )}
              <p>{article.contenido.slice(0, 100)}...</p>
              <Link to={`/blog/${article.id}`} className="read-more-button">
                Leer más
              </Link>
            </div>
          ))}
        </div>

        {/* Botón “Ver más” (solo si hay más artículos por mostrar) */}
        {displayedArticles.length < approvedArticles.length && (
          <div className="see-more-container">
            <button className="see-more-button" onClick={handleShowMore}>
              Ver más
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
