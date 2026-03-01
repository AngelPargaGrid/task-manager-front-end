import { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardDemo } from './components/features/DashboardDemo';
import { ProductCardDemo } from './components/features/ProductCardDemo';
import { KanbanBoard } from './components/KanbanBoard';
import { ProfilePage } from './components/layout/ProfilePage';
import type { SidebarItem } from './types/dashboard.types';
import { SettingsPanelDemo } from './components/features/SettingsPanelDemo';
import { TeamDashboard } from './components/TeamDashboard/TeamDashboard';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import { ProtectedRoute } from './routes/ProtectedRoute';

type Page = '/dashboard' | '/tasks' | '/projects' | '/team' | '/calendar' | '/settings' | '/profile';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname;
    const validPages: Page[] = ['/dashboard', '/tasks', '/projects', '/team', '/calendar', '/settings', '/profile'];
    return validPages.includes(path as Page) ? (path as Page) : '/dashboard';
  });
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const { status, user: authUser, logout } = useAuth();

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const validPages: Page[] = ['/dashboard', '/tasks', '/projects', '/team', '/calendar', '/settings', '/profile'];
      if (validPages.includes(path as Page)) {
        setCurrentPage(path as Page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSidebarItemClick = (href: string) => {
    window.history.pushState({}, '', href);
    setCurrentPage(href as Page);
  };

  const handleProfileClick = () => {
    window.history.pushState({}, '', '/profile');
    setCurrentPage('/profile');
  };

  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Tasks',
      href: '/tasks',
      // badge: tasks.filter((t) => t.status !== 'completed').length, // Keeping this static or removed for now since tasks are in DashboardDemo
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: 'Team',
      href: '/team',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Calendar',
      href: '/calendar',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const renderPage = () => {
    switch (currentPage) {
      case '/dashboard':
        return <DashboardDemo />;
      case '/tasks':
        return <KanbanBoard />;
      case '/projects':
        return <ProductCardDemo />;
      case '/profile':
        return <ProfilePage user={{
            name: authUser?.name ?? 'John Doe',
            email: authUser?.email ?? 'john.doe@example.com',
            avatar: authUser?.avatar ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
            role: authUser?.role ?? 'Project Manager',
            bio: "Senior Project Manager with 10+ years of experience in agile methodologies and team leadership.",
            location: "San Francisco, CA",
            website: "johndoe.design",
            joinDate: "March 2023"
        }} />;
      case '/team':
        return <TeamDashboard />;
      case '/calendar':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {currentPage.charAt(1).toUpperCase() + currentPage.slice(2)} Page
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This page is coming soon...
            </p>
          </div>
        );
        case '/settings':
          return <SettingsPanelDemo />;
      default:
        return <DashboardDemo />;
    }
  };

  if (status === 'checking') {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (status === 'unauthenticated') {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <AppLayout
      sidebarItems={sidebarItems}
      user={
        authUser
          ? {
              name: authUser.name,
              email: authUser.email,
              avatar: authUser.avatar ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
              role: authUser.role,
            }
          : {
            name: 'Guest',
            email: '',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
            role: 'Guest',
          }
      }
      currentPath={currentPage}
      onSidebarItemClick={handleSidebarItemClick}
      onProfileClick={handleProfileClick}
      onLogout={handleLogout}
    >
      <ProtectedRoute>{renderPage()}</ProtectedRoute>
    </AppLayout>
  );
}

// Wrap the content with the AuthProvider to share auth state across the app
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
