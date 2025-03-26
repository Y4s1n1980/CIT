import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
} from 'firebase/firestore';
import './ServiceManagementSection.css';

const ServiceManagementSection = () => {
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({
        nombre: '',
        descripcion: '',
        imagenUrl: '',
        estado: true,
    });
    const [editingService, setEditingService] = useState(null); // Para manejar ediciones
    const [currentPage, setCurrentPage] = useState(1);
    const servicesPerPage = 5;

    // Cargar servicios desde Firestore
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesCollection = collection(db, 'servicios');
                const servicesSnapshot = await getDocs(servicesCollection);
                setServices(
                    servicesSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                );
            } catch (error) {
                console.error('Error al cargar los servicios:', error);
            }
        };
        fetchServices();
    }, []);

    // Validar archivo antes de subir
    const validateFile = (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!file || !allowedTypes.includes(file.type)) {
            alert('Por favor, selecciona un archivo válido (JPEG, PNG, WebP).');
            return false;
        }
        return true;
    };

    // Subir imagen al bucket a través del servidor
    const handleImageUpload = async (file) => {
        if (!validateFile(file)) return '';

        const formData = new FormData();
        formData.append('file', file);

        try {
            const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://cit-backend-iuqy.onrender.com';
            const response = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al subir la imagen');
            }

            const data = await response.json();
            return data.fileUrl; // Asegúrate de usar el campo `fileUrl` que retorna el servidor
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            return '';
        }
    };

    // Guardar o actualizar servicio
    const handleSaveService = async (e) => {
        e.preventDefault();

        try {
            let imageUrl = newService.imagenUrl;

            // Subir la imagen al servidor si es necesario
            if (newService.imagenFile) {
                imageUrl = await handleImageUpload(newService.imagenFile);
            }

            // Crear los datos del servicio
            const { imagenFile, ...serviceData } = {
                ...newService,
                imagenUrl: imageUrl, // URL de la imagen obtenida
                fechaCreacion: Timestamp.now(),
            };

            if (editingService) {
                // Actualizar un servicio existente
                await updateDoc(doc(db, 'servicios', editingService.id), serviceData);
                setServices((prev) =>
                    prev.map((service) =>
                        service.id === editingService.id ? { ...service, ...serviceData } : service
                    )
                );
            } else {
                // Crear un nuevo servicio
                const docRef = await addDoc(collection(db, 'servicios'), serviceData);
                setServices([...services, { id: docRef.id, ...serviceData }]);
            }

            // Limpiar formulario
            setNewService({ nombre: '', descripcion: '', imagenUrl: '', estado: true });
            setEditingService(null);
        } catch (error) {
            console.error('Error al guardar servicio:', error);
        }
    };

    // Eliminar servicio
    const handleDeleteService = async (serviceId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
            try {
                await deleteDoc(doc(db, 'servicios', serviceId));
                setServices(services.filter((service) => service.id !== serviceId));
            } catch (error) {
                console.error('Error al eliminar servicio:', error);
            }
        }
    };

    // Editar servicio
    const handleEditService = (service) => {
        setNewService(service);
        setEditingService(service);
    };

    // Cambiar estado (activar/desactivar)
    const handleToggleServiceState = async (serviceId, currentState) => {
        try {
            const serviceDoc = doc(db, 'servicios', serviceId);
            await updateDoc(serviceDoc, { estado: !currentState });
            setServices((prev) =>
                prev.map((service) =>
                    service.id === serviceId
                        ? { ...service, estado: !currentState }
                        : service
                )
            );
        } catch (error) {
            console.error('Error al cambiar el estado del servicio:', error);
        }
    };

    // Paginación
    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = services.slice(indexOfFirstService, indexOfLastService);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <section className="service-management">
            <h2>Gestión y Subida de Servicios</h2>
            <form onSubmit={handleSaveService} className="service-form">
                <input
                    type="text"
                    placeholder="Nombre del Servicio"
                    value={newService.nombre}
                    onChange={(e) =>
                        setNewService({ ...newService, nombre: e.target.value })
                    }
                    required
                />
                <textarea
                    placeholder="Descripción del Servicio"
                    value={newService.descripcion}
                    onChange={(e) =>
                        setNewService({
                            ...newService,
                            descripcion: e.target.value,
                        })
                    }
                    required
                />

                <input
                    type="file"
                    onChange={(e) =>
                        setNewService({ ...newService, imagenFile: e.target.files[0] })
                    }
                />

                <button type="submit">
                    {editingService ? 'Actualizar Servicio' : 'Añadir Servicio'}
                </button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentServices.map((service) => (
                        <tr key={service.id}>
                            <td>{service.nombre}</td>
                            <td>{service.descripcion}</td>
                            <td>{service.estado ? 'Activo' : 'Inactivo'}</td>
                            <td>
                                <button
                                    onClick={() =>
                                        handleToggleServiceState(service.id, service.estado)
                                    }
                                >
                                    {service.estado ? 'Desactivar' : 'Activar'}
                                </button>
                                <button onClick={() => handleEditService(service)}>
                                    Editar
                                </button>
                                <button onClick={() => handleDeleteService(service.id)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from(
                    { length: Math.ceil(services.length / servicesPerPage) },
                    (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    )
                )}
            </div>
        </section>
    );
};

export default ServiceManagementSection;
