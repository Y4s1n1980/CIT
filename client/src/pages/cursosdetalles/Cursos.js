import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './Cursos.css';

const Cursos = () => {
    const [cursos, setCursos] = useState([]);

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const cursosSnapshot = await getDocs(collection(db, 'cursos'));
                const cursosData = cursosSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCursos(cursosData);
            } catch (error) {
                console.error('Error al cargar los cursos:', error);
            }
        };

        fetchCursos();
    }, []);

    return (
        <div className="cursos-page">
            <h1 className="cursos-title">Nuestros Cursos</h1>
            <div className="cursos-grid">
                {cursos.map((curso) => (
                    <div key={curso.id} className="curso-card">
                        <img 
                            src={curso.imagenUrl || '/default-course-image.png'} 
                            alt={curso.titulo} 
                            className="curso-image" 
                        />
                        <div className="curso-content">
                            <h2 className="curso-title">{curso.titulo || 'Sin título'}</h2>
                            <p className="curso-description">
                                {curso.descripcion.length > 100 
                                    ? `${curso.descripcion.substring(0, 100)}...` 
                                    : curso.descripcion}
                            </p>
                            <Link to={`/cursos/${curso.id}`} className="curso-more-info">
                                Más info
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Cursos;
