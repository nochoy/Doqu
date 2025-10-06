import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '@/components/auth/login-form';
import { AuthContext } from '@/contexts/authContext';
import { User } from '@/types/user';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock Next.js router and searchParams
const mockPush = jest.fn();
const mockGetSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGetSearchParams,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'mock-google-client-id';

// Mock AuthContext functions
const mockSetCurrentUser = jest.fn();
const mockCheckAuthStatus = jest.fn();
const mockLogout = jest.fn();

const mockAuthContextValue = {
  currentUser: null,
  setCurrentUser: mockSetCurrentUser,
  isAuthenticated: false,
  checkAuthStatus: mockCheckAuthStatus,
  logout: mockLogout,
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock search params for each test
    mockGetSearchParams.mockReturnValue(null);
  });

  // Helper to render LoginForm within a mocked AuthContext
  const renderLoginForm = (authContextValue = mockAuthContextValue) => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'mock-google-client-id';
    return render(
      <AuthContext.Provider value={authContextValue}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <LoginForm />
        </GoogleOAuthProvider>
      </AuthContext.Provider>
    );
  };

  test('test_successful_login_with_valid_credentials_and_redirects_home', async () => {
    const mockUser: User = {
      id: 'some-uuid',
      email: 'test@example.com',
      username: 'testuser',
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockUser),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
    });

    expect(mockSetCurrentUser).toHaveBeenCalledWith(mockUser);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('test_successful_login_with_valid_credentials_and_redirects_to_original_page', async () => {
    const mockUser: User = {
      id: 'some-uuid',
      email: 'test@example.com',
      username: 'testuser',
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockUser),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    // Mock the redirect query parameter
    mockGetSearchParams.mockReturnValue('/quiz/create');

    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1); // Only login fetch
    });

    expect(mockSetCurrentUser).toHaveBeenCalledWith(mockUser);
    // Assert that it redirects to the specified page
    expect(mockPush).toHaveBeenCalledWith('/quiz/create');
  });

  test('test_form_validation_displays_error_messages', async () => {
    renderLoginForm();
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
    expect(mockSetCurrentUser).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('test_form_shows_loading_state_during_submission', async () => {
    const mockUser: User = {
      id: 'some-uuid',
      email: 'test@example.com',
      username: 'testuser',
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockUser),
    };
    (fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );

    renderLoginForm();

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
    expect(mockSetCurrentUser).toHaveBeenCalledWith(mockUser);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('test_login_failure_with_api_error_response', async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: 'Invalid credentials provided',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials provided')).toBeInTheDocument();
    });

    expect(mockSetCurrentUser).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('test_network_failure_during_login_request', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    expect(mockSetCurrentUser).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('test_malformed_api_response_handling', async () => {
    // If response is not ok, the error message should be displayed
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: 'An unexpected error occurred',
      }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });

    expect(mockSetCurrentUser).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
