import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faYoutube, faLinkedin, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';
import './JuntaManagement.css';

const JuntaManagement = () => {
    const [miembros, setMiembros] = useState([]);
    const [nuevoMiembro, setNuevoMiembro] = useState({
        nombre: '', apellido: '', puesto: '', telefono: '', email: '', descripcion: '', imagenUrl: '',
        facebook: '', youtube: '', linkedin: '', instagram: '', tiktok: '' // Nuevas redes
    });
    const [imagen, setImagen] = useState(null);
    const [editandoId, setEditandoId] = useState(null);

      // 🔹 USEEFFECT para obtener datos en tiempo real
      useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "juntaDirectiva"), (querySnapshot) => {
            const miembrosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMiembros(miembrosData);
        });

        return () => unsubscribe(); // Se cancela la suscripción al desmontar el componente
    }, []);

    useEffect(() => {
        const fetchMiembros = async () => {
            const querySnapshot = await getDocs(collection(db, "juntaDirectiva"));
            const miembrosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMiembros(miembrosData);
        };
        fetchMiembros();
    }, []);

    const handleChange = (e) => {
        setNuevoMiembro({ ...nuevoMiembro, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImagen(e.target.files[0]);
    };

    const handleAddOrUpdateMiembro = async () => {
        if (!nuevoMiembro.nombre || !nuevoMiembro.puesto) {
            alert("Faltan campos obligatorios");
            return;
        }

        let imagenUrl = nuevoMiembro.imagenUrl;
        if (imagen) {
            const formData = new FormData();
            formData.append("file", imagen);
            try {
                const response = await axios.post("http://localhost:5000/upload/junta", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                imagenUrl = response.data.fileUrl;
            } catch (error) {
                console.error("Error al subir la imagen:", error);
                alert("Error al subir la imagen.");
                return;
            }
        }

        if (editandoId) {
            await updateDoc(doc(db, "juntaDirectiva", editandoId), { ...nuevoMiembro, imagenUrl });
            alert("Miembro actualizado");
        } else {
            await addDoc(collection(db, "juntaDirectiva"), { ...nuevoMiembro, imagenUrl });
            alert("Miembro agregado");
        }

        setNuevoMiembro({
            nombre: '', apellido: '', puesto: '', telefono: '', email: '', descripcion: '', imagenUrl: '',
            facebook: '', youtube: '', linkedin: '', instagram: '', tiktok: ''
        });
        setImagen(null);
        setEditandoId(null);
    };

    const handleEditMiembro = (miembro) => {
        setNuevoMiembro(miembro);
        setEditandoId(miembro.id);
    };

    const handleDeleteMiembro = async (id) => {
        await deleteDoc(doc(db, "juntaDirectiva", id));
        alert("Miembro eliminado");
        setMiembros(miembros.filter(miembro => miembro.id !== id));
    };

    return (
        <div className="junta-management">
            <h2>Gestión de Junta Directiva</h2>
            <div className="miembros-list">
                {miembros.map((miembro) => (
                    <div key={miembro.id} className="miembro-card">
                        <h3>{miembro.nombre} {miembro.apellido}</h3>
                        <p>{miembro.puesto}</p>
                        {miembro.imagenUrl && <img src={miembro.imagenUrl} alt={miembro.nombre} />}
                        
                        {/* Mostrar redes sociales con íconos */}
                        <div className="redes-sociales">
                            {miembro.facebook && <a href={miembro.facebook} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebook} /></a>}
                            {miembro.youtube && <a href={miembro.youtube} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faYoutube} /></a>}
                            {miembro.linkedin && <a href={miembro.linkedin} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faLinkedin} /></a>}
                            {miembro.instagram && <a href={miembro.instagram} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} /></a>}
                            {miembro.tiktok && <a href={miembro.tiktok} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faTiktok} /></a>}
                        </div>

                        <button className="btn-editar" onClick={() => handleEditMiembro(miembro)}>Editar</button>
                        <button className="btn-eliminar" onClick={() => handleDeleteMiembro(miembro.id)}>Eliminar</button>
                    </div>
                ))}
            </div>

            <div className="form">
                <h3>{editandoId ? "Editar Miembro" : "Agregar Miembro"}</h3>
                <input name="nombre" placeholder="Nombre" value={nuevoMiembro.nombre} onChange={handleChange} />
                <input name="apellido" placeholder="Apellido" value={nuevoMiembro.apellido} onChange={handleChange} />
                <input name="puesto" placeholder="Puesto" value={nuevoMiembro.puesto} onChange={handleChange} />
                <input name="telefono" placeholder="Teléfono" value={nuevoMiembro.telefono} onChange={handleChange} />
                <input name="email" placeholder="Email" value={nuevoMiembro.email} onChange={handleChange} />
                <textarea name="descripcion" placeholder="Descripción" value={nuevoMiembro.descripcion} onChange={handleChange} />
                
                {/* Redes Sociales */}
                <input name="facebook" placeholder="Facebook URL" value={nuevoMiembro.facebook} onChange={handleChange} />
                <input name="youtube" placeholder="YouTube URL" value={nuevoMiembro.youtube} onChange={handleChange} />
                <input name="linkedin" placeholder="LinkedIn URL" value={nuevoMiembro.linkedin} onChange={handleChange} />
                <input name="instagram" placeholder="Instagram URL" value={nuevoMiembro.instagram} onChange={handleChange} />
                <input name="tiktok" placeholder="TikTok URL" value={nuevoMiembro.tiktok} onChange={handleChange} />

                {/* Subir imagen */}
                <input type="file" accept="image/*" onChange={handleImageChange} />

                <button onClick={handleAddOrUpdateMiembro}>
                    {editandoId ? "Actualizar" : "Agregar"}
                </button>
            </div>
        </div>
    );
};

export default JuntaManagement;
