import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoogleLoginButton from '@/components/auth/google-login-button';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

// Mock Google OAuth
const mockLogin = jest.fn();
jest.mock('@react-oauth/google', () => ({
  useGoogleLogin: jest.fn(config => {
    mockLogin.mockImplementation(() => {
      if (config.onSuccess) {
        config.onSuccess({ code: 'mock-google-code' });
      }
    });
    return mockLogin;
  }),
}));

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('test_button_renders_with_google_branding_and_accessibility', () => {
    render(<GoogleLoginButton />);

    const button = screen.getByRole('button', { name: 'Login with Google' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Login with Google');
    expect(button).toHaveAttribute('type', 'button');
    expect(screen.getByText('Login with Google')).toBeInTheDocument();
  });

  test('test_google_login_flow_initiates_on_button_click', () => {
    render(<GoogleLoginButton />);

    const button = screen.getByRole('button', { name: 'Login with Google' });
    fireEvent.click(button);

    expect(mockLogin).toHaveBeenCalled();
  });

  test('test_successful_authentication_stores_token_and_redirects', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: 'mock-google-token-123',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<GoogleLoginButton />);

    const button = screen.getByRole('button', { name: 'Login with Google' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: 'mock-google-code' }),
      });
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'mock-google-token-123');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('test_authentication_fails_with_api_error_response', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: 'Google authentication failed',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<GoogleLoginButton />);

    const button = screen.getByRole('button', { name: 'Login with Google' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error occurred during Google login: ',
        expect.any(Error)
      );
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('test_authentication_fails_when_access_token_missing', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        user: { id: 1, email: 'test@example.com' },
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<GoogleLoginButton />);

    const button = screen.getByRole('button', { name: 'Login with Google' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error occurred during Google login: ',
        expect.any(Error)
      );
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('test_network_request_fails_during_authentication', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<GoogleLoginButton />);

    const button = screen.getByRole('button', { name: 'Login with Google' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error occurred during Google login: ',
        expect.any(Error)
      );
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
