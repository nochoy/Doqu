'use client';

import { User } from '@/types/auth';

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export async function signInWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail || 'Login failed' };
    }

    const data = await response.json();
    return {
      success: true,
      user: data.user,
      token: data.access_token,
    };
  } catch (error) {
    console.error('signInWithEmail() error: ', error);
    return { success: false, error: 'Network error' };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('getCurrentUser() error: ', error);
    return null;
  }
}

export function saveAuthData(token: string, user: User): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
