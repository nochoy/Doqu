import { useContext } from 'react';
import { AuthContextType, AuthContext } from '@/contexts/authContext';

/**
 * Custom hook to access the authentication context.
 *
 * This hook provides the current authentication state and functions to manage it.
 * It must be used within an AuthProvider to work correctly.
 *
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
