import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/page';

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />);

    const heading = screen.getByText('Save and see your changes instantly.');

    expect(heading).toBeInTheDocument();
  });
});
