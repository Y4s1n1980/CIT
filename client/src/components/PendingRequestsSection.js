import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
} from 'firebase/firestore';
import './PendingRequestsSection.css';

const PendingRequestsSection = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Página actual
    const itemsPerPage = 7; // Número de registros por página

    // Cargar solicitudes pendientes desde Firestore
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
                    .sort(
                        (a, b) =>
                            b.timestamp?.seconds - a.timestamp?.seconds // Orden descendente por fecha
                    )
            );
        };
        fetchPendingRequests();
    }, []);

    // Aprobar solicitud
    const handleApproveRequest = async (requestId, userId) => {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { isApproved: true });

        const requestDocRef = doc(db, 'schoolAccessRequests', requestId);
        await updateDoc(requestDocRef, { status: 'approved' });

        setPendingRequests((prev) =>
            prev.map((request) =>
                request.id === requestId
                    ? { ...request, status: 'approved' }
                    : request
            )
        );
    };

    // Desactivar usuario
    const handleDeactivateUser = async (userId) => {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { isApproved: false });

        setPendingRequests((prev) =>
            prev.map((request) =>
                request.userId === userId
                    ? { ...request, status: 'deactivated' }
                    : request
            )
        );
    };

    // Rechazar solicitud
    const handleRejectRequest = async (requestId) => {
        await deleteDoc(doc(db, 'schoolAccessRequests', requestId));
        setPendingRequests((prev) =>
            prev.filter((request) => request.id !== requestId)
        );
    };

    // Paginación: Calcular datos para la página actual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRequests = pendingRequests.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // Total de páginas
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
                                {new Date(
                                    request.timestamp?.seconds * 1000
                                ).toLocaleString()}
                            </td>
                            <td
                                className={`status ${
                                    request.status === 'approved'
                                        ? 'approved'
                                        : request.status === 'deactivated'
                                        ? 'deactivated'
                                        : 'pending'
                                }`}
                            >
                                {request.status === 'approved'
                                    ? 'Aprobado'
                                    : request.status === 'deactivated'
                                    ? 'Desactivado'
                                    : 'Pendiente'}
                            </td>
                            <td>
    {request.status === 'approved' ? (
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
                onClick={() =>
                    handleApproveRequest(request.id, request.userId)
                }
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

            {/* Controles de paginación */}
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
