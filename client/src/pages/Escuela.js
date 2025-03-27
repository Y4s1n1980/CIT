import React, { useState, useEffect } from 'react';
import './Escuela.css';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, where, getDoc, limit, doc, getDocs, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import CalendarioSection from './CalendarioSection';
import EnviarArchivosSection from '../components/EnviarArchivosSection';
import { serverTimestamp } from 'firebase/firestore';

const ContactosSection = () => {
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactPage, setContactPage] = useState(1);
  const contactsPerPage = 8;

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', 'in', ['admin', 'profesor']));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setContacts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoadingContacts(false);
    });
    return () => unsubscribe();
  }, []);

  const totalContactPages = Math.ceil(contacts.length / contactsPerPage);
  const contactStartIndex = (contactPage - 1) * contactsPerPage;
  const contactEndIndex = contactStartIndex + contactsPerPage;
  const currentContacts = contacts.slice(contactStartIndex, contactEndIndex);

  const handleContactPrevPage = () => {
    if (contactPage > 1) setContactPage(contactPage - 1);
  };

  const handleContactNextPage = () => {
    if (contactPage < totalContactPages) setContactPage(contactPage + 1);
  };

  return (
    <section className="contacts-section">
      <h2>Contactos Disponibles</h2>
      {loadingContacts ? (
        <p>Cargando contactos...</p>
      ) : (
        <>
          <div className="contacts-grid">
            {currentContacts.map((contact) => (
              <div key={contact.id} className="contact-card">
                <img src={contact.photoUrl || '/default-avatar.png'} alt={contact.name || 'Avatar'} className="contact-avatar" />
                <h3>{contact.name || 'Sin nombre'}</h3>
                <p>{contact.role || 'Sin rol definido'}</p>
                <Link to={`/chat-escuela/${contact.id}`} className="chat-button">
                  Iniciar Chat
                </Link>
              </div>
            ))}
          </div>
          <div className="pagination-controls">
            <button onClick={handleContactPrevPage} disabled={contactPage === 1}>Anterior</button>
            <span>Página {contactPage} de {totalContactPages}</span>
            <button onClick={handleContactNextPage} disabled={contactPage === totalContactPages}>Siguiente</button>
          </div>
        </>
      )}
    </section>
  );
};

