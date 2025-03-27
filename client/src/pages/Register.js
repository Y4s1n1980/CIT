import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true); // 🔹 Activa el loader

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Por favor, introduce un nombre válido.");
            setLoading(false); // 🔹 Asegura que el loader se detiene si hay error de validación
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);
            await user.reload();
            const refreshedUser = auth.currentUser;

            await setDoc(doc(db, 'users', refreshedUser.uid), {
                name: trimmedName,
                email: refreshedUser.email,
                role: 'user',
                emailVerified: refreshedUser.emailVerified,
                createdAt: new Date(),
            });

            setMessage("Registro exitoso. Revisa tu correo para verificar tu cuenta.");

            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false); // 🔹 Siempre se detiene el loader
        }
    };

    return (
        <div className="register">
            <h2>Registro</h2>
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                />
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrarse'}
                </button>
            </form>
        </div>
    );
};

export default Register;
