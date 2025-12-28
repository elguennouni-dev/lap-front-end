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
  const [users, setUsers] = useState<User[]>([]);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // State to temporarily hold the password for re-triggering login/resend
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    try {
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  }, []);

  // Initial load & check session/OTP status
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      // Check if we were awaiting OTP (persisted state)
      const pendingEmail = localStorage.getItem('pendingEmail');
      const storedPendingPassword = sessionStorage.getItem('pendingPassword');

      if (pendingEmail) {
        setIsAwaitingOtp(true);
        if (storedPendingPassword) {
          setPendingPassword(storedPendingPassword);
        }
      }
    }
  }, []);

  // Fetch users when authenticated
  useEffect(() => {
    if (currentUser) {
      refreshUsers();
    }
  }, [currentUser, refreshUsers]);

  const login = async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);

      if (result.success) {
        if (result.otpRequired) {
          setIsAwaitingOtp(true);
          localStorage.setItem('pendingEmail', email);
          // Store password temporarily for potential resend logic (securely in sessionStorage)
          sessionStorage.setItem('pendingPassword', password);
          setPendingPassword(password);
          return { success: true, message: result.message };
        }

        if (result.user) {
          setCurrentUser(result.user);
          localStorage.setItem('currentUser', JSON.stringify(result.user));
          localStorage.removeItem('pendingEmail');
          sessionStorage.removeItem('pendingPassword');
          setPendingPassword(null);
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
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        localStorage.removeItem('pendingEmail');
        sessionStorage.removeItem('pendingPassword');
        setPendingPassword(null);
        return { success: true, message: result.message };
      }

      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Erreur de vérification OTP' };
    }
  };

  const resendOtp = async (email: string) => {
    const password = pendingPassword || sessionStorage.getItem('pendingPassword');

    if (!password) {
      return { success: false, message: "Impossible de renvoyer le code sans mot de passe. Veuillez vous reconnecter." };
    }

    try {
      // FIX: Re-trigger login to generate a new OTP
      const result = await api.login(email, password);

      if (result.success && result.otpRequired) {
        // Login succeeded, new OTP has likely been sent
        console.log(`Resend OTP successful for ${email}: New OTP sent.`);
        return { success: true, message: 'Nouveau code OTP renvoyé.' };
      }
      // If login succeeds but doesn't require OTP (it logs in directly, shouldn't happen here)
      if (result.success && result.user) {
        return { success: false, message: "Erreur inattendue: Déjà connecté." };
      }

      return { success: false, message: result.message || 'Erreur lors du renvoi OTP' };
    } catch (error) {
      return { success: false, message: 'Erreur lors du renvoi OTP' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAwaitingOtp(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('pendingEmail');
    sessionStorage.removeItem('pendingPassword');
    setPendingPassword(null);
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