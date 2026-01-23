import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  test('renders the main application title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Image to 3D Analyzer/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders the image uploader component', () => {
    render(<App />);
    const uploaderElement = screen.getByTestId('image-uploader');
    expect(uploaderElement).toBeInTheDocument();
  });

  test('renders the viewer 3D component', () => {
    render(<App />);
    const viewerElement = screen.getByTestId('viewer-3d');
    expect(viewerElement).toBeInTheDocument();
  });
});