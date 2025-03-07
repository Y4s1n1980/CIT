// src/pages/eventos/Eventos.js
import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Eventos.css';

const Eventos = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarTodos, setMostrarTodos] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const eventosCollection = collection(db, 'eventos');
                const q = query(eventosCollection, where('estado', '==', true));
                const querySnapshot = await getDocs(q);

                // Mapear los datos y ordenar por fecha más próxima
                const eventosData = querySnapshot.docs.map(doc => { 
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        fecha: data.fecha.toDate() 
                    };
                }).sort((a, b) => a.fecha - b.fecha); 

                setEventos(eventosData);
            } catch (error) {
                console.error('Error al obtener los eventos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventos();
    }, []);

    // Lógica para mostrar solo 5 eventos o todos
    const eventosAMostrar = mostrarTodos ? eventos : eventos.slice(0, 5);

    return (
        <div className="eventos">
            <h1>Próximos Eventos</h1>
            <p>Explora nuestros próximos eventos y únete a nosotros </p>
            {loading ? (
                <p>Cargando eventos...</p>
            ) : (
                <ul className="eventos-list">
                    {eventosAMostrar.length > 0 ? (
                        eventosAMostrar.map(evento => (
                            <li key={evento.id} className="evento-card">
                                <div className="evento-date">
                                    {new Date(evento.fecha).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                    })}
                                    <span>
                                        {new Date(evento.fecha).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                        })}
                                    </span>
                                </div>
                                <div className="evento-info">
                                    <h2>{evento.nombre}</h2>
                                    <p>{evento.ubicacion}</p>
                                    <p>
                                        {new Date(evento.fecha).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <button
                                    className="evento-button"
                                    onClick={() => navigate(`/eventos/${evento.id}`)}
                                >
                                    Ver Detalles
                                </button>
                            </li>
                        ))
                    ) : (
                        <p>No hay eventos próximos.</p>
                    )}
                </ul>
            )}
            {eventos.length > 5 && !loading && (
                <div className="ver-mas-container">
                    <button 
                        className="ver-mas-button" 
                        onClick={() => setMostrarTodos(!mostrarTodos)}
                    >
                        {mostrarTodos ? "Mostrar menos" : "Ver más"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Eventos;
