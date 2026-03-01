import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PlayerSession {
    mobile: string;
    displayName: string;
    bgmiPlayerId: string;
    principal?: string;
}

interface AuthContextType {
    player: PlayerSession | null;
    login: (player: PlayerSession) => void;
    logout: () => void;
    isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'raj_empire_player';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [player, setPlayer] = useState<PlayerSession | null>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const login = (playerData: PlayerSession) => {
        setPlayer(playerData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData));
    };

    const logout = () => {
        setPlayer(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ player, login, logout, isLoggedIn: !!player }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
