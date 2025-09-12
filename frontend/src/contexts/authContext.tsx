"use client"

import React, { createContext, useCallback, useEffect, useState, useContext } from "react"
import { User } from "@/types/user";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (currentUser: User | null) => void;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => Promise.resolve(),
  isAuthenticated: false,
  checkAuthStatus: () => Promise.resolve(),
  logout: () => Promise.resolve()
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isAuthenticated = currentUser !== null;

  const checkAuthStatus = useCallback(async () => {
    try {      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        credentials: 'include',   // send cookie containing JWT
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {  // User logged out or token expired
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Check auth status error: ', err);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    setCurrentUser(null);
  }, []);

  // Check auth status immediately after initial site load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isAuthenticated, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>    
  );
};

/**
 * Custom hook to access the authentication context.
 *
 * This hook provides the current authentication state and functions to manage it.
 * It must be used within an AuthProvider to work correctly.
 *
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
