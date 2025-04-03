// src/pages/Servicios.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './Servicios.css';
import { useNavigate } from 'react-router-dom';

const Servicios = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const servicesPerPage = 6;

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const serviciosCollection = collection(db, 'servicios');
                const q = query(serviciosCollection, where('estado', '==', true));

                const querySnapshot = await getDocs(q);
                const serviciosData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date()
                }));

                const sortedServicios = serviciosData.sort((a, b) => b.fechaCreacion - a.fechaCreacion);

                setServicios(sortedServicios);
            } catch (error) {
                console.error('Error al obtener los servicios:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServicios();
    }, []);

    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = servicios.slice(indexOfFirstService, indexOfLastService);

    const openModal = (servicio) => {
        setSelectedService(servicio);
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        setSelectedService(null);
        document.body.classList.remove('modal-open');
    };

    return (
        <div className="servicios">
            <div className="hero">
                <div className="hero-content">
                    <h1>Servicios Islámicos en Tordera</h1>
                    <p>
                        La Comunitat Islàmica de Tordera ofrece una amplia gama de servicios religiosos, educativos y sociales para musulmanes y vecinos de Tordera. Descubre nuestras clases de árabe, estudios coránicos, charlas islámicas, ceremonia de Chahada y más.
                    </p>
                </div>
            </div>

            <div className="explorar-servicios">
                <div className="explorar-servicios-content">
                    <h2>Explora los Servicios de la Mezquita</h2>
                    <p>Conoce los servicios islámicos que ofrece nuestra comunidad musulmana en Tordera.</p>
                    <button onClick={() => navigate('/nuestros-servicios')}>Ver todos los servicios</button>
                </div>
            </div>

            <h2 className="servicios-heading">Listado de Servicios Comunitarios</h2>

            {loading ? (
                <p className="loading-text">Cargando servicios disponibles...</p>
            ) : (
                <div className="servicios-list">
                    {currentServices.map((servicio, index) => (
                        <div key={servicio.id} className={`servicio-card-wrapper ${index % 3 === 0 ? 'row-start' : ''}`}>
                            <ServicioCard servicio={servicio} onOpenModal={openModal} />
                        </div>
                    ))}
                </div>
            )}

            {selectedService && (
                <ModalService service={selectedService} onClose={closeModal} />
            )}

            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Anterior
                </button>

                {Array.from({ length: Math.ceil(servicios.length / servicesPerPage) }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === Math.ceil(servicios.length / servicesPerPage)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

const ModalService = ({ service, onClose }) => (
    <div
        className="modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
    >
        <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                className="close-button"
                onClick={onClose}
                aria-label="Cerrar modal"
            >
                &times;
            </button>
            {service.imagenUrl ? (
                <img
                    src={service.imagenUrl}
                    alt={`Servicio: ${service.nombre}`}
                    className="modal-image"
                    loading="lazy" 
                />
            ) : (
                <p>Sin imagen disponible</p>
            )}
            <h2 id="modal-title">{service.nombre}</h2>
            <p id="modal-description">{service.descripcion}</p>
        </div>
    </div>
);

const ServicioCard = ({ servicio, onOpenModal }) => {
    return (
        <div className="servicio-card"
            onClick={() => onOpenModal(servicio)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpenModal(servicio)}
            aria-label={`Abrir detalles del servicio ${servicio.nombre}`}
        >
            <div className="image-container">
                {servicio.imagenUrl ? (
                    <img
                        src={servicio.imagenUrl}
                        alt={`Imagen del servicio: ${servicio.nombre}`}
                        className="servicio-imagen"
                        loading="lazy"
                        onError={(e) => { 
                            e.target.src = '/images/default-image.jpg';
                        }}
                    />
                ) : (
                    <div className="image-placeholder">Sin imagen</div>
                )}
            </div>
            <h2>{servicio.nombre}</h2>
            <p>{servicio.descripcion}</p>
        </div>
    );
};

export default Servicios;