import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from '@/app/layout';

// Mock the Providers component
jest.mock('@/components/providers', () => {
  return function MockProviders({ children }: { children: React.ReactNode }) {
    return <div data-testid="providers">{children}</div>;
  };
});

// Mock font variables
jest.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'inter-variable' }),
  Poppins: () => ({ variable: 'poppins-variable' }),
  Merriweather: () => ({ variable: 'merriweather-variable' }),
}));

// Mock GoogleOAuthProvider
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="google-oauth-provider">{children}</div>
  ),
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('test_renders_html_structure_with_lang_attribute', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    const htmlElement = document.documentElement;
    expect(htmlElement).toHaveAttribute('lang', 'en');
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('test_applies_font_variables_to_body_class', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    const bodyElement = document.body;
    expect(bodyElement).toHaveClass('inter-variable');
    expect(bodyElement).toHaveClass('poppins-variable');
    expect(bodyElement).toHaveClass('merriweather-variable');
    expect(bodyElement).toHaveClass('font-sans');
  });

  test('test_wraps_children_with_providers', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    const providersElement = screen.getByTestId('providers');
    expect(providersElement).toBeInTheDocument();
    expect(providersElement).toContainElement(screen.getByText('Test content'));
  });

  test('test_handles_undefined_children_gracefully', () => {
    render(<RootLayout>{undefined}</RootLayout>);

    const providersElement = screen.getByTestId('providers');
    expect(providersElement).toBeInTheDocument();
    expect(providersElement).toBeEmptyDOMElement();
  });

  test('test_renders_with_undefined_font_variables', () => {
    // Mock undefined font variables
    jest.doMock('next/font/google', () => ({
      Inter: () => ({ variable: undefined }),
      Poppins: () => ({ variable: undefined }),
      Merriweather: () => ({ variable: undefined }),
    }));

    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    const bodyElement = document.body;
    expect(bodyElement).toHaveClass('font-sans');
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
