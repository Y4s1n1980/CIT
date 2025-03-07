import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { currentUser, isAdmin, isApproved } = useAuth();

    console.log("Current User:", currentUser);
    console.log("isAdmin:", isAdmin);
    console.log("isApproved:", isApproved);

    // Si el usuario no está autenticado, redirige a la página de autenticación
    if (!currentUser) {
        return <Navigate to="/auth" />;
    }

    // Si es una ruta de administrador y el usuario no es administrador, redirige a la página de inicio
    if (adminOnly && !isAdmin) {
        return <Navigate to="/" />;
    }

    // Si es una ruta de usuario estándar y el usuario no está aprobado, redirige a la página de aprobación
    if (!adminOnly && !isApproved) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;

