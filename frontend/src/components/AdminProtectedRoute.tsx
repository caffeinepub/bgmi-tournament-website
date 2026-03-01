import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAdminAuthenticated } = useAdminAuth();
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" />;
  }
  return <>{children}</>;
}
