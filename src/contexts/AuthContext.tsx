import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }
      const userData = await auth.checkAuth();
      setUser(userData);
    } catch (error) {
      console.error('Auth state check failed:', error);
      setUser(null);
      auth.logout();
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        await checkAuthState();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await auth.login({ email, password });
      if (!token) {
        throw new Error('No token received from server');
      }
      setUser(user);
      return await checkAuthState(); // Verify the token works
    } catch (error) {
      console.error('Login failed:', error);
      auth.logout();
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const { token, user } = await auth.register(data);
      if (!token) {
        throw new Error('No token received from server');
      }
      setUser(user);
      return await checkAuthState(); // Verify the token works
    } catch (error) {
      console.error('Registration failed:', error);
      auth.logout();
      throw error;
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
