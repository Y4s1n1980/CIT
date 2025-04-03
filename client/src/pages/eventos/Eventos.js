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

    const eventosAMostrar = mostrarTodos ? eventos : eventos.slice(0, 5);

    return (
        <div className="eventos">
            <h1>Eventos Islámicos en Tordera</h1>
            <p>Consulta los próximos eventos de la Comunitat Islàmica de Tordera: actividades religiosas, charlas educativas, eventos comunitarios y más.</p>

            {loading ? (
                <p>Cargando eventos de la comunidad musulmana...</p>
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
                                Ver Detalles del Evento
                            </button>
                        </li>
                    ))
                    ) : (
                        <p>No hay eventos programados en este momento.</p>
                    )}
                </ul>
            )}

            {eventos.length > 5 && !loading && (
                <div className="ver-mas-container">
                    <button 
                        className="ver-mas-button" 
                        onClick={() => setMostrarTodos(!mostrarTodos)}
                    >
                        {mostrarTodos ? "Mostrar menos eventos" : "Ver todos los eventos islámicos"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Eventos;
