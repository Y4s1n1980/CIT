import React, { useState, useEffect } from 'react';
import './NoticiaDetalle.css';
import { useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';


const NoticiaDetalle = () => {
    const { id } = useParams(); // Obtener el ID de la noticia de la URL
    const [noticia, setNoticia] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const { currentUser } = useAuth();

    // Cargar la noticia seleccionada
    useEffect(() => {
        const fetchNoticia = async () => {
            const q = query(collection(db, 'noticias'), where('__name__', '==', id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const noticiaData = querySnapshot.docs[0].data();
                setNoticia({ id: querySnapshot.docs[0].id, ...noticiaData });
            }
        };

        fetchNoticia();
    }, [id]);

    // Cargar comentarios asociados a la noticia
    useEffect(() => {
        const fetchComentarios = async () => {
            const q = query(
                collection(db, 'comentarios'),
                where('noticiaId', '==', id),
                orderBy('fecha', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const comentariosData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComentarios(comentariosData);
        };

        fetchComentarios();
    }, [id]);

    // Agregar un nuevo comentario
    const handleAgregarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        try {
            await addDoc(collection(db, 'comentarios'), {
                noticiaId: id,
                usuario: currentUser.displayName || 'Usuario Anónimo',
                email: currentUser.email || 'Email no disponible',
                contenido: nuevoComentario,
                fecha: new Date()
            });
            setNuevoComentario('');
            // Recargar comentarios
            setComentarios((prev) => [
                {
                    noticiaId: id,
                    usuario: currentUser.displayName || 'Usuario Anónimo',
                    email: currentUser.email || 'Email no disponible',
                    contenido: nuevoComentario,
                    fecha: new Date()
                },
                ...prev
            ]);
        } catch (error) {
            console.error('Error al agregar comentario:', error);
        }
    };

    if (!noticia) {
        return <p>Cargando noticia...</p>;
    }

    return (
        <div className="noticia-detalle">
            <div className="noticia-header">
                <img src={noticia.imagenUrl} alt={noticia.titulo} className="noticia-imagen"  loading="lazy" />
                <h1 className="noticia-titulo">{noticia.titulo}</h1>
                <p className="noticia-autor">
                Por: {noticia.autorNombre || 'Autor desconocido'} |{' '}
                {noticia.fechaCreacion
                   ? new Date(noticia.fechaCreacion.seconds * 1000).toLocaleDateString()
                       : 'Fecha no disponible'}
                </p>
            </div>

            <div className="noticia-contenido">
                 <p>{noticia.contenidoCompleto || 'Contenido no disponible'}</p>
            </div>


            <div className="comentarios-section">
                <h2>Comentarios</h2>

                {currentUser ? (
                    <form className="comentario-form" onSubmit={handleAgregarComentario}>
                        <textarea
                            placeholder="Escribe tu comentario..."
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                        ></textarea>
                        <button type="submit">Agregar Comentario</button>
                    </form>
                ) : (
                    <p>
                        <a href="/auth">Inicia sesión</a> o <a href="/registro">regístrate</a> para
                        dejar un comentario.
                    </p>
                )}

                <div className="comentarios-lista">
                    {comentarios.length > 0 ? (
                        comentarios.map((comentario) => (
                            <div key={comentario.id} className="comentario-card">
                                <p>
                                  <strong>{comentario.usuario || 'Usuario desconocido'}</strong>:{' '}
                                  {comentario.fecha
                                  ? new Date(comentario.fecha).toLocaleString()
                                  : 'Fecha no disponible'}
                                  </p>

                                <p>{comentario.contenido}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay comentarios todavía.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoticiaDetalle;
