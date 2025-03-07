import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube, faFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './Nosotros.css';

const Nosotros = () => {
    const navigate = useNavigate();
    const [miembros, setMiembros] = useState([]);

     // Obtener miembros desde Firestore
     useEffect(() => {
        const fetchMiembros = async () => {
            const querySnapshot = await getDocs(collection(db, "juntaDirectiva"));
            const miembrosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMiembros(miembrosData);
        };
        fetchMiembros();
    }, []);
    

    const handleImageClick = (miembro) => {
        navigate(`/miembro/${miembro.nombre}`, { state: { miembro } });
    };

    return (
        <div className="nosotros">
            {/* Primera Sección: Hero */}
            <section className="hero">
                <div className="hero-nosotros">
                    <h1>Comunidad Islamica Tordera</h1>
                    <p>Al Servicio De La Comunidad Desde Hace Mas De 15 Años</p>
                </div>
            </section>

            {/* Sección 2: Historia de la Mezquita */}
            <section className="about-history-section">
        <div className="history-container">
          <div className="history-text">
          <div className="text-container">
            <h2>La historia de nuestra mezquita</h2>
            <p>
              Nuestra mezquita ha estado al servicio de la comunidad desde finales del año 2001, llevamos mas de dos décadas. Estamos
              dedicados a difundir la paz y apoyar a nuestra comunidad local musulmana y autoctona, nuestra comunidad se conforma por mas de 10 nacionaledades africanas europeas y asiatecas,
              a través de diversas iniciativas y eventos hemos intentado dar a conocer la religion islamica y estar cerca de la gente.
            </p>
            <button onClick={() => navigate('/historia')}>Saber más</button>
          </div>
          </div>
          <div className="history-image">
            <img src="/hero1.jpeg" alt="Mosque History" />
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
                                <img src={miembro.imagenUrl || '/default-profile.png'} alt={miembro.nombre}  loading="lazy" />
                                <p>{miembro.puesto}</p>
                                <p>{miembro.nombre}</p>

                                {/* Verificar si tiene redes sociales */}
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
                        <p>No hay miembros en la junta directiva.</p>
                    )}
                </div>
            </section>

            {/* Cuarta Sección: Misión */}
            <section className="mision">
            <h2>Nuestra Misión</h2>
            <p>Nuestra misión es promover el bienestar, la educación y el desarrollo en un ambiente de respeto y solidaridad.</p>

            <div className="mision-cards">

            <div 
                    className="mision-card events " 
                    onClick={() => navigate('/eventos')}
                >
                    <div className="card-content-mision">
                        <h3>Próximos Eventos</h3>
                        <p>Descubre los nuevos eventos de la comunidad.</p>
                        <button>Ver eventos</button>
                    </div>
                </div>
                
                <div 
                    className="mision-card blog" 
                    onClick={() => navigate('/blog')}
                >
                    <div className="card-content-mision">
                        <h3>Blog de la Comunidad</h3>
                        <p>Lee nuestros artículos sobre temas de interés para la comunidad.</p>
                        <button>Leer más</button>
                    </div>
                </div>
                <div 
                    className="mision-card multimedia" 
                    onClick={() => navigate('/multimedia')}
                >
                    <div className="card-content-mision">
                        <h3>Galería Multimedia</h3>
                        <p>Explora  videos de nuestros eventos y actividades comunitarias.</p>
                        <button>Ver galería</button>
                    </div>
                </div>
            </div>
        </section>
        </div>
    );
};

export default Nosotros;