import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification  } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Auth = () => {
    const { handleLogin } = useAuth(); // Importamos `handleLogin` correctamente

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setMessage('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Enviar correo de verificación
            await sendEmailVerification(user);
    
            // Guardar el usuario en Firestore
            await setDoc(doc(db, 'users', user.uid), {
                userId: user.uid, 
                name,
                email,
                role: 'user',
                isActive: true, 
                isApproved: false, 
                emailVerified: false,  // 🔹 Nuevo campo para verificarlo en Firestore
                createdAt: new Date()
            });
    
            setMessage("Usuario registrado con éxito. Verifica tu correo antes de iniciar sesión.");
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (isLogin) {
            const result = await handleLogin(email, password);
            if (!result.success) {
                setError(result.error);
            } else {
                setMessage("Inicio de sesión exitoso");
            }
        } else {
            await handleRegister(e);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setError('Por favor, ingresa tu correo electrónico para restablecer la contraseña');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Correo de restablecimiento enviado. Por favor, revisa tu bandeja de entrada.');
            setError('');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="auth">
            <h2>{isLogin ? "Iniciar sesión" : "Registro"}</h2>
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isLogin ? "Iniciar sesión" : "Registrarse"}</button>
            </form>
            {isLogin && (
                <button className="reset-password" onClick={handlePasswordReset}>
                    ¿Olvidaste tu contraseña?
                </button>
            )}
            <button className="toggle-auth" onClick={toggleAuthMode}>
                {isLogin ? "¿Necesitas una cuenta? Regístrate" : "¿Ya tienes una cuenta? Inicia sesión"}
            </button>
        </div>
    );
};

export default Auth;
