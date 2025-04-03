// src/pages/Nosotros.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube, faFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './Nosotros.css';

const Nosotros = () => {
    const navigate = useNavigate();
    const [miembros, setMiembros] = useState([]);

    useEffect(() => {
        const fetchMiembros = async () => {
            const querySnapshot = await getDocs(collection(db, "juntaDirectiva"));
            const miembrosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMiembros(miembrosData);
        };
        fetchMiembros();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "juntaDirectiva"), (querySnapshot) => {
            const miembrosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMiembros(miembrosData);
        });
        return () => unsubscribe();
    }, []);

    const handleImageClick = (miembro) => {
        navigate(`/miembro/${miembro.nombre}`, { state: { miembro } });
    };

    return (
        <div className="nosotros">
            {/* Hero con SEO */}
            <section className="hero">
                <div className="hero-nosotros">
                    <h1>Comunitat Islàmica de Tordera</h1>
                    <p>Una mezquita en Tordera al servicio de la comunidad musulmana desde hace más de 15 años.</p>
                </div>
            </section>

            {/* Historia */}
            <section className="about-history-section">
                <div className="history-container">
                    <div className="history-text">
                        <div className="text-container">
                            <h2>La historia de nuestra mezquita en Tordera</h2>
                            <p>
                                Desde el año 2001, nuestra mezquita ha sido un pilar para los musulmanes de Tordera. La Comunitat Islàmica de Tordera está formada por personas de más de 10 nacionalidades, trabajando para fortalecer la fe, promover la educación islámica y ofrecer servicios religiosos y sociales para toda la comunidad.
                            </p>
                            <button onClick={() => navigate('/historia')}>Saber más sobre la historia</button>
                        </div>
                    </div>
                    <div className="history-image">
                        <img src="/hero1.jpeg" alt="Fachada mezquita Tordera" loading="lazy" />
                    </div>
                </div>
            </section>

            {/* Junta Directiva */}
            <section className="junta-directiva">
                <h2>Nuestra Junta Directiva</h2>
                <div className="miembros">
                    {miembros.length > 0 ? (
                        miembros.map((miembro) => (
                            <div key={miembro.id} className="miembro" onClick={() => handleImageClick(miembro)}>
                                <img src={miembro.imagenUrl || '/default-profile.png'} alt={`Miembro: ${miembro.nombre}`} loading="lazy" />
                                <p>{miembro.puesto}</p>
                                <p>{miembro.nombre}</p>

                                {miembro.redes && (
                                    <div className="redes-sociales">
                                        {miembro.redes.youtube && (
                                            <a href={miembro.redes.youtube} target="_blank" rel="noopener noreferrer">
                                                <FontAwesomeIcon icon={faYoutube} size="2x" />
                                            </a>
                                        )}
                                        {miembro.redes.facebook && (
                                            <a href={miembro.redes.facebook} target="_blank" rel="noopener noreferrer">
                                                <FontAwesomeIcon icon={faFacebook} size="2x" />
                                            </a>
                                        )}
                                        {miembro.redes.linkedin && (
                                            <a href={miembro.redes.linkedin} target="_blank" rel="noopener noreferrer">
                                                <FontAwesomeIcon icon={faLinkedin} size="2x" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No hay miembros disponibles actualmente.</p>
                    )}
                </div>
            </section>

            {/* Misión */}
            <section className="mision">
                <h2>Nuestra Misión como Comunidad Islámica</h2>
                <p>Promover el bienestar espiritual y social en Tordera a través de servicios religiosos, educación islámica y actividades culturales.</p>

                <div className="mision-cards">
                    <div className="mision-card events" onClick={() => navigate('/eventos')}>
                        <div className="card-content-mision">
                            <h3>Eventos Islámicos</h3>
                            <p>Consulta nuestros próximos eventos para la comunidad musulmana en Tordera.</p>
                            <button>Ver eventos</button>
                        </div>
                    </div>

                    <div className="mision-card blog" onClick={() => navigate('/blog')}>
                        <div className="card-content-mision">
                            <h3>Blog Islámico</h3>
                            <p>Reflexiones y artículos sobre el Islam y la vida comunitaria en Tordera.</p>
                            <button>Leer más</button>
                        </div>
                    </div>

                    <div className="mision-card multimedia" onClick={() => navigate('/multimedia')}>
                        <div className="card-content-mision">
                            <h3>Galería Multimedia</h3>
                            <p>Revive nuestros eventos y actividades a través de fotos y vídeos.</p>
                            <button>Ver galería</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Nosotros;