import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: () => void;
  logout: () => void;
  // Legacy aliases kept for backward compatibility
  login: (username: string, password: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  adminLogin: () => {},
  logout: () => {},
  login: () => false,
});

const ADMIN_AUTH_KEY = 'adminAuth';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });

  const adminLogin = useCallback(() => {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    setIsAdminAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdminAuthenticated(false);
    queryClient.clear();
  }, [queryClient]);

  // Legacy login kept for backward compat
  const login = useCallback((_username: string, _password: string): boolean => {
    adminLogin();
    return true;
  }, [adminLogin]);

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminLogin, logout, login }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
