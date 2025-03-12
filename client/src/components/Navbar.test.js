import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

describe('Navbar', () => {
  test('debe mostrar los enlaces principales', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const inicioLink = screen.getByRole('link', { name: /inicio/i });
    const serviciosLink = screen.getByRole('link', { name: /servicios/i });
    const contactoLink = screen.getByRole('link', { name: /contacto/i });

    expect(inicioLink).toBeInTheDocument();
    expect(serviciosLink).toBeInTheDocument();
    expect(contactoLink).toBeInTheDocument();
  });
});
