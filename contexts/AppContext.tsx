import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  isAwaitingOtp: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  users: User[];
  refreshUsers: () => Promise<void>;
  currentView: string;
  setCurrentView: (view: string) => void;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAwaitingOtp, setIsAwaitingOtp] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const refreshUsers = useCallback(async () => {
    try {
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);

      if (result.success && result.user) {
        if (result.user.roles.includes('ADMIN')) {
          setIsAwaitingOtp(true);
          // Store email for OTP verification
          localStorage.setItem('pendingEmail', email);
          return { success: true, message: result.message };
        } else {
          setCurrentUser(result.user);
          localStorage.setItem('currentUser', JSON.stringify(result.user));
          return { success: true, message: result.message };
        }
      }

      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const result = await api.verifyOtp(email, otp);

      if (result.success && result.user) {
        setCurrentUser(result.user);
        setIsAwaitingOtp(false);
        setPendingEmail('');
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        return { success: true, message: result.message };
      }

      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Erreur de vérification OTP' };
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const result = await api.resendOtp(email);
      return result;
    } catch (error) {
      return { success: false, message: 'Erreur lors du renvoi OTP' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAwaitingOtp(false);
    setPendingEmail('');
    localStorage.removeItem('currentUser');
    setCurrentView('dashboard');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      isAwaitingOtp,
      login,
      verifyOtp,
      logout,
      users,
      refreshUsers,
      currentView,
      setCurrentView,
      resendOtp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};