import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
                role: 'user',
                emailVerified: false, // Nuevo campo para control interno
                createdAt: new Date(),
            });

            await sendEmailVerification(user); // 🔹 Enviar email de verificación

            setMessage("Registro exitoso. Revisa tu correo para verificar tu cuenta.");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="register">
            <h2>Registro</h2>
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};

export default Register;
