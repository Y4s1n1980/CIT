import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, getDoc, limit, doc, getDocs, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CalendarioSection from './CalendarioSection';
import EnviarArchivosSection from '../components/EnviarArchivosSection';
import { serverTimestamp } from 'firebase/firestore';
import EscuelaNav from '../components/Escuela/EscuelaNav';
import CursosSection from '../components/Escuela/CursosSection';
import DocumentosSection from '../components/Escuela/DocumentosSection';
import ProgramaSemanalSection from '../components/Escuela/ProgramaSemanalSection';
import NoticiasSection from '../components/Escuela/NoticiasSection';
import HeroEscuela from '../components/Escuela/HeroEscuela';
import ContactosSection from '../components/Escuela/ContactosSection';
import './Escuela.css';



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
    <>
      <HeroEscuela />
      <EscuelaNav setActiveSection={setActiveSection} />
      {activeSection === 'cursos' && <CursosSection lastCourse={lastCourse} />}
      {activeSection === 'calendario' && <CalendarioSection />}
      {activeSection === 'documentos' && (
        <DocumentosSection
          loadingDocuments={loadingDocuments}
          currentDocs={currentDocs}
          expandedCardId={expandedCardId}
          handleCardClick={handleCardClick}
          docPage={docPage}
          totalDocPages={totalDocPages}
          handleDocPrevPage={handleDocPrevPage}
          handleDocNextPage={handleDocNextPage}
        />
      )}
      {activeSection === 'enviar' && <EnviarArchivosSection />}
      {activeSection === 'programaSemanal' && (
        <ProgramaSemanalSection
          weeklyPrograms={weeklyPrograms}
          currentWeeklyPrograms={currentWeeklyPrograms}
          expandedWeeklyId={expandedWeeklyId}
          handleWeeklyCardClick={handleWeeklyCardClick}
          weeklyCurrentPage={weeklyCurrentPage}
          weeklyTotalPages={weeklyTotalPages}
          handleWeeklyPrevPage={handleWeeklyPrevPage}
          handleWeeklyNextPage={handleWeeklyNextPage}
        />
      )}
      <ContactosSection />
      <NoticiasSection />
    </>
  );
  
};

export default Escuela;