const Escuela = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isApproved, setIsApproved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [weeklyPrograms, setWeeklyPrograms] = useState([]);
  const [lastCourse, setLastCourse] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const [activeSection, setActiveSection] = useState(null);
  const [docPage, setDocPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 3 : 6);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(6);
      }
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [expandedCardId, setExpandedCardId] = useState(null);
  const [weeklyCurrentPage, setWeeklyCurrentPage] = useState(1);
  const weeklyItemsPerPage = 6;
  const [expandedWeeklyId, setExpandedWeeklyId] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const solicitudRef = doc(db, 'schoolAccessRequests', currentUser.uid);

    getDoc(userDocRef).then(userSnap => {
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      console.log(" Datos del usuario:", userData);

      const fullName = userData?.name || currentUser?.displayName || 'Desconocido';

      if (!userData.name) {
        console.warn(" El usuario no tiene campo 'name' en Firestore. Se usará:", fullName);
      }

      if (userData.isApproved || userData.role === 'admin') {
        setIsApproved(true);
      } else {
        setIsPending(true);
        getDoc(solicitudRef).then(solicitudSnap => {
          if (!solicitudSnap.exists()) {
            setDoc(solicitudRef, {
              userId: currentUser.uid,
              email: currentUser.email,
              name: fullName,
              estado: 'pending',
              timestamp: serverTimestamp()
            });
          }
        });
      }
    });
  }, [currentUser]);

  useEffect(() => {
    const q1 = query(collection(db, 'schoolDocuments'));
    const q2 = query(collection(db, 'programaSemanal'));

    const unsub1 = onSnapshot(q1, snapshot => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingDocuments(false);
    });

    const unsub2 = onSnapshot(q2, snapshot => {
      setWeeklyPrograms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'cursos'), orderBy('fechaCreacion', 'desc'), limit(1));
    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        setLastCourse(snapshot.docs[0].data());
      }
    });
  }, []);

  if (isPending && !isApproved) {
    return <p>Tu solicitud está pendiente de aprobación por un administrador.</p>;
  }

  if (!isApproved && !isPending) {
    return (
      <div>
        <p>No tienes permiso para acceder a la sección de la escuela.</p>
        <button className="request-access" onClick={() => navigate('/auth')}>
          Solicitar acceso
        </button>
      </div>
    );
  }

  const docStartIndex = (docPage - 1) * itemsPerPage;
  const docEndIndex = docStartIndex + itemsPerPage;
  const currentDocs = documents.slice(docStartIndex, docEndIndex);
  const totalDocPages = Math.ceil(documents.length / itemsPerPage);

  const handleDocPrevPage = () => {
    if (docPage > 1) setDocPage(docPage - 1);
  };

  const handleDocNextPage = () => {
    if (docPage < totalDocPages) setDocPage(docPage + 1);
  };

  const handleCardClick = (docId) => {
    setExpandedCardId(prev => (prev === docId ? null : docId));
  };

  const weeklyStartIndexCalc = (weeklyCurrentPage - 1) * weeklyItemsPerPage;
  const weeklyEndIndexCalc = weeklyStartIndexCalc + weeklyItemsPerPage;
  const currentWeeklyPrograms = weeklyPrograms.slice(weeklyStartIndexCalc, weeklyEndIndexCalc);
  const weeklyTotalPages = Math.ceil(weeklyPrograms.length / weeklyItemsPerPage);

  const handleWeeklyPrevPage = () => {
    if (weeklyCurrentPage > 1) setWeeklyCurrentPage(weeklyCurrentPage - 1);
  };

  const handleWeeklyNextPage = () => {
    if (weeklyCurrentPage < weeklyTotalPages) setWeeklyCurrentPage(weeklyCurrentPage + 1);
  };

  const handleWeeklyCardClick = (programId) => {
    setExpandedWeeklyId(prev => (prev === programId ? null : programId));
  };

  return (
    <div className="escuela">
      <section className="hero-escuela">
        <h1>Bienvenido a la Escuela</h1>
        <p>Descubre nuestros programas y actividades.</p>
      </section>

      <nav className="escuela-nav">
        <button onClick={() => setActiveSection('cursos')}>Cursos</button>
        <button onClick={() => setActiveSection('calendario')}>Calendario</button>
        <button onClick={() => setActiveSection('documentos')}>Documentos</button>
        <button onClick={() => setActiveSection('enviar')}>Enviar Archivos</button>
        <button onClick={() => setActiveSection('programaSemanal')}>Programa Semanal</button>
      </nav>

      {activeSection === 'cursos' && (
        <section className="cursos-section">
          <h2>Cursos</h2>
          {lastCourse ? (
            <div className="last-course">
              <img src={lastCourse.imagenUrl} alt={lastCourse.titulo} className="last-course-image" />
              <div className="last-course-info">
                <h3>{lastCourse.titulo}</h3>
                <p>{lastCourse.descripcion}</p>
                <Link to="/cursos" className="more-courses-button">Más Cursos</Link>
              </div>
            </div>
          ) : (
            <p>Cargando último curso...</p>
          )}
        </section>
      )}

      {activeSection === 'calendario' && <CalendarioSection />}
      {activeSection === 'documentos' && (
        <section className="documentos-section">
          <h2>Documentos Escuela Disponibles</h2>
          {loadingDocuments ? (
            <p>Cargando documentos...</p>
          ) : (
            <>
              <div className="documents-grid">
                {currentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`documento-card ${expandedCardId === doc.id ? "expanded" : ""}`}
                    onClick={() => handleCardClick(doc.id)}
                  >
                    <h3>{doc.title}</h3>
                    <p>{doc.description}</p>
                    <p>Clase: {doc.class}</p>
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} download={doc.title} rel="noopener noreferrer">
                        Descargar
                      </a>
                    )}
                    {expandedCardId === doc.id && (
                      <div className="expanded-content">
                        <p>Aquí podrías mostrar detalles adicionales, etc.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="pagination-controls">
                <button onClick={handleDocPrevPage} disabled={docPage === 1}>Anterior</button>
                <span>{docPage} / {totalDocPages}</span>
                <button onClick={handleDocNextPage} disabled={docPage === totalDocPages}>Siguiente</button>
              </div>
            </>
          )}
        </section>
      )}

      {activeSection === 'enviar' && <EnviarArchivosSection />}

      {activeSection === 'programaSemanal' && (
        <section className="programa-semanal-section">
          <h2>Programa Semanal</h2>
          {weeklyPrograms.length === 0 ? (
            <p>No hay programas semanales disponibles.</p>
          ) : (
            <>
              <div className="documents-grid">
                {currentWeeklyPrograms.map((programa) => (
                  <div
                    key={programa.id}
                    className={`programa-semanal-item ${expandedWeeklyId === programa.id ? "expanded" : ""}`}
                    onClick={() => handleWeeklyCardClick(programa.id)}
                  >
                    <p><strong>Día:</strong> {typeof programa.day === 'object' && programa.day?.toDate ? programa.day.toDate().toLocaleDateString() : programa.day}</p>
                    <p><strong>Clase:</strong> {programa.class}</p>
                    <p><strong>Profesor:</strong> {programa.teacher}</p>
                    <p><strong>Tema:</strong> {programa.subject}</p>
                    {expandedWeeklyId === programa.id && (
                      <div className="expanded-content">
                        <p>Detalles adicionales del programa semanal.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="pagination-controls">
                <button onClick={handleWeeklyPrevPage} disabled={weeklyCurrentPage === 1}>Anterior</button>
                <span>{weeklyCurrentPage} / {weeklyTotalPages}</span>
                <button onClick={handleWeeklyNextPage} disabled={weeklyCurrentPage === weeklyTotalPages}>Siguiente</button>
              </div>
            </>
          )}
        </section>
      )}

      <ContactosSection />

      <section className="news-section">
        <h2>Nuestras Noticias y Novedades</h2>
        <p className="news-description">
          Mantente informado sobre las últimas novedades, eventos y actualizaciones de nuestra comunidad.
          Descubre todo lo que está sucediendo y mantente al día con nuestra sección de noticias.
        </p>
        <button onClick={() => navigate('/noticias')} className="news-button">
          Ver Todas las Noticias
        </button>
      </section>
    </div>
  );
};

export default Escuela;
