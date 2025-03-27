// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { currentUser, isAdmin, isApproved } = useAuth();
    const location = useLocation();

    console.log("Current User:", currentUser);
    console.log("isAdmin:", isAdmin);
    console.log("isApproved:", isApproved);

    if (!currentUser) {
        return <Navigate to="/auth" />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" />;
    }

    // 👉 Ruta especial: permitir acceso a /chat sin necesidad de isApproved
    const isChatRoute = location.pathname.startsWith("/chat");

    if (!adminOnly && !isApproved && !isChatRoute) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
