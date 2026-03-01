import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TournamentsPage from './pages/TournamentsPage';
import TermsPage from './pages/TermsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Outlet />
    </div>
  );
}

const rootRoute = createRootRoute({ component: Outlet });

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'adminLayout',
  component: AdminLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: HomePage,
});

const registerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/register',
  component: RegisterPage,
});

const playerRegisterRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/player/register',
  component: RegisterPage,
});

const loginRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/login',
  component: LoginPage,
});

const playerLoginRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/player/login',
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

const playerDashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/player',
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
  getParentRoute: () => adminLayoutRoute,
  path: '/admin',
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/dashboard',
  component: () => (
    <AdminProtectedRoute>
      <AdminDashboardPage />
    </AdminProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    homeRoute,
    registerRoute,
    playerRegisterRoute,
    loginRoute,
    playerLoginRoute,
    tournamentsRoute,
    dashboardRoute,
    playerDashboardRoute,
    termsRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminLoginRoute,
    adminDashboardRoute,
  ]),
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <RouterProvider router={router} />
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
