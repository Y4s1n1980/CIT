// src/App.js FINAL CORREGIDO Y SIN WARNINGS
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import NavbarLayout from './components/NavbarLayout';
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import Servicios from './pages/Servicios';
import Contacto from './pages/Contacto';
import Donaciones from './pages/Donaciones';
import Register from './pages/Register';
import Login from './pages/Login';
import Auth from './pages/Auth';
import Chat from './pages/Chat';
import Escuela from './pages/Escuela';
import Dashboard from './pages/Dashboard';
import FinancialDashboard from './components/areafinanciera/FinancialDashboard';
import ChatPrivado from './pages/ChatPrivado';
import Testimonios from './pages/Testimonios/Testimonios';
import Blog from './pages/blog/Blog';
import Articulo from './pages/blog/Articulo';
import Eventos from './pages/eventos/Eventos';
import EventoDetalles from './pages/eventos/EventoDetalles';
import MultimediaPage from './pages/MultimediaPage';
import NuestrosServicios from './pages/NuestrosServicios';
import Historia from './pages/Historia';
import NoticiaDetalle from './pages/noticias/NoticiaDetalle';
import Noticias from './pages/noticias/Noticias';
import Cursos from './pages/cursosdetalles/Cursos';
import CursosDetalle from './pages/cursosdetalles/CursosDetalle';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import VerifyEmail from './pages/VerifyEmail';
import MiembroDetalle from './pages/MiembroDetalle';
import Explora from './pages/Explora';
import CookiesLimitadas from './components/CookiesLimitadas';
import './App.css';

const routes = [
  {
    path: "/",
    element: <NavbarLayout />,
    children: [
      { path: "/", element: <Explora /> },
      { path: "/explora", element: <Explora /> },
      { path: "/home", element: <Home /> },
      { path: "/nosotros", element: <Nosotros /> },
      { path: "/historia", element: <Historia /> },
      { path: "/servicios", element: <Servicios /> },
      { path: "/nuestros-servicios", element: <NuestrosServicios /> },
      { path: "/nuestros-servicios/:id", element: <NuestrosServicios /> },
      { path: "/contacto", element: <Contacto /> },
      { path: "/donaciones", element: <Donaciones /> },
      { path: "/registro", element: <Register /> },
      { path: "/iniciar-sesion", element: <Login /> },
      { path: "/auth", element: <Auth /> },
      { path: "/testimonios", element: <Testimonios /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:id", element: <Articulo /> },
      { path: "/eventos", element: <Eventos /> },
      { path: "/eventos/:id", element: <EventoDetalles /> },
      { path: "/multimedia", element: <MultimediaPage /> },
      { path: "/noticias", element: <Noticias /> },
      { path: "/noticias/:id", element: <NoticiaDetalle /> },
      { path: "/cursos", element: <Cursos /> },
      { path: "/cursos/:id", element: <CursosDetalle /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/terms", element: <TermsOfService /> },
      { path: "/verify-email", element: <VerifyEmail /> },
      { path: "/miembro/:nombre", element: <MiembroDetalle /> },
      { path: "/cookies-bloqueadas", element: <CookiesLimitadas /> },


      // Rutas protegidas estándar
      {
        path: "/chat",
        element: <PrivateRoute><Chat /></PrivateRoute>
      },
      {
        path: "/escuela",
        element: <PrivateRoute><Escuela /></PrivateRoute>
      },
      {
        path: "/chat-escuela/:contactId",
        element: <PrivateRoute><ChatPrivado /></PrivateRoute>
      },

      // Rutas protegidas de admin
      {
        path: "/dashboard",
        element: <PrivateRoute adminOnly><Dashboard /></PrivateRoute>
      },
      {
        path: "/area-financiera",
        element: <PrivateRoute adminOnly><FinancialDashboard /></PrivateRoute>
      }
    ],
  },
];

const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
