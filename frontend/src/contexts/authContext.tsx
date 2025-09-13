'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { User } from '@/types/user';

export interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isAuthenticated = currentUser !== null;

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        credentials: 'include', // send cookie containing JWT
      });

      if (response.ok) {
        try {
          const userData = await response.json();
          setCurrentUser(userData);
        } catch {
          setCurrentUser(null);
        }
      } else {
        // User logged out or token expired
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
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser, isAuthenticated, checkAuthStatus, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
