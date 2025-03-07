import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './EventManagementSection.css';

const EventManagementSection = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        nombre: '',
        descripcion: '',
        fecha: '',
        ubicacion: '',
        organizador: '',
        estado: true,
    });
    const [imageFile, setImageFile] = useState(null); // Manejar la imagen seleccionada

    // Cargar eventos desde Firestore
    useEffect(() => {
        const fetchEvents = async () => {
            const eventsCollection = collection(db, 'eventos');
            const eventsSnapshot = await getDocs(eventsCollection);
            const eventsData = eventsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEvents(eventsData);
        };
        fetchEvents();
    }, []);

    // Subir el archivo al servidor mediante /upload
    const uploadImage = async () => {
        if (!imageFile) return null;

        const formData = new FormData();
        formData.append('file', imageFile); // Archivo principal
        formData.append('coleccionDestino', 'eventos'); // Especificar la colección de destino
        formData.append('nombre', newEvent.nombre);
        formData.append('descripcion', newEvent.descripcion);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                return data.fileUrl; // URL generada en el bucket
            } else {
                console.error('Error en el servidor:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            return null;
        }
    };

    // Añadir un nuevo evento
    const handleAddEvent = async (e) => {
        e.preventDefault();

        try {
            const imageUrl = await uploadImage(); // Subir la imagen y obtener la URL
            const eventDoc = {
                ...newEvent,
                imagenUrl: imageUrl || '', // URL de la imagen cargada
                fecha: new Date(newEvent.fecha),
            };

            const docRef = await addDoc(collection(db, 'eventos'), eventDoc);
            setEvents([...events, { id: docRef.id, ...eventDoc }]);

            // Resetear el formulario
            setNewEvent({
                nombre: '',
                descripcion: '',
                fecha: '',
                ubicacion: '',
                organizador: '',
                estado: true,
            });
            setImageFile(null); // Limpiar el archivo seleccionado
        } catch (error) {
            console.error('Error al añadir evento:', error);
        }
    };

    // Cambiar el estado de un evento
    const handleToggleEventState = async (eventId, currentState) => {
        const eventDoc = doc(db, 'eventos', eventId);
        await updateDoc(eventDoc, { estado: !currentState });
        setEvents(
            events.map((event) =>
                event.id === eventId ? { ...event, estado: !currentState } : event
            )
        );
    };

    // Eliminar un evento
    const handleDeleteEvent = async (eventId) => {
        const eventDoc = doc(db, 'eventos', eventId);
        await deleteDoc(eventDoc);
        setEvents(events.filter((event) => event.id !== eventId));
    };

    return (
        <section className="event-management">
            <h2>Gestión de Eventos</h2>
            <form onSubmit={handleAddEvent} className="event-form">
                <input
                    type="text"
                    placeholder="Título del evento"
                    value={newEvent.nombre}
                    onChange={(e) =>
                        setNewEvent({ ...newEvent, nombre: e.target.value })
                    }
                    required
                />
                <textarea
                    placeholder="Descripción del evento"
                    value={newEvent.descripcion}
                    onChange={(e) =>
                        setNewEvent({ ...newEvent, descripcion: e.target.value })
                    }
                    required
                />
                <input
                    type="datetime-local"
                    value={newEvent.fecha}
                    onChange={(e) =>
                        setNewEvent({ ...newEvent, fecha: e.target.value })
                    }
                    required
                />
                <input
                    type="text"
                    placeholder="Ubicación del evento"
                    value={newEvent.ubicacion}
                    onChange={(e) =>
                        setNewEvent({ ...newEvent, ubicacion: e.target.value })
                    }
                    required
                />
                <input
                    type="text"
                    placeholder="Organizador del evento"
                    value={newEvent.organizador}
                    onChange={(e) =>
                        setNewEvent({ ...newEvent, organizador: e.target.value })
                    }
                    required
                />
                <input
                    type="file"
                    onChange={(e) => setImageFile(e.target.files[0])} // Manejar archivo seleccionado
                    required
                />
                <button type="submit">Añadir Evento</button>
            </form>

            <h2>Eventos Actuales</h2>
            <table>
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Fecha</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr key={event.id}>
                            <td>{event.nombre}</td>
                            <td>
                                {event.fecha
                                    ? new Date(event.fecha).toLocaleString()
                                    : 'Fecha no disponible'}
                            </td>
                            <td>{event.ubicacion}</td>
                            <td>{event.estado ? 'Activo' : 'Inactivo'}</td>
                            <td>
                                <button
                                    onClick={() =>
                                        handleToggleEventState(event.id, event.estado)
                                    }
                                >
                                    {event.estado ? 'Desactivar' : 'Activar'}
                                </button>
                                <button onClick={() => handleDeleteEvent(event.id)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default EventManagementSection;
