// Navbar.test.js
import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import Navbar from './Navbar';

describe('Navbar con Providers reales', () => {
  test('debe renderizar enlaces si hay usuario logueado', async () => {
    renderWithProviders(<Navbar />);

    // Aquí se usará tu AuthProvider real
    // Esto significa que si no hay un usuario "real" en Firebase,
    // currentUser vendrá como null.
    // Podrías necesitar mocks parciales de Firebase.

    const homeLink = screen.getByText(/inicio/i);
    expect(homeLink).toBeInTheDocument();
  });
});

