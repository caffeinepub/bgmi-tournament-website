import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminAuthContextType {
    isAdminLoggedIn: boolean;
    adminLogin: (username: string, password: string) => boolean;
    adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'raj_empire_admin';
const ADMIN_USERNAME = 'Empire Esports';
const ADMIN_PASSWORD = 'Shivam803119&';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
        return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    });

    const adminLogin = (username: string, password: string): boolean => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            setIsAdminLoggedIn(true);
            localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
            return true;
        }
        return false;
    };

    const adminLogout = () => {
        setIsAdminLoggedIn(false);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
    };

    return (
        <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminLogin, adminLogout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
    return ctx;
}
