// Dashboard.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAuth } from '../contexts/AuthContext'; // <-- Importamos el mock
import Dashboard from './Dashboard'; // <-- Tu componente real a testear

test('No muestra Dashboard si no hay usuario', () => {
  // Sobrescribimos la respuesta por defecto del mock
  useAuth.mockReturnValueOnce({
    currentUser: null,
    isAdmin: false,
    isApproved: false,
    handleLogin: jest.fn()
  });

  render(<Dashboard />);

  // Aquí revisas que, por ejemplo, muestre un mensaje de error o un redirect
  // o lo que quieras comprobar en esa situación.
  expect(screen.getByText(/por favor inicia sesión/i)).toBeInTheDocument();
});
