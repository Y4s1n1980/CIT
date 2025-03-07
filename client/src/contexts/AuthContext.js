// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isApproved, setIsApproved] = useState(false);

    const handleLogin = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            if (!user.emailVerified) {
                await auth.signOut(); // Cerrar sesión inmediatamente
                throw new Error("Debes verificar tu correo antes de iniciar sesión.");
            }
    
            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };
    
    
    

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Usuario autenticado:", user); 
            if (user) {
                setCurrentUser(user);
                
                
                const userDocRef = doc(db, 'users', user.uid);

                // Escucha activa para actualizar en tiempo real si el usuario es admin o está aprobado
                onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.data();
                        setIsAdmin(userData.role === 'admin');
                        setIsApproved(userData.isApproved === true);
                    } else {
                        
                        setIsAdmin(false);
                        setIsApproved(false);
                    }
                });
                 
            } else {
                setCurrentUser(null);
                setIsAdmin(false);
                setIsApproved(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, isAdmin, isApproved, handleLogin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
