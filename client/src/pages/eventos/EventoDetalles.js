import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './EventoDetalles.css';

const EventoDetalles = () => {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const eventoRef = doc(db, 'eventos', id);
                const eventoSnap = await getDoc(eventoRef);
                if (eventoSnap.exists()) {
                    setEvento(eventoSnap.data());
                } else {
                    console.log("El evento no existe.");
                }
            } catch (error) {
                console.error('Error al obtener el evento:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvento();
    }, [id]);

    if (loading) {
        return (
            <div className="evento-detalles">
                <p className="evento-loading">Cargando detalles del evento...</p>
            </div>
        );
    }

    if (!evento) {
        return (
            <div className="evento-detalles">
                <p className="evento-error">No se encontró el evento.</p>
            </div>
        );
    }

    return (
        <div className="evento-detalles">
            <img
                src={evento.imagenUrl}
                alt={evento.nombre}
                className="evento-imagen"
                loading="lazy"
            />
            <div className="evento-info">
                <h1 className="evento-titulo">{evento.nombre}</h1>
                <p>
  <strong>Fecha: </strong>
  {evento.fecha
    ? new Date(
        evento.fecha.seconds
          ? evento.fecha.seconds * 1000
          : evento.fecha
      ).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Fecha no disponible'}
</p>

                <p>
                    <strong>Ubicación: </strong>
                    {evento.ubicacion}
                </p>
                <p className="descripcion">
                    <strong>Descripción: </strong>
                    {evento.descripcion}
                </p>
            </div>
        </div>
    );
};

export default EventoDetalles;
