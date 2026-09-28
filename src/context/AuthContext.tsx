import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  allUsers: User[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchDemoUser: (userId: string) => Promise<boolean>;
  fetchUsers: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('madar_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('madar_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/users', { headers });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (e) {
      console.warn('Could not fetch users list:', e);
    }
  }, [token]);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('madar_user', JSON.stringify(data.user));
      } else {
        // Token expired or invalid, auto-login with default owner demo
        await autoLoginDefaultDemo();
      }
    } catch (e) {
      console.warn('Failed to verify token:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const autoLoginDefaultDemo = async () => {
    try {
      // Default initial login as Imtiyaz Alam (Managing Director, Owner)
      const res = await fetch('/api/auth/switch-demo-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_imtiyaz_alam' }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('madar_token', data.token);
        localStorage.setItem('madar_user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.error('Error auto-logging demo user:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      autoLoginDefaultDemo();
    }
  }, [token, fetchCurrentUser]);

  useEffect(() => {
    if (user && token) {
      fetchUsers();
    }
  }, [user, token, fetchUsers]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('madar_token', data.token);
        localStorage.setItem('madar_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  };

  const switchDemoUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/switch-demo-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('madar_token', data.token);
        localStorage.setItem('madar_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Switch user error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
        localStorage.setItem('madar_user', JSON.stringify(resData.user));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Update profile error:', e);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('madar_token');
    localStorage.removeItem('madar_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        allUsers,
        isLoading,
        login,
        logout,
        switchDemoUser,
        fetchUsers,
        updateProfile,
      }}
    >
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
