import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoogleLoginButton from '@/components/auth/google-login-button';
import { AuthContext } from '@/contexts/authContext';
import { User } from '@/types/user';

// --- Mocks Setup ---

// 1. Mock Next.js router and searchParams
const mockPush = jest.fn();
const mockGetSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGetSearchParams }),
}));

// 2. Mock fetch
global.fetch = jest.fn();

// 3. Mock Google's useGoogleLogin hook
// We mock the hook to return our own Jest mock function.
const mockGoogleLoginFn = jest.fn();
jest.mock('@react-oauth/google', () => ({
  useGoogleLogin: jest.fn(() => mockGoogleLoginFn),
}));

// 4. Mock AuthContext
const mockSetCurrentUser = jest.fn();
const mockAuthContextValue = {
  currentUser: null,
  setCurrentUser: mockSetCurrentUser,
  isAuthenticated: false,
  checkAuthStatus: jest.fn(),
  logout: jest.fn(),
};

// --- Test Suite ---

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSearchParams.mockReturnValue(null);
  });

  const renderGoogleLoginButton = (props = {}) => {
    return render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <GoogleLoginButton {...props} />
      </AuthContext.Provider>
    );
  };

  test('test_button_renders_correctly', () => {
    renderGoogleLoginButton();
    expect(screen.getByRole('button', { name: 'Login with Google' })).toBeInTheDocument();
  });

  test('test_google_login_flow_initiates_on_button_click', () => {
    renderGoogleLoginButton();
    fireEvent.click(screen.getByRole('button', { name: 'Login with Google' }));
    expect(mockGoogleLoginFn).toHaveBeenCalled();
  });

  test('test_successful_authentication_sets_user_and_redirects', async () => {
    const mockUser: User = {
      id: 'google-user-uuid',
      email: 'google.user@example.com',
      username: 'Google User',
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    // **THE FIX IS HERE**
    // We get the `onSuccess` callback from the arguments passed to `useGoogleLogin`
    // and then we call it when our mock function is executed.
    const useGoogleLoginMock = jest.requireMock('@react-oauth/google').useGoogleLogin;
    mockGoogleLoginFn.mockImplementation(() => {
      const config = useGoogleLoginMock.mock.calls[0][0]; // Get the config object
      config.onSuccess({ code: 'mock-google-code' });
    });

    renderGoogleLoginButton();
    fireEvent.click(screen.getByRole('button', { name: 'Login with Google' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
        expect.any(Object)
      );
    });

    expect(mockSetCurrentUser).toHaveBeenCalledWith(mockUser);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('test_authentication_fails_with_api_error_response', async () => {
    const mockOnError = jest.fn();

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: 'Google auth failed' }),
    });

    const useGoogleLoginMock = jest.requireMock('@react-oauth/google').useGoogleLogin;
    mockGoogleLoginFn.mockImplementation(() => {
      const config = useGoogleLoginMock.mock.calls[0][0];
      config.onSuccess({ code: 'mock-google-code' });
    });

    renderGoogleLoginButton({ onError: mockOnError });
    fireEvent.click(screen.getByRole('button', { name: 'Login with Google' }));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Google auth failed');
    });

    expect(mockSetCurrentUser).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('test_network_request_fails_during_authentication', async () => {
    const mockOnError = jest.fn();

    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const useGoogleLoginMock = jest.requireMock('@react-oauth/google').useGoogleLogin;
    mockGoogleLoginFn.mockImplementation(() => {
      const config = useGoogleLoginMock.mock.calls[0][0];
      config.onSuccess({ code: 'mock-google-code' });
    });

    renderGoogleLoginButton({ onError: mockOnError });
    fireEvent.click(screen.getByRole('button', { name: 'Login with Google' }));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Network error');
    });

    expect(mockSetCurrentUser).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('test_redirects_to_query_param_on_successful_login', async () => {
    const mockUser: User = {
      id: 'google-user-uuid',
      email: 'google.user@example.com',
      username: 'Google User',
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    mockGetSearchParams.mockReturnValue('/my-protected-page');

    const useGoogleLoginMock = jest.requireMock('@react-oauth/google').useGoogleLogin;
    mockGoogleLoginFn.mockImplementation(() => {
      const config = useGoogleLoginMock.mock.calls[0][0];
      config.onSuccess({ code: 'mock-google-code' });
    });

    renderGoogleLoginButton();
    fireEvent.click(screen.getByRole('button', { name: 'Login with Google' }));

    await waitFor(() => {
      expect(mockSetCurrentUser).toHaveBeenCalledWith(mockUser);
    });

    expect(mockPush).toHaveBeenCalledWith('/my-protected-page');
  });
});
