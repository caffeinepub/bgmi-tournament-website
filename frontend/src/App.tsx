import React from 'react';
import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet, Navigate } from '@tanstack/react-router';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TournamentsPage from './pages/TournamentsPage';
import DashboardPage from './pages/DashboardPage';
import TermsPage from './pages/TermsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

const rootRoute = createRootRoute({
    component: () => (
        <AuthProvider>
            <AdminAuthProvider>
                <Outlet />
            </AdminAuthProvider>
        </AuthProvider>
    ),
});

const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'layout',
    component: Layout,
});

const indexRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/',
    component: HomePage,
});

const registerRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/register',
    component: RegisterPage,
});

const loginRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/login',
    component: LoginPage,
});

const tournamentsRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/tournaments',
    component: TournamentsPage,
});

const dashboardRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/dashboard',
    component: () => (
        <ProtectedRoute>
            <DashboardPage />
        </ProtectedRoute>
    ),
});

const termsRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/terms',
    component: TermsPage,
});

const adminLoginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/dashboard',
    component: () => (
        <AdminProtectedRoute>
            <AdminDashboardPage />
        </AdminProtectedRoute>
    ),
});

const routeTree = rootRoute.addChildren([
    layoutRoute.addChildren([
        indexRoute,
        registerRoute,
        loginRoute,
        tournamentsRoute,
        dashboardRoute,
        termsRoute,
    ]),
    adminLoginRoute,
    adminDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return <RouterProvider router={router} />;
}
