import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './ConsentimientosCookiesSection.css';

const ConsentimientosCookiesSection = () => {
  const [consentimientos, setConsentimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const obtenerConsentimientos = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'cookieConsents'));
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConsentimientos(datos);
    } catch (error) {
      console.error('Error al obtener consentimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarConsentimiento = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este consentimiento?')) return;

    try {
      await deleteDoc(doc(db, 'cookieConsents', id));
      setConsentimientos(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error al eliminar el consentimiento:', error);
    }
  };

  useEffect(() => {
    obtenerConsentimientos();
  }, []);

  return (
    <div className="consentimientos-section">
      <h2>Consentimientos de Cookies</h2>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Consentimiento</th>
              <th>Última Actualización</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {consentimientos.map(item => (
              <tr key={item.id}>
                <td>{item.userId}</td>
                <td>{item.email}</td>
                <td>{item.consent ? '✅ Aceptado' : '❌ Rechazado'}</td>
                <td>{item.updatedAt?.toDate?.().toLocaleString?.() || 'Sin fecha'}</td>
                <td>
                  <button onClick={() => eliminarConsentimiento(item.id)}>
                    🗑 Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ConsentimientosCookiesSection;
