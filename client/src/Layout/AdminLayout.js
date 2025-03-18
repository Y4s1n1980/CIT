// src/Layout/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* Aquí podrías incluir un header o sidebar específico para admin */}
      <Outlet />
    </div>
  );
};

export default AdminLayout;
