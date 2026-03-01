import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PlayerSession {
  mobile: string;
  displayName: string;
  bgmiPlayerId: string;
  principal?: string;
}

interface AuthContextType {
  player: PlayerSession | null;
  isAuthenticated: boolean;
  login: (session: PlayerSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerSession | null>(() => {
    try {
      const stored = localStorage.getItem('raj_empire_player');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (session: PlayerSession) => {
    setPlayer(session);
    localStorage.setItem('raj_empire_player', JSON.stringify(session));
  };

  const logout = () => {
    setPlayer(null);
    localStorage.removeItem('raj_empire_player');
  };

  return (
    <AuthContext.Provider value={{ player, isAuthenticated: !!player, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
