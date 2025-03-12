// Ejemplo Footer.test.js
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

test('Footer muestra texto básico', () => {
  render(<Footer />);
  expect(screen.getByText(/copyright/i)).toBeInTheDocument();
});
