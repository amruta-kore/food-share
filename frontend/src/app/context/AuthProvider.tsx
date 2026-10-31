'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';

export type Role = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  verified?: boolean;
  organization?: string;
  phone?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    nameOrFormData: string | FormData,
    email?: string,
    password?: string,
    role?: Role
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setUserDirectly: (user: User | null, token?: string) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getDashboardRoute = (role: Role) => {
    switch (role) {
      case 'DONOR':
        return '/donor';
      case 'NGO':
        return '/ngo';
      case 'VOLUNTEER':
        return '/volunteer';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  };

  const syncAuthCookies = (token: string | null, role: string | null) => {
    if (typeof document === 'undefined') return;
    if (token && role) {
      document.cookie = `authToken=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `userRole=${encodeURIComponent(role)}; path=/; max-age=604800; SameSite=Lax`;
    } else {
      document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'userRole=; path=/; max-age=0; SameSite=Lax';
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;

    if (cachedUser && token) {
      try {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
        setLoading(false);
      } catch (_) {}
    }

    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('authUser', JSON.stringify(data.user));
            syncAuthCookies(token, data.user.role);
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('authUser');
            syncAuthCookies(null, null);
            setUser(null);
          }
        })
        .catch(() => {
          if (!cachedUser) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('authUser');
            syncAuthCookies(null, null);
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      syncAuthCookies(null, null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const getApiUrl = (endpoint: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (base && typeof window !== 'undefined') {
      return `${base}${endpoint}`;
    }
    return endpoint;
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        return {
          success: false,
          message: res.status === 502 || res.status === 503 || res.status === 504
            ? 'Backend server is waking up or temporarily unavailable. Please try again in 30 seconds.'
            : text && text.length < 120
            ? text
            : `Server returned HTTP ${res.status}. Please check your backend connection.`,
        };
      }

      if (res.ok && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        syncAuthCookies(data.accessToken, data.user.role);
        setUser(data.user);
        let targetUrl = getDashboardRoute(data.user.role);
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const redirectParam = params.get('redirect');
          if (redirectParam && redirectParam.startsWith('/')) {
            targetUrl = redirectParam;
          }
          window.location.href = targetUrl;
        } else {
          router.push(targetUrl);
        }
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Server connection error. Please ensure backend is running.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    nameOrFormData: string | FormData,
    email?: string,
    password?: string,
    role?: Role
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      let res: Response;
      if (nameOrFormData instanceof FormData) {
        res = await fetch(getApiUrl('/api/auth/register'), {
          method: 'POST',
          body: nameOrFormData,
        });
      } else {
        res = await fetch(getApiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameOrFormData, email, password, role }),
        });
      }
      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        return {
          success: false,
          message: res.status === 502 || res.status === 503 || res.status === 504
            ? 'Backend server is waking up or temporarily unavailable. Please try again in 30 seconds.'
            : text && text.length < 120
            ? text
            : `Server returned HTTP ${res.status}. Please check your backend connection.`,
        };
      }

      if (res.ok && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        syncAuthCookies(data.accessToken, data.user.role);
        setUser(data.user);
        router.push(getDashboardRoute(data.user.role));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Server connection error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authUser');
    syncAuthCookies(null, null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
  };

  const setUserDirectly = (newUser: User | null, token?: string) => {
    if (token) localStorage.setItem('accessToken', token);
    syncAuthCookies(token || localStorage.getItem('accessToken'), newUser?.role || null);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUserDirectly }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
