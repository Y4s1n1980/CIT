// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import Servicios from './pages/Servicios';
import Contacto from './pages/Contacto';
import Donaciones from './pages/Donaciones';
import Register from './pages/Register';
import Login from './pages/Login';
import Auth from './pages/Auth'; 
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Chat from './pages/Chat';
import Escuela from './pages/Escuela';
import Dashboard from './pages/Dashboard';
import FinancialDashboard from './components/areafinanciera/FinancialDashboard';
import ChatPrivado from './pages/ChatPrivado';
import Testimonios from './pages/Testimonios/Testimonios';
import Blog from './pages/blog/Blog';
import Articulo  from './pages/blog/Articulo';
import Eventos from './pages/eventos/Eventos';
import EventoDetalles from './pages/eventos/EventoDetalles'; 
import MultimediaPage from './pages/MultimediaPage';
import NuestrosServicios from './pages/NuestrosServicios';
import Historia from './pages/Historia';
import NoticiaDetalle from './pages/noticias/NoticiaDetalle';
import Noticias from './pages/noticias/Noticias';
import Cursos from './pages/cursosdetalles/Cursos';
import CursosDetalle from './pages/cursosdetalles/CursosDetalle';
import CookieBanner from './components/CookieBanner';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import VerifyEmail from './pages/VerifyEmail';
import MiembroDetalle from './pages/MiembroDetalle';
import './App.css';


function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/historia" element={<Historia />} /> 
                    <Route path="/servicios" element={<Servicios />} />
                    <Route path="/nuestros-servicios" element={<NuestrosServicios />} />
                    <Route path="/nuestros-servicios/:id" element={<NuestrosServicios />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/donaciones" element={<Donaciones />} />
                    <Route path="/registro" element={<Register />} />
                    <Route path="/iniciar-sesion" element={<Login />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/testimonios" element={<Testimonios />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<Articulo />} />
                    <Route path= "/eventos" element={<Eventos/>} />
                    <Route path="/eventos/:id" element={<EventoDetalles />} />
                    <Route path="/multimedia" element={<MultimediaPage />} />
                    <Route path="/noticias/:id" element={<NoticiaDetalle />} />
                    <Route path="/noticias" element={<Noticias />} />
                    <Route path="/cursos" element={<Cursos />} />
                    <Route path="/cursos/:id" element={<CursosDetalle />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/miembro/:nombre" element={<MiembroDetalle />} />

                    

                    {/* Rutas protegidas */}
                    <Route path="/chat" element={
                        <PrivateRoute>
                            <Chat />
                        </PrivateRoute>
                    } />
                    <Route path="/escuela" element={
                        <PrivateRoute>
                            <Escuela />
                        </PrivateRoute>
                    } />

                    <Route path="/chat-escuela/:contactId" element={
                        <PrivateRoute>
                            <ChatPrivado />
                        </PrivateRoute>
                    } />

                    {/* Rutas de administrador */}
                    <Route path="/dashboard" element={
                        <PrivateRoute adminOnly={true}>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/area-financiera" element={
                        <PrivateRoute adminOnly={true}>
                            <FinancialDashboard  />
                        </PrivateRoute>
                    } />
                </Routes>
                <>
            <CookieBanner />
            <Footer />
        </>
            </Router>
        </AuthProvider>
    );
}

export default App;
