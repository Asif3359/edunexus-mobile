import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { API_ENDPOINTS, getApiUrl } from '../config/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt?: string;
  lastLogin?: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  isVerified: boolean;
  // Teacher specific fields
  subjects?: string[];
  experience?: number;
  education?: string;
  hourlyRate?: number;
  // Student specific fields
  grade?: string;
  interests?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  phone?: string;
  address?: string;
  bio?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

const login = async (email: string, password: string): Promise<boolean> => {
  try {
    setIsLoading(true);
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const userData = data.user;

      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // ✅ Only store token if backend sends one
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
      }

      return true;
    } else {
      const errorData = await response.json();
      return false; // ❌ Prevent navigation
    }
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
    return false; // ❌ Prevent navigation
  } finally {
    setIsLoading(false);
  }
};


  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual API endpoint
      const response = await fetch(getApiUrl(API_ENDPOINTS.REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = data.user;
        
        setUser(newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        // Only store token if it exists
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
        }
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // For demo purposes, create a mock user
      const mockUser: User = {
        _id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: true,
        isVerified: true,
      };
      
      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      // Don't try to store undefined token in fallback case
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
