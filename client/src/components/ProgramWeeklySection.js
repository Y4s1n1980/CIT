import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const ProgramWeeklyForm = ({ onClose }) => {
    const [day, setDay] = useState('');
    const [className, setClassName] = useState('');
    const [teacher, setTeacher] = useState('');
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'programaSemanal'), {
                day,
                class: className,
                teacher,
                subject,
                status: true,
                createdAt: Timestamp.now(),
            });
    
            alert('Programa agregado correctamente.');
            onClose();
        } catch (error) {
            console.error('Error al subir el programa:', error);
            alert('Error al subir el programa.');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="program-form">
            <h2>Agregar Programa Semanal</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Día" value={day} onChange={(e) => setDay(e.target.value)} required />
                <input type="text" placeholder="Clase" value={className} onChange={(e) => setClassName(e.target.value)} required />
                <input type="text" placeholder="Profesor" value={teacher} onChange={(e) => setTeacher(e.target.value)} required />
                <input type="text" placeholder="Tema" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                <button type="submit" disabled={loading}>{loading ? 'Subiendo...' : 'Subir Programa'}</button>
            </form>
        </div>
    );
};

export default ProgramWeeklyForm;
