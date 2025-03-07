import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './ProgramWeekly.css';

const ProgramWeekly = ({ onUpload }) => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 1; 

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'programaSemanal'));
                const scheduleData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSchedule(scheduleData.filter(item => item.status));
            } catch (error) {
                console.error('Error al cargar el programa semanal:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    // Paginación
    const totalPages = Math.ceil(schedule.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = schedule.slice(indexOfFirstItem, indexOfLastItem);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div className="program-weekly-container">
            <h2>Programa Semanal</h2>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="program-weekly-card-container">
                    {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                            <div className="program-weekly-card" key={item.id}>
                                <p><strong>Día:</strong> {item.day}</p>
                                <p><strong>Clase:</strong> {item.class}</p>
                                <p><strong>Profesor:</strong> {item.teacher}</p>
                                <p><strong>Tema:</strong> {item.subject}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay clases disponibles.</p>
                    )}
                </div>
            )}

            {/* Controles de paginación */}
            <div className="program-weekly-pagination">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                >
                    Anterior
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    Siguiente
                </button>
            </div>

            {/* Botón de cerrar */}
            <button
                className="program-weekly-close-btn"
                onClick={onUpload}
            >
                Cerrar
            </button>
        </div>
    );
};

export default ProgramWeekly;
