// src/components/ChatRequestsSection.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    getDoc
} from 'firebase/firestore';
import './PendingRequestsSection.css';

const ChatRequestsSection = () => {
    const [chatRequests, setChatRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchChatRequests = async () => {
            const requestsCollection = collection(db, 'chatAccessRequests');
            const requestsSnapshot = await getDocs(requestsCollection);
            setChatRequests(
                requestsSnapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
            );
        };
        fetchChatRequests();
    }, []);

    const handleApproveRequest = async (requestId, userId) => {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            await updateDoc(userDocRef, { chatApproved: true });
        }

        const requestDocRef = doc(db, 'chatAccessRequests', requestId);
        await updateDoc(requestDocRef, { estado: 'approved' });

        setChatRequests((prev) =>
            prev.map((request) =>
                request.id === requestId ? { ...request, estado: 'approved' } : request
            )
        );
    };

    const handleDeactivateUser = async (userId) => {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            await updateDoc(userDocRef, { chatApproved: false });
        }

        setChatRequests((prev) =>
            prev.map((request) =>
                request.userId === userId ? { ...request, estado: 'deactivated' } : request
            )
        );
    };

    const handleRejectRequest = async (requestId) => {
        await deleteDoc(doc(db, 'chatAccessRequests', requestId));
        setChatRequests((prev) => prev.filter((request) => request.id !== requestId));
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRequests = chatRequests.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(chatRequests.length / itemsPerPage);

    return (
        <section className="access-requests">
            <h2>Solicitudes Chat</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRequests.map((request) => (
                        <tr key={request.id}>
                            <td>{request.id}</td>
                            <td>{request.name || 'Nombre desconocido'}</td>
                            <td>{request.email}</td>
                            <td>
                                {request.createdAt?.seconds
                                    ? new Date(request.createdAt.seconds * 1000).toLocaleString()
                                    : 'Sin fecha'}
                            </td>
                            <td className={`status ${request.estado === 'approved' ? 'approved' : request.estado === 'deactivated' ? 'deactivated' : 'pending'}`}>
                                {request.estado === 'approved' ? 'Aprobado' : request.estado === 'deactivated' ? 'Desactivado' : 'Pendiente'}
                            </td>
                            <td>
                                {request.estado === 'approved' ? (
                                    <button
                                        className="deactivate-btn"
                                        onClick={() => handleDeactivateUser(request.userId)}
                                    >
                                        Desactivar
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="approve-btn"
                                            onClick={() => handleApproveRequest(request.id, request.userId)}
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleRejectRequest(request.id)}
                                        >
                                            Rechazar
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        className={currentPage === index + 1 ? 'active' : ''}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </section>
    );
};

export default ChatRequestsSection;
