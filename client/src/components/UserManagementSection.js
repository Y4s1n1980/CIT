import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const UserManagementSection = () => {
    const [users, setUsers] = useState([]);

    // Cargar usuarios desde Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            setUsers(usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        };
        fetchUsers();
    }, []);

    // Cambiar el rol del usuario
    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, { role: newRole });
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId ? { ...user, role: newRole } : user
            )
        );
    };

    // Activar/desactivar el estado del usuario
    const handleToggleActive = async (userId, isActive) => {
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, { isActive: !isActive });
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId ? { ...user, isActive: !isActive } : user
            )
        );
    };

    return (
        <section className="user-management">
            <h2>Gestión de Usuarios</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Activo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.isActive ? 'Sí' : 'No'}</td>
                            <td>
                                <button
                                    onClick={() =>
                                        handleToggleRole(user.id, user.role)
                                    }
                                >
                                    {user.role === 'admin'
                                        ? 'Cambiar a Usuario'
                                        : 'Cambiar a Admin'}
                                </button>
                                <button
                                    onClick={() =>
                                        handleToggleActive(user.id, user.isActive)
                                    }
                                >
                                    {user.isActive
                                        ? 'Desactivar'
                                        : 'Activar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default UserManagementSection;
