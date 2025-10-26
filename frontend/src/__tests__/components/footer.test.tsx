import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Footer from '@/components/layout/Footer';

describe('Footer', () => {
  test('render footer', () => {
    render(<Footer />);
    expect(screen.getByText('Footer Placeholder')).toBeInTheDocument();
  });
});
