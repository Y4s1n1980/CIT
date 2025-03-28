import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Link } from 'react-router-dom';
import './ContactosSection.css';


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
        <div className="loader-wrapper">
        <div className="custom-loader"></div>
        <p>Cargando contactos...</p>
      </div>
      
      ) : (
        <>
          <div className="contacts-grid">
            {currentContacts.map((contact) => (
              <div key={contact.id} className="contact-card">
                <img
                  src={contact.photoUrl || '/default-avatar.png'}
                  alt={contact.name || 'Avatar'}
                  className="contact-avatar"
                />
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

export default ContactosSection;
