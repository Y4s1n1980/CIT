//Dashboard
import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import SociosSection from '../components/SociosSection';
import SubmissionsSection from '../components/SubmissionsSection';
import UserManagementSection from '../components/UserManagementSection';
import PendingRequestsSection from '../components/PendingRequestsSection';
import ArticleManagementSection from '../components/ArticleManagementSection';
import ServiceManagementSection from '../components/ServiceManagementSection';
import EventManagementSection from '../components/EventManagementSection';
import MultimediaManagementSection from '../components/MultimediaManagementSection';
import NewsManagementSection from '../components/NewsManagementSection'; 
import { useAuth } from '../contexts/AuthContext';
import CourseManagementSection from '../components/cursos/CourseManagementSection';
import JuntaManagement from '../components/JuntaManagement';
import UploadSchoolDocument from '../components/UploadSchoolDocument';
import ProgramWeeklySection from '../components/ProgramWeeklySection';
import ConsentimientosCookiesSection from '../components/ConsentimientosCookiesSection.js';
import ChatRequestsSection from '../components/ChatRequestsSection.js';
import './Dashboard.css';



const Dashboard = () => {
    const [activeSection, setActiveSection] = useState(null);
    const { isAdmin, user } = useAuth(); // Obtenemos isAdmin y user del contexto
    const navigate = useNavigate(); // Hook para redirección

      // Redirigir si el usuario no es admin
      useEffect(() => {
        if (!isAdmin) {
            navigate('/'); // Redirigir a la página de inicio o donde prefieras
        }
    }, [isAdmin, navigate]);
    

    const sections = [
        { name: 'Gestión de Socios', component: 'SociosSection' },
        { name: 'Tareas enviados por alumnos', component: 'SubmissionsSection' },
        { name: 'Solicitudes Escuela', component: 'PendingRequestsSection' },
        { name: 'Solicitudes Chat', component: 'ChatRequestsSection' },
        { name: 'Gestión de Usuarios', component: 'UserManagementSection' },
        { name: 'Gestión de Artículos', component: 'ArticleManagementSection' },
        { name: 'Gestión de Servicios', component: 'ServiceManagementSection' },
        { name: 'Gestión de Eventos', component: 'EventManagementSection' },
        { name: 'Gestión Multimedia', component: 'MultimediaManagementSection' },
        { name: 'Gestión de Noticias', component: 'NewsManagementSection' }, 
        { name: 'Gestión de Cursos', component: 'CourseManagementSection' },
        { name: 'Gestión de Junta Directiva', component: 'JuntaManagement' },
        { name: 'Gestión de Documentos Escolares', component: 'UploadSchoolDocument' },
        { name: 'Gestión de Programa Semanal', component: 'ProgramWeeklySection' },
        { name: 'Consentimientos de Cookies', component: 'ConsentimientosCookiesSection' },

    ];

    const renderSection = () => {
        switch (activeSection) {
            default:
                return <p>Selecciona una sección para comenzar.</p>;
            case 'SociosSection':
                return <SociosSection />;
            case 'SubmissionsSection':
                return <SubmissionsSection />;
            case 'PendingRequestsSection':
                return <PendingRequestsSection />;
            case 'ChatRequestsSection':
                return <ChatRequestsSection />;
            case 'UserManagementSection':
                return <UserManagementSection />;
            case 'ArticleManagementSection':
                return <ArticleManagementSection />;
            case 'ServiceManagementSection':
                return <ServiceManagementSection />;
            case 'EventManagementSection':
                return <EventManagementSection />;
            case 'MultimediaManagementSection':
                return <MultimediaManagementSection  />;
            case 'NewsManagementSection': 
                return <NewsManagementSection />;
            case 'CourseManagementSection':
                return <CourseManagementSection />;
            case 'JuntaManagement':
                return <JuntaManagement />;
            case 'UploadSchoolDocument':
                return <UploadSchoolDocument />;      
            case 'ProgramWeeklySection':
                return <ProgramWeeklySection />;
            case 'ConsentimientosCookiesSection':
                return <ConsentimientosCookiesSection />;

        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Panel de Administración</h1>
            <p>Bienvenido, {user?.displayName || "Administrador"} 👋</p>
            <div className="dashboard-cards">
                {sections.map((section, index) => (
                    <div
                        key={index}
                        className="dashboard-card"
                        onClick={() => setActiveSection(section.component)}
                    >
                        <h2>{section.name}</h2>
                    </div>
                ))}
            </div>
            <div className="dashboard-content">
                {renderSection()}
            </div>
        </div>
    );
};

export default Dashboard;

