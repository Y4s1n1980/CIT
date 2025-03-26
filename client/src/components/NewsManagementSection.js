import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import './NewsManagementSection.css';

const NewsManagementSection = () => {
  const [noticias, setNoticias] = useState([]);
  const [nuevaNoticia, setNuevaNoticia] = useState({
    titulo: '',
    descripcion: '',
    contenidoCompleto: '',
    autorNombre: '',
    estado: true,
  });
  const [imagenUrl, setImagenUrl] = useState(null);
  const { currentUser } = useAuth();

  // Cargar noticias existentes
  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const noticiasCollection = collection(db, 'noticias');
        const noticiasSnapshot = await getDocs(noticiasCollection);
        const noticiasData = noticiasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNoticias(noticiasData);
      } catch (error) {
        console.error('Error al cargar noticias:', error);
      }
    };
    fetchNoticias();
  }, []);

  // Valida la imagen antes de enviar
  const validateImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor, selecciona un archivo válido (JPEG, PNG, WebP).');
      return false;
    }
    return true;
  };

  // Manejar la subida al servidor
  const uploadToServer = async (formData) => {
    try {
      
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://cit-backend-iuqy.onrender.com';
      const response = await fetch(`${BASE_URL}/upload-news`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error desconocido en la subida');
      return data;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  };

  // Crear una nueva noticia
  const handleAddNoticia = async (e) => {
    e.preventDefault();
    if (!imagenUrl || !validateImage(imagenUrl)) return;

    // Construimos el formData con todos los campos
    const formData = new FormData();
    formData.append('file', imagenUrl); // Subir la imagen
    formData.append('coleccionDestino', 'noticias');
    formData.append('titulo', nuevaNoticia.titulo);
    formData.append('descripcion', nuevaNoticia.descripcion);
    formData.append('contenidoCompleto', nuevaNoticia.contenidoCompleto);
    formData.append('estado', nuevaNoticia.estado ? 'true' : 'false');

    // Agregar información del autor
    formData.append(
      'autorNombre',
      nuevaNoticia.autorNombre || currentUser?.displayName || 'Autor desconocido'
    );
    formData.append('autorEmail', currentUser?.email || 'Email desconocido');

    try {
      // Subir al servidor
      const data = await uploadToServer(formData);
      console.log('Respuesta del servidor:', data);

      // Actualizamos el estado local con la nueva noticia
      setNoticias([
        ...noticias,
        {
          id: data.docId, // viene del backend
          titulo: nuevaNoticia.titulo,
          descripcion: nuevaNoticia.descripcion,
          contenidoCompleto: nuevaNoticia.contenidoCompleto,
          estado: nuevaNoticia.estado,
          imagenUrl: data.imagenUrl, // viene del backend
          fechaCreacion: new Date(),
          autorNombre: nuevaNoticia.autorNombre || currentUser?.displayName || 'Autor desconocido',
          autorEmail: currentUser?.email || 'Email desconocido',
        },
      ]);

      // Limpiar formulario
      setNuevaNoticia({
        titulo: '',
        descripcion: '',
        contenidoCompleto: '',
        autorNombre: '',
        estado: true,
      });
      setImagenUrl(null);
    } catch (error) {
      console.error('Error al crear la noticia:', error);
      alert('Error al crear la noticia.');
    }
  };

  // Cambiar el estado de una noticia
  const handleToggleEstado = async (id, estadoActual) => {
    try {
      const noticiaRef = doc(db, 'noticias', id);
      await updateDoc(noticiaRef, { estado: !estadoActual });
      setNoticias(
        noticias.map((noticia) =>
          noticia.id === id ? { ...noticia, estado: !estadoActual } : noticia
        )
      );
    } catch (error) {
      console.error('Error al actualizar el estado de la noticia:', error);
    }
  };

  // Eliminar una noticia
  const handleDeleteNoticia = async (id) => {
    try {
      const noticiaRef = doc(db, 'noticias', id);
      await deleteDoc(noticiaRef);
      setNoticias(noticias.filter((noticia) => noticia.id !== id));
    } catch (error) {
      console.error('Error al eliminar la noticia:', error);
    }
  };

  return (
    <div className="news-management">
      <h2>Gestión de Noticias</h2>
      {/* Formulario para crear noticias */}
      <form onSubmit={handleAddNoticia} className="news-form">
        <input
          type="text"
          placeholder="Título de la noticia"
          value={nuevaNoticia.titulo}
          onChange={(e) =>
            setNuevaNoticia({ ...nuevaNoticia, titulo: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Descripción breve"
          value={nuevaNoticia.descripcion}
          onChange={(e) =>
            setNuevaNoticia({ ...nuevaNoticia, descripcion: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Contenido completo"
          value={nuevaNoticia.contenidoCompleto}
          onChange={(e) =>
            setNuevaNoticia({ ...nuevaNoticia, contenidoCompleto: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Nombre del autor"
          value={nuevaNoticia.autorNombre}
          onChange={(e) =>
            setNuevaNoticia({ ...nuevaNoticia, autorNombre: e.target.value })
          }
        />
        <input
          type="file"
          onChange={(e) => setImagenUrl(e.target.files[0])}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={nuevaNoticia.estado}
            onChange={(e) =>
              setNuevaNoticia({ ...nuevaNoticia, estado: e.target.checked })
            }
          />
          Activa
        </label>
        <button type="submit">Añadir Noticia</button>
      </form>

      {/* Tabla de noticias existentes */}
      <h2>Noticias Actuales</h2>
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Descripción</th>
            <th>Autor</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {noticias.map((noticia) => (
            <tr key={noticia.id}>
              <td>{noticia.titulo}</td>
              <td>{noticia.descripcion}</td>
              <td>{noticia.autorNombre || 'Desconocido'}</td>
              <td>
                {noticia.fechaCreacion
                  ? new Date(noticia.fechaCreacion.seconds * 1000).toLocaleString()
                  : 'Fecha no disponible'}
              </td>
              <td>{noticia.estado ? 'Activa' : 'Inactiva'}</td>
              <td>
                <button onClick={() => handleToggleEstado(noticia.id, noticia.estado)}>
                  {noticia.estado ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleDeleteNoticia(noticia.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewsManagementSection;
