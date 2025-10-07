import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import HomeLayout from '@/app/(main)/layout';

// Mock the Navbar component
jest.mock('@/components/layout/Navbar', () => {
  return function MockNavbar() {
    return <header data-testid="navbar">Navbar</header>;
  };
});

// Mock the Footer component
jest.mock('@/components/layout/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

describe('HomeLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders layout with navbar, main content, and footer', () => {
    render(
      <HomeLayout>
        <div>Test content</div>
      </HomeLayout>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('applies correct CSS classes for flexbox layout', () => {
    const { container } = render(
      <HomeLayout>
        <div>Test content</div>
      </HomeLayout>
    );

    const layoutDiv = container.firstChild;
    expect(layoutDiv).toHaveClass('flex', 'flex-col', 'min-h-screen');
  });

  test('main element has flex-grow class', () => {
    render(
      <HomeLayout>
        <div>Test content</div>
      </HomeLayout>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('flex-grow');
    expect(mainElement).toContainElement(screen.getByText('Test content'));
  });

  test('renders children inside main element', () => {
    render(
      <HomeLayout>
        <div data-testid="child-component">Child content</div>
        <p>Additional content</p>
      </HomeLayout>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toContainElement(screen.getByTestId('child-component'));
    expect(mainElement).toContainElement(screen.getByText('Additional content'));
  });

  test('handles undefined children gracefully', () => {
    render(<HomeLayout>{undefined}</HomeLayout>);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeEmptyDOMElement();
  });

  test('handles null children gracefully', () => {
    render(<HomeLayout>{null}</HomeLayout>);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeEmptyDOMElement();
  });

  test('renders multiple children correctly', () => {
    render(
      <HomeLayout>
        <div>First child</div>
        <span>Second child</span>
        <p>Third child</p>
      </HomeLayout>
    );

    const mainElement = screen.getByRole('main');
    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
    expect(screen.getByText('Third child')).toBeInTheDocument();

    expect(mainElement).toContainElement(screen.getByText('First child'));
    expect(mainElement).toContainElement(screen.getByText('Second child'));
    expect(mainElement).toContainElement(screen.getByText('Third child'));
  });

  test('maintains correct DOM structure', () => {
    const { container } = render(
      <HomeLayout>
        <div>Test content</div>
      </HomeLayout>
    );

    // Check the layout structure: div > [header, main, footer]
    const layoutDiv = container.firstChild;
    const children = layoutDiv?.childNodes;

    expect(children).toHaveLength(3);
    const headerElement = children?.[0] as HTMLElement | undefined;
    expect(headerElement).toHaveAttribute('data-testid', 'navbar');
    expect(children?.[1]?.nodeName).toBe('MAIN');
    const footerElement = children?.[2] as HTMLElement | undefined;
    expect(footerElement).toHaveAttribute('data-testid', 'footer');
  });
});
