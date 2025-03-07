import React, { useState } from 'react';
import './FinancialDashboard.css';
import FinancialViernes from './FinancialViernes';
import FinancialDonaciones from './FinancialDonaciones';
import FinancialRamadan from './FinancialRamadan';
import FinancialUsers from './FinancialUsers';
import FinancialSocios from './FinancialSocios';

const FinancialDashboard = () => {
  const [activeSection, setActiveSection] = useState(null);

  const handleCardClick = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <section className="financial-dashboard">
      <h2>Área Financiera</h2>
      <div className="card-container">
        <div
          className="financial-card"
          onClick={() => handleCardClick('users')}
        >
          <h3>Usuarios Financieros</h3>
          <p>Gestión de usuarios registrados.</p>
        </div>
        <div
          className="financial-card"
          onClick={() => handleCardClick('viernes')}
        >
          <h3>Aportaciones del Viernes</h3>
          <p>Control de aportaciones semanales.</p>
        </div>
        <div
          className="financial-card"
          onClick={() => handleCardClick('donaciones')}
        >
          <h3>Donaciones Generales</h3>
          <p>Gestión de donaciones Generales.</p>
        </div>
        <div
          className="financial-card"
          onClick={() => handleCardClick('ramadan')}
        >
          <h3>Donaciones del Ramadan</h3>
          <p>Control de aportaciones del Ramadan.</p>
        </div>
        <div
          className="financial-card"
          onClick={() => handleCardClick('socios')}
        >
          <h3>Donaciones Mensuales de Socios</h3>
          <p>Gestión de pagos recurrentes.</p>
        </div>
      </div>

      <div className="financial-section">
        {activeSection === 'users' && <FinancialUsers />}
        {activeSection === 'viernes' && <FinancialViernes />}
        {activeSection === 'donaciones' && <FinancialDonaciones />}
        {activeSection === 'ramadan' && <FinancialRamadan />}
        {activeSection === 'socios' && <FinancialSocios />}
      </div>
    </section>
  );
};

export default FinancialDashboard;
