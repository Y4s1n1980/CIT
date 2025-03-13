// components/ProgramWeeklyDashboard.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import './ProgramWeeklySection.css';

const ProgramWeeklySection = () => {
  // Estado para el formulario de nuevo programa
  const [day, setDay] = useState('');
  const [className, setClassName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [subject, setSubject] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  // Lista de programas subidos
  const [programs, setPrograms] = useState([]);

  // Estados para edición (solo uno a la vez)
  const [editingId, setEditingId] = useState(null);
  const [editDay, setEditDay] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [editSubject, setEditSubject] = useState('');

  // Para "Ver más"
  const [visibleCount, setVisibleCount] = useState(6);

  // Obtención en tiempo real de los programas
  useEffect(() => {
    const q = collection(db, 'programaSemanal');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const progData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      // Ordenamos por createdAt descendente (si existe)
      progData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setPrograms(progData);
    });
    return () => unsubscribe();
  }, []);

  // Función para agregar un nuevo programa
  const handleAddProgram = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      await addDoc(collection(db, 'programaSemanal'), {
        day, // se guarda como string "YYYY-MM-DD" desde el input type="date"
        class: className,
        teacher,
        subject,
        status: true,
        createdAt: Timestamp.now(),
      });
      alert('Programa agregado correctamente.');
      // Limpiar formulario
      setDay('');
      setClassName('');
      setTeacher('');
      setSubject('');
    } catch (error) {
      console.error('Error al subir el programa:', error);
      alert('Error al subir el programa.');
    } finally {
      setLoadingForm(false);
    }
  };

  // Función para borrar un programa
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este programa?')) {
      try {
        await deleteDoc(doc(db, 'programaSemanal', id));
      } catch (error) {
        console.error('Error al eliminar el programa:', error);
      }
    }
  };

  // Función para cambiar el estado (activar/desactivar)
  const handleToggleStatus = async (program) => {
    try {
      const newStatus = !program.status;
      await updateDoc(doc(db, 'programaSemanal', program.id), { status: newStatus });
    } catch (error) {
      console.error('Error al cambiar el estado del programa:', error);
    }
  };

  // Funciones de edición
  const handleEdit = (program) => {
    setEditingId(program.id);
    // Si day es Timestamp, convertirlo; sino, usar el string directamente
    if (typeof program.day === "object" && program.day?.toDate) {
      setEditDay(program.day.toDate().toISOString().split('T')[0]);
    } else {
      setEditDay(program.day);
    }
    setEditClassName(program.class);
    setEditTeacher(program.teacher);
    setEditSubject(program.subject);
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'programaSemanal', id), {
        day: editDay,
        class: editClassName,
        teacher: editTeacher,
        subject: editSubject,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error al actualizar el programa:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // "Ver más": incrementar la cantidad visible en 6
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const visiblePrograms = programs.slice(0, visibleCount);

  return (
    <div className="program-weekly-dashboard">
      <h2>Gestión de Programa Semanal</h2>
      
      {/* Formulario para agregar un programa */}
      <div className="form-container">
        <h3>Agregar Programa</h3>
        <form onSubmit={handleAddProgram}>
          <div className="form-group">
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Clase"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Profesor"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Tema"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loadingForm}>
            {loadingForm ? 'Subiendo...' : 'Subir Programa'}
          </button>
        </form>
      </div>

      {/* Lista de programas en forma de tarjetas */}
      <div className="cards-container">
        {visiblePrograms.map(program => (
          <div className="program-card" key={program.id}>
            {editingId === program.id ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Día</label>
                  <input
                    type="date"
                    value={editDay}
                    onChange={(e) => setEditDay(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Clase</label>
                  <input
                    type="text"
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Profesor</label>
                  <input
                    type="text"
                    value={editTeacher}
                    onChange={(e) => setEditTeacher(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tema</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="card-actions">
                  <button onClick={() => handleSaveEdit(program.id)}>Guardar</button>
                  <button onClick={handleCancelEdit}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="card-content">
                <p>
                  <strong>Día:</strong>{" "}
                  {typeof program.day === "object" && program.day?.toDate
                    ? program.day.toDate().toLocaleDateString()
                    : program.day}
                </p>
                <p><strong>Clase:</strong> {program.class}</p>
                <p><strong>Profesor:</strong> {program.teacher}</p>
                <p><strong>Tema:</strong> {program.subject}</p>
                <p><strong>Estado:</strong> {program.status ? "Activo" : "Inactivo"}</p>
                <div className="card-actions">
                  <button onClick={() => handleEdit(program)}>Editar</button>
                  <button onClick={() => handleToggleStatus(program)}>
                    {program.status ? "Desactivar" : "Activar"}
                  </button>
                  <button onClick={() => handleDelete(program.id)}>Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón "Ver más" */}
      {visibleCount < programs.length && (
        <div className="load-more-container">
          <button onClick={handleLoadMore}>Ver más</button>
        </div>
      )}
    </div>
  );
};

export default ProgramWeeklySection;
