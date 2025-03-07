
import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './ProgramWeekly.css';

const ProgramWeekly = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'weeklySchedule'));
                const scheduleData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSchedule(scheduleData.filter(item => item.status)); // Mostrar solo clases activas
            } catch (error) {
                console.error('Error al cargar el programa semanal:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    return (
        <div className="program-weekly">
            <h2>Programa Semanal</h2>
            {loading ? <p>Cargando...</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>Día</th>
                            <th>Clase</th>
                            <th>Profesor</th>
                            <th>Tema</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.length > 0 ? (
                            schedule.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.day}</td>
                                    <td>{item.class}</td>
                                    <td>{item.teacher}</td>
                                    <td>{item.subject}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No hay clases disponibles.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ProgramWeekly;
