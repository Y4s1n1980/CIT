// src/components/PendingRequestsSection.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {collection,getDocs,updateDoc,deleteDoc,doc,} from 'firebase/firestore';
import './PendingRequestsSection.css';

const PendingRequestsSection = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchPendingRequests = async () => {
            const requestsCollection = collection(db, 'schoolAccessRequests');
            const requestsSnapshot = await getDocs(requestsCollection);
            setPendingRequests(
                requestsSnapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
            );
        };
        fetchPendingRequests();
    }, []);

    const handleApproveRequest = async (requestId, userId) => {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { isApproved: true });

        const requestDocRef = doc(db, 'schoolAccessRequests', requestId);
        await updateDoc(requestDocRef, { estado: 'approved', status: 'approved' });

        setPendingRequests((prev) =>
            prev.map((request) =>
                request.id === requestId ? { ...request, estado: 'approved' } : request
            )
        );
    };

    const handleDeactivateUser = async (userId) => {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { isApproved: false });

        setPendingRequests((prev) =>
            prev.map((request) =>
                request.userId === userId ? { ...request, estado: 'deactivated' } : request
            )
        );
    };

    const handleRejectRequest = async (requestId) => {
        await deleteDoc(doc(db, 'schoolAccessRequests', requestId));
        setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRequests = pendingRequests.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(pendingRequests.length / itemsPerPage);

    return (
        <section className="access-requests">
            <h2>Solicitudes Escuela</h2>
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
                                {request.timestamp?.seconds
                                    ? new Date(request.timestamp.seconds * 1000).toLocaleString()
                                    : 'Sin fecha'}
                            </td>
                            <td className={`status ${request.estado === 'approved' ? 'approved' : request.estado === 'deactivated' ? 'deactivated' : 'pending'}`}>
                                {request.estado === 'approved' ? 'Aprobado' : request.estado === 'deactivated' ? 'Desactivado' : 'Pendiente'}
                            </td>
                            <td>
                                {request.estado === 'approved' ? (
                                    <button className="deactivate-btn" onClick={() => handleDeactivateUser(request.userId)}>Desactivar</button>
                                ) : (
                                    <>
                                        <button className="approve-btn" onClick={() => handleApproveRequest(request.id, request.userId)}>Aprobar</button>
                                        <button className="reject-btn" onClick={() => handleRejectRequest(request.id)}>Rechazar</button>
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

export default PendingRequestsSection;
