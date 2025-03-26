import React, { useState, useEffect } from 'react';
import './CourseManagementSection.css';
import { db } from '../../services/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import axios from 'axios'; 
import { useAuth } from '../../contexts/AuthContext'; 

const CourseManagementSection = () => {
    const { currentUser } = useAuth();
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 3;
    const [newCourse, setNewCourse] = useState({
        titulo: '',
        descripcion: '',
    });
    const [imagen, setImagen] = useState(null);

    // Cargar los cursos existentes
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesSnapshot = await getDocs(collection(db, 'cursos'));
                const coursesData = coursesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCourses(coursesData);
            } catch (error) {
                console.error('Error al cargar cursos:', error);
            }
        };
        fetchCourses();
    }, []);

     // Calcular índices de la paginación
     const indexOfLastCourse = currentPage * coursesPerPage;
     const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
     const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
 
     // Cambiar página
     const paginate = (pageNumber) => setCurrentPage(pageNumber);

       // Eliminar curso
    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este curso?')) {
            try {
                await deleteDoc(doc(db, 'cursos', id));
                setCourses(courses.filter((course) => course.id !== id));
            } catch (error) {
                console.error('Error al eliminar el curso:', error);
            }
        }
    };

       // Cambiar estado del curso (Activar/Desactivar)
       const toggleCourseStatus = async (id, estadoActual) => {
        try {
            const courseRef = doc(db, 'cursos', id);
            await updateDoc(courseRef, { estado: !estadoActual });
            setCourses(
                courses.map((course) =>
                    course.id === id ? { ...course, estado: !estadoActual } : course
                )
            );
        } catch (error) {
            console.error('Error al cambiar el estado del curso:', error);
        }
    };

    // Manejar subida de imagen y datos del curso
    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!imagen) {
            alert('Por favor, selecciona una imagen para el curso.');
            return;
        }
    
        try {
            // Crear el FormData con los datos del curso e imagen
            const formData = new FormData();
            formData.append('imagen', imagen);
            formData.append('titulo', newCourse.titulo);
            formData.append('descripcion', newCourse.descripcion);
            formData.append('autorNombre', currentUser.displayName || 'Nombre desconocido');
            formData.append('autorEmail', currentUser.email || 'Email desconocido');
            console.log('FormData:', [...formData.entries()]);
    
            // Enviar al backend
            const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
            const response = await axios.post(`${BASE_URL}/upload-course`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            const { imagenUrl } = response.data;
    
            // Actualizar el estado con el nuevo curso
            setCourses([
                ...courses,
                {
                    titulo: newCourse.titulo,
                    descripcion: newCourse.descripcion,
                    autorNombre: currentUser.displayName || 'Nombre desconocido',
                    autorEmail: currentUser.email || 'Email desconocido',
                    estado: true, // Por defecto, los cursos estarán activos
                    imagenUrl,
                    fechaCreacion: new Date(), 
                },
            ]);
    
            // Limpiar formulario
            setNewCourse({ titulo: '', descripcion: '' });
            setImagen(null);
    
            alert('Curso añadido con éxito.');
        } catch (error) {
            console.error('Error al añadir el curso:', error);
            alert('Error al añadir el curso.');
        }
    };
    
    


    return (
        <div className="course-management">
            <h2>Gestión de Cursos</h2>
            <form onSubmit={handleAddCourse} className="course-form">
                <input
                    type="text"
                    placeholder="Título del curso"
                    value={newCourse.titulo}
                    onChange={(e) => setNewCourse({ ...newCourse, titulo: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Descripción breve"
                    value={newCourse.descripcion}
                    onChange={(e) => setNewCourse({ ...newCourse, descripcion: e.target.value })}
                    required
                ></textarea>
                <input
                    type="file"
                    onChange={(e) => setImagen(e.target.files[0])}
                    required
                />
                <button type="submit">Añadir Curso</button>
            </form>
            
    
            {/* Tabla de cursos */}
            <table className="courses-table">
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
                    {currentCourses.map((course) => (
                        <tr key={course.id}>
                            <td>{course.titulo}</td>
                            <td>{course.descripcion.slice(0, 50)}...</td>
                            <td>{course.autorNombre || 'Desconocido'}</td>
                            <td>
                                {course.fechaCreacion
                                    ? new Date(course.fechaCreacion.seconds * 1000).toLocaleDateString()
                                    : 'Sin fecha'}
                            </td>
                            <td>{course.estado ? 'Activo' : 'Inactivo'}</td>
                            <td>
                                <button
                                    className="toggle-status"
                                    onClick={() => toggleCourseStatus(course.id, course.estado)}
                                >
                                    {course.estado ? 'Desactivar' : 'Activar'}
                                </button>
                                <button
                                    className="delete-course"
                                    onClick={() => handleDelete(course.id)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
    
            {/* Paginación */}
            <div className="pagination">
                {Array.from(
                    { length: Math.ceil(courses.length / coursesPerPage) },
                    (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={currentPage === i + 1 ? 'active' : ''}
                        >
                            {i + 1}
                        </button>
                    )
                )}
            </div>
        </div>
    );
    
};

export default CourseManagementSection;
