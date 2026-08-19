import { describe, test, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  test('muestra el título principal de la aplicación', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Image to 3D/i })).toBeInTheDocument();
  });

  test('muestra la zona de subida de imágenes', () => {
    render(<App />);
    const zone = screen.getByTestId('image-upload-zone');
    expect(zone).toBeInTheDocument();
    expect(zone).toHaveTextContent(/Sube tu Imagen/i);
    expect(zone).toHaveTextContent(/Seleccionar Archivo/i);
  });

  test('muestra el subtítulo de la marca en el encabezado', () => {
    render(<App />);
    const banner = screen.getByRole('banner');
    expect(within(banner).getByText(/AI Powered Analyzer/i)).toBeInTheDocument();
  });
});
