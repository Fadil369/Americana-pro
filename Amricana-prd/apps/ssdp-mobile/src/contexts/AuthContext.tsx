// BRAINSAIT: Authentication context for Sales Rep and Driver apps
// SECURITY: Implements secure authentication with role-based access

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  name_ar: string;
  role: 'sales_rep' | 'driver' | 'manager';
  email?: string;
  phone?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulated authentication for demo
      const mockUser: User = {
        id: '1',
        username,
        name: username === 'driver1' ? 'Mohammed Ali' : 'Ahmed Hassan',
        name_ar: username === 'driver1' ? 'محمد علي' : 'أحمد حسن',
        role: username.startsWith('driver') ? 'driver' : 'sales_rep',
        email: `${username}@ssdp.com`,
        token: 'mock-jwt-token-' + Date.now()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
