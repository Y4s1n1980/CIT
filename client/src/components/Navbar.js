import React, { useState, useEffect } from 'react'; 
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../services/firebase';
import { Modal, Button } from 'react-bootstrap';
import { collection, addDoc } from 'firebase/firestore';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const { currentUser, isAdmin, isApproved } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showSubmenuNosotros, setShowSubmenuNosotros] = useState(false);
    const [showSubmenuServicios, setShowSubmenuServicios] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            console.log("Scroll Y:", window.scrollY); 
            setIsScrolled(window.scrollY > 50);
            setShowScrollTop(window.scrollY > 150);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRequestAccess = async () => {
        try {
            await addDoc(collection(db, 'schoolAccessRequests'), {
                userId: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || 'Nombre desconocido',
                status: 'pending',
                timestamp: new Date(),
            });
            alert('Solicitud enviada');
            setShowModal(false);
        } catch (error) {
            console.error('Error al enviar solicitud de acceso:', error);
        }
    };

    const handleEscuelaClick = (e) => {
        e.preventDefault();
        if (currentUser && isApproved) {
            navigate('/escuela');
        } else if (currentUser) {
            setShowModal(true);
        } else {
            navigate('/auth');
        }
    };

    return (
        <>
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <h1>Comunidad Islamica Tordera</h1>
                <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
                <ul className={isMenuOpen ? 'nav-menu open' : 'nav-menu'}>
                <li>
                    <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
                </li>

                {currentUser?.emailVerified && (
                    <li
                        onMouseEnter={() => setShowSubmenuNosotros(true)}
                        onMouseLeave={() => setShowSubmenuNosotros(false)}
                    >
                        <Link to="/nosotros" onClick={() => setIsMenuOpen(false)}>Nosotros</Link>
                        {showSubmenuNosotros && (
                            <ul className="submenu">
                                <li><Link to="/blog" onClick={() => setIsMenuOpen(false)}>Blog</Link></li>
                                <li><Link to="/eventos" onClick={() => setIsMenuOpen(false)}>Eventos</Link></li>
                                <li><Link to="/multimedia" onClick={() => setIsMenuOpen(false)}>Multimedia</Link></li>
                            </ul>
                        )}
                    </li>
                )}

                <li
                    onMouseEnter={() => setShowSubmenuServicios(true)}
                    onMouseLeave={() => setShowSubmenuServicios(false)}
                >
                    <Link to="/servicios" onClick={() => setIsMenuOpen(false)}>Servicios</Link>
                    {showSubmenuServicios && (
                        <ul className="submenu">
                            <li><Link to="/nuestros-servicios" onClick={() => setIsMenuOpen(false)}>Explorar</Link></li>
                        </ul>
                    )}
                </li>

                <li><Link to="/contacto" onClick={() => setIsMenuOpen(false)}>Contacto</Link></li>
                <li><Link to="/donaciones" onClick={() => setIsMenuOpen(false)}>Donar</Link></li>

                {currentUser?.emailVerified && (
                    <>
                        <li><Link to="/chat" onClick={() => setIsMenuOpen(false)}>Chat</Link></li>
                        <li>
                            <Link to="/escuela" onClick={(e) => { 
                                handleEscuelaClick(e);
                                setIsMenuOpen(false);
                            }}>
                                Escuela
                            </Link>
                        </li>
                    </>
                )}

                {isAdmin && (
                    <>
                        <li><Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>P.Control</Link></li>
                        <li><Link to="/area-financiera" onClick={() => setIsMenuOpen(false)}>A.Financiera</Link></li>
                    </>
                )}

                {!currentUser ? (
                    <li><Link to="/auth" onClick={() => setIsMenuOpen(false)}>Iniciar Sesión</Link></li>
                ) : (
                    <li><button onClick={() => { auth.signOut(); setIsMenuOpen(false); }}>Cerrar Sesión</button></li>
                )}
                </ul>
            </nav>
            {showScrollTop && (
                <button className="scroll-to-top show" onClick={scrollToTop}>↑</button>
            )}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Solicitud de Acceso a Escuela</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Para acceder a la sección de la escuela, necesitas solicitar permiso.</p>
                    <Button onClick={handleRequestAccess}>Solicitar acceso</Button>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Navbar;
