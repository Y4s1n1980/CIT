// src/pages/Login.js
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; 
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert('Inicio de sesión exitoso');
            navigate('/');
        } catch (error) {
            setError(error.message);
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
        <div className="login">
            <h2>Iniciar Sesión</h2>
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleLogin}>
                <input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Iniciar Sesión</button>
            </form>
            <button className="reset-password" onClick={handlePasswordReset}>¿Olvidaste tu contraseña?</button>
        </div>
    );
};

export default Login;
