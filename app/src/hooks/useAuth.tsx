import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { mockUsers, WORKER_SECRET_CODE } from '@/data/mockData';

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
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('greenspace_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('greenspace_user');
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    if (data.role === 'worker' && data.secretCode !== WORKER_SECRET_CODE) {
      return false;
    }

    if (mockUsers.find(u => u.email === data.email)) {
      return false;
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
    };

    if (data.role === 'worker') {
      newUser.salary_hourly_rate = 150;
      newUser.client_hourly_rate = 300;
    }

    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('greenspace_user', JSON.stringify(newUser));
    return true;
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
