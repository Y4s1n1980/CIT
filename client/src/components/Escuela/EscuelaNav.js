import React from 'react';
import './EscuelaNav.css';


const EscuelaNav = ({ setActiveSection }) => {
  return (
    <nav className="escuela-nav">
      <button onClick={() => setActiveSection('cursos')}>Cursos</button>
      <button onClick={() => setActiveSection('calendario')}>Calendario</button>
      <button onClick={() => setActiveSection('documentos')}>Documentos</button>
      <button onClick={() => setActiveSection('enviar')}>Enviar Archivos</button>
      <button onClick={() => setActiveSection('programaSemanal')}>Programa Semanal</button>
    </nav>
  );
};

export default EscuelaNav;
