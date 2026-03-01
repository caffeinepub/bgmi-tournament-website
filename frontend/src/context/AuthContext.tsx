import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PlayerSession {
  mobile: string;
  displayName: string;
  bgmiPlayerId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  player: PlayerSession | null;
  login: (session: PlayerSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  player: null,
  login: () => {},
  logout: () => {},
});

const SESSION_KEY = 'raj_empire_player_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerSession | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const queryClient = useQueryClient();

  const login = useCallback((session: PlayerSession) => {
    setPlayer(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, []);

  const logout = useCallback(() => {
    setPlayer(null);
    localStorage.removeItem(SESSION_KEY);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!player, player, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
