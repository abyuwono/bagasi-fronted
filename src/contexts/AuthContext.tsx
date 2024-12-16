import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, checkAuth } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check auth state on mount and token change
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.log('Checking auth state with token...');
        const response = await checkAuth();
        console.log('Auth check response:', response);

        if (response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          // If no user in response, clear auth state
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error: any) {
        console.error('Auth state check failed:', error);
        // Clear auth state on error
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login...');
      
      // Clear any existing token
      localStorage.removeItem('token');
      
      const response = await login({ email, password });
      console.log('Login response:', response);

      if (!response.token) {
        throw new Error('No token received from server');
      }

      // Store token first
      localStorage.setItem('token', response.token);

      if (response.user) {
        // Set user state after confirming token is stored
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('Login successful, user state updated');
      } else {
        throw new Error('No user data in response');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    login: handleLogin,
    logout,
    loading
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
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
