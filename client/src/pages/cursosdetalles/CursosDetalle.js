import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './CursosDetalle.css';

const CursosDetalle = () => {
    const { id } = useParams();
    const [curso, setCurso] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurso = async () => {
            try {
                const cursoDoc = await getDoc(doc(db, 'cursos', id));
                if (cursoDoc.exists()) {
                    setCurso(cursoDoc.data());
                } else {
                    setError('El curso no existe.');
                }
            } catch (error) {
                console.error('Error al cargar el curso:', error);
                setError('Hubo un error al cargar el curso.');
            }
        };

        fetchCurso();
    }, [id]);

    if (error) {
        return (
            <div className="curso-detalle-error">
                <p>{error}</p>
                <Link to="/cursos" className="back-button">Volver a Cursos</Link>
            </div>
        );
    }

    if (!curso) return <p className="loading-message">Cargando...</p>;

    return (
        <div className="curso-detalle">
            <img src={curso.imagenUrl || '/default-course-image.png'} alt={curso.titulo} className="curso-imagen" />
            <h1 className="curso-titulo">{curso.titulo}</h1>
            <p className="curso-descripcion">{curso.descripcion}</p>
            <div className="curso-contenido">
                <h2>Contenido Completo</h2>
                <p>{curso.contenidoCompleto || 'No hay contenido adicional disponible para este curso.'}</p>
            </div>
            <Link to="/cursos" className="back-button">Volver a Cursos</Link>
        </div>
    );
};

export default CursosDetalle;
