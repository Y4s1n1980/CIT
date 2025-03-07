import React, { useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { applyActionCode } from 'firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyEmail = () => {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const oobCode = searchParams.get('oobCode'); // Código del enlace

    useEffect(() => {
        if (oobCode) {
            applyActionCode(auth, oobCode)
                .then(() => {
                    setMessage('Correo verificado correctamente. Ahora puedes iniciar sesión.');
                    setTimeout(() => navigate('/login'), 3000);
                })
                .catch((error) => setMessage('Error al verificar el correo.'));
        }
    }, [oobCode, navigate]);

    return (
        <div className="verify-email">
            <h2>Verificación de Correo</h2>
            <p>{message}</p>
        </div>
    );
};

export default VerifyEmail;
