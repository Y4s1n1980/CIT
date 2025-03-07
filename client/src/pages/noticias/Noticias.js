import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import './Noticias.css';
import { Link } from 'react-router-dom';

const Noticias = () => {
    const [noticias, setNoticias] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const noticiasPorPagina = 4;

    useEffect(() => {
        const fetchNoticias = async () => {
            try {
                const noticiasCollection = collection(db, 'noticias');
                const q = query(noticiasCollection, orderBy('fechaCreacion', 'desc'));
                const querySnapshot = await getDocs(q);
                const noticiasData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setNoticias(noticiasData);
            } catch (error) {
                console.error('Error al cargar noticias:', error);
            }
        };

        fetchNoticias();
    }, []);

    const indexOfLastNoticia = currentPage * noticiasPorPagina;
    const indexOfFirstNoticia = indexOfLastNoticia - noticiasPorPagina;
    const currentNoticias = noticias.slice(indexOfFirstNoticia, indexOfLastNoticia);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="noticias-page">
            <h1 className="noticias-page-title">Últimas Noticias</h1>
            <div className="noticias-page-grid">
                {currentNoticias.map((noticia) => (
                    <div key={noticia.id} className="noticias-page-card">
                        <img
                            src={noticia.imagenUrl || '/default-image.png'}
                            alt={noticia.titulo}
                            className="noticias-page-image"
                             loading="lazy"
                        />
                        <div className="noticias-page-content">
                            <h3>{noticia.titulo || 'Sin título'}</h3>
                            <p>{noticia.descripcion || 'Descripción no disponible'}</p>
                            <Link
                                to={`/noticias/${noticia.id}`}
                                className="noticias-page-read-more-button"
                            >
                                Leer más
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            <div className="noticias-page-pagination">
                {Array.from(
                    { length: Math.ceil(noticias.length / noticiasPorPagina) },
                    (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={
                                currentPage === index + 1 ? 'active' : ''
                            }
                        >
                            {index + 1}
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export default Noticias;
