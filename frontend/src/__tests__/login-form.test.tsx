import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '@/components/auth/login-form';

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

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('test_successful_login_with_valid_credentials', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: 'mock-token-123',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'mock-token-123');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('test_form_validation_displays_error_messages', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'invalid@email' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      expect(screen.getByText('Password cannot be blank.')).toBeInTheDocument();
    });
  });

  test('test_form_shows_loading_state_during_submission', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: 'mock-token-123',
      }),
    };
    (fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  test('test_login_failure_with_api_error_response', async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: 'Invalid credentials provided',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials provided')).toBeInTheDocument();
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('test_network_failure_during_login_request', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('test_malformed_api_response_handling', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        // Missing access_token field
        user: { id: 1, email: 'test@example.com' },
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', undefined);
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
