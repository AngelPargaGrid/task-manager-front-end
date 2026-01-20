import React, { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthStatus, AuthUser } from './auth.types';

const STORAGE_KEY = 'app_fake_token';
const MOCK_USER: AuthUser = {
  id: 'u-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<AuthUser | null>(null);

  // On mount, check for an existing token to restore session.
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      setUser(MOCK_USER);
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const login = async (email: string, password: string) => {
    setStatus('checking');
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!email || !password) {
      setStatus('unauthenticated');
      throw new Error('Email y contraseña son obligatorios');
    }

    localStorage.setItem(STORAGE_KEY, 'fake-token');
    setUser({ ...MOCK_USER, email });
    setStatus('authenticated');
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setStatus('unauthenticated');
  };

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      logout,
      isChecking: status === 'checking',
    }),
    [status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
