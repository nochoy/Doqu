import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupForm from '@/components/auth/signup-form';

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

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('test_successful_signup_form_submission', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: 'mock-token-123',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const usernameInput = screen.getByPlaceholderText('Molly');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        }),
      });
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'mock-token-123');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('test_password_visibility_toggle', () => {
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/Password/) as HTMLInputElement;
    const toggleButton = screen.getByLabelText('Show password');

    // Initially password should be hidden
    expect(passwordInput.type).toBe('password');

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Click to hide password again
    const hideButton = screen.getByLabelText('Hide password');
    fireEvent.click(hideButton);
    expect(passwordInput.type).toBe('password');
  });

  test('test_redirect_after_successful_registration', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: 'mock-token-123',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const usernameInput = screen.getByPlaceholderText('Molly');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  test('test_invalid_email_validation_error', async () => {
    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const usernameInput = screen.getByPlaceholderText('Molly');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.change(emailInput, { target: { value: 'invalid@email' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
    });
  });

  test('test_api_registration_failure_handling', async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: 'Email already exists',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const usernameInput = screen.getByPlaceholderText('Molly');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('test_submit_button_disabled_during_submission', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: 'mock-token-123',
      }),
    };
    (fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );

    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const usernameInput = screen.getByPlaceholderText('Molly');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });
    const googleButton = screen.getByRole('button', { name: 'Login with Google' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(googleButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });

  test('test_access_token_storage_after_registration', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: 'mock-signup-token-456',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const usernameInput = screen.getByPlaceholderText('Molly');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        }),
      });
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'mock-signup-token-456');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('test_username_max_length_validation_error', async () => {
    render(<SignupForm />);

    const usernameInput = screen.getByPlaceholderText('Molly');
    const submitButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.change(usernameInput, {
      target: { value: 'thisusernameistoolongandexceedstwentycharacters' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Username cannot be greater than 20 characters.')
      ).toBeInTheDocument();
    });
  });
});
