import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // Vista por días
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './CalendarioSection.css';

const CalendarioSection = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const eventsCollection = collection(db, 'schoolSchedule');
            const querySnapshot = await getDocs(eventsCollection);
            const eventsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title,
                start: doc.data().start.toDate(),
                end: doc.data().end.toDate(),
                extendedProps: {
                    room: doc.data().room,
                    description: doc.data().description,
                },
            }));
            setEvents(eventsData);
        };

        fetchEvents();
    }, []);

    return (
        <div className="calendario-section">
            <h2>Calendario Escolar</h2>
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventContent={(eventInfo) => (
                    <div>
                        <b>{eventInfo.event.title}</b>
                        {eventInfo.event.extendedProps.room && (
                            <div>Aula: {eventInfo.event.extendedProps.room}</div>
                        )}
                    </div>
                )}
            />
        </div>
    );
};

export default CalendarioSection;

