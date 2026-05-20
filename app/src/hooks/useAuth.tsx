import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  secretCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
   
    const savedUser = localStorage.getItem('greenspace_user');
    const token = localStorage.getItem('greenspace_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) return false;

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('greenspace_user', JSON.stringify(data.user));
      localStorage.setItem('greenspace_token', data.token); 
      return true;
    } catch (error) {
      console.error('Помилка логіну:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('greenspace_user');
    localStorage.removeItem('greenspace_token');
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) return false;

      const responseData = await response.json();
      setUser(responseData.user);
      localStorage.setItem('greenspace_user', JSON.stringify(responseData.user));
      localStorage.setItem('greenspace_token', responseData.token);
      return true;
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}