"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JwtPayload {
  user: User;
  exp: number;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const loadUserFromToken = useCallback(() => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
    } catch (error) {
      console.error("Failed to decode token", error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromToken();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        loadUserFromToken();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, [loadUserFromToken]);

  const handleAuthSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    const decoded = jwtDecode<JwtPayload>(newToken);
    setUser(decoded.user);
    setToken(newToken);
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || 'Falha no login');
    }
    handleAuthSuccess(data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.errors ? data.errors[0].msg : (data.msg || 'Falha no registro');
      throw new Error(errorMessage);
    }
    handleAuthSuccess(data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
