import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './SociosSection.css';

const SociosSection = () => {
    const [socios, setSocios] = useState([]);
    const [nuevoSocio, setNuevoSocio] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        hijos: '',
        direccion: '',
        cuotaMensual: '',
        fechaInscripcion: new Date().toISOString().slice(0, 10),
    });
    const [socioEditando, setSocioEditando] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const sociosPerPage = 5;

    const fetchSocios = async () => {
        const sociosCollection = collection(db, 'socios');
        const sociosSnapshot = await getDocs(sociosCollection);
        setSocios(sociosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };


    const handleAddSocio = async (e) => {
        e.preventDefault();
        const nuevo = {
            ...nuevoSocio,
            hijos: nuevoSocio.hijos.split(','),
            cuotaMensual: Number(nuevoSocio.cuotaMensual),
        };
    
        if (socioEditando?.id) {
            // Actualizar socio existente
            try {
                await updateDoc(doc(db, 'socios', socioEditando.id), nuevo);
            } catch (error) {
                console.error("Error al actualizar el documento:", error);
            }
            setSocioEditando(null);
        } else {
            // Agregar nuevo socio
            await addDoc(collection(db, 'socios'), nuevo);
        }
    
        setNuevoSocio({
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            hijos: '',
            direccion: '',
            cuotaMensual: '',
            fechaInscripcion: new Date().toISOString().slice(0, 10),
        });
        fetchSocios();
    };
    

    const handleDeleteSocio = async (id) => {
        try {
            console.log("ID a eliminar:", id);
            await deleteDoc(doc(db, 'socios', id));
            fetchSocios();
        } catch (error) {
            console.error("Error eliminando socio:", error);
        }
    };


    const handleEditSocio = (socio) => {
        setSocioEditando(socio);
        setNuevoSocio({
            nombre: socio.nombre,
            apellido: socio.apellido,
            email: socio.email,
            telefono: socio.telefono,
            hijos: Array.isArray(socio.hijos) ? socio.hijos.join(', ') : socio.hijos,
            direccion: socio.direccion,
            cuotaMensual: socio.cuotaMensual,
            fechaInscripcion: socio.fechaInscripcion 
                ? new Date(socio.fechaInscripcion).toISOString().slice(0, 10) 
                : '', // Si no es válida, dejamos el campo vacío
        });
    };
    
    
    


    useEffect(() => {
        fetchSocios();
    }, []);

    // Pagination logic
    const indexOfLastSocio = currentPage * sociosPerPage;
    const indexOfFirstSocio = indexOfLastSocio - sociosPerPage;
    const currentSocios = socios.slice(indexOfFirstSocio, indexOfLastSocio);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="socios-section">
            <h2>Gestión de Socios</h2>
            <form onSubmit={handleAddSocio} className="socios-form">
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nuevoSocio.nombre}
                    onChange={(e) => setNuevoSocio({ ...nuevoSocio, nombre: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Apellido"
                    value={nuevoSocio.apellido}
                    onChange={(e) => setNuevoSocio({ ...nuevoSocio, apellido: e.target.value })}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={nuevoSocio.email}
                    onChange={(e) => setNuevoSocio({ ...nuevoSocio, email: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Teléfono"
                    value={nuevoSocio.telefono}
                    onChange={(e) => setNuevoSocio({ ...nuevoSocio, telefono: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Hijos (separados por coma)"
                    value={nuevoSocio.hijos}
                    onChange={(e) => setNuevoSocio({ ...nuevoSocio, hijos: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Dirección"
                    value={nuevoSocio.direccion}
                    onChange={(e) => setNuevoSocio({ ...nuevoSocio, direccion: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Cuota Mensual"
                    value={nuevoSocio.cuotaMensual}
                    onChange={(e) => setNuevoSocio({ ...nuevoSocio, cuotaMensual: e.target.value })}
                    required
                />
                <input
                    type="date"
                    value={nuevoSocio.fechaInscripcion}
                    onChange={(e) => setNuevoSocio({ ...nuevoSocio, fechaInscripcion: e.target.value })}
                    required
                />
                <button type="submit">
                    {socioEditando ? 'Actualizar Socio' : 'Agregar Socio'}
                </button>
                {socioEditando && (
                    <button
                        type="button"
                        onClick={() => {
                            setSocioEditando(null);
                            setNuevoSocio({
                                nombre: '',
                                apellido: '',
                                email: '',
                                telefono: '',
                                hijos: '',
                                direccion: '',
                                cuotaMensual: '',
                                fechaInscripcion: new Date().toISOString().slice(0, 10),
                            });
                        }}
                    >
                        Cancelar
                    </button>
                )}
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Hijos</th>
                        <th>Dirección</th>
                        <th>Cuota Mensual</th>
                        <th>Fecha Inscripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentSocios.map((socio) => (
                        <tr key={socio.id}>
                            <td>{socio.nombre}</td>
                            <td>{socio.apellido}</td>
                            <td>{socio.email}</td>
                            <td>{socio.telefono}</td>
                            <td>{Array.isArray(socio.hijos) ? socio.hijos.join(', ') : socio.hijos || 'No especificado'}</td>
                            <td>{socio.direccion}</td>
                            <td>{socio.cuotaMensual}</td>
                            <td>{new Date(socio.fechaInscripcion).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => handleEditSocio(socio)}>Editar</button>
                                <button onClick={() => handleDeleteSocio(socio.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
                {Array.from({ length: Math.ceil(socios.length / sociosPerPage) }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SociosSection;
