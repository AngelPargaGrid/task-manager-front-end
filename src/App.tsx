import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardDemo } from './components/features/DashboardDemo';
import { ProductCardDemo } from './components/features/ProductCardDemo';
import { UserProfileDemo } from './components/features/UserProfileDemo';
import { NavBarDemo } from './components/features/NavBarDemo';
import type { SidebarItem, Task } from './types/dashboard.types';
import { SettingsPanelDemo } from './components/features/SettingsPanelDemo';

type Page = '/dashboard' | '/tasks' | '/projects' | '/team' | '/calendar' | '/settings' | '/profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('/dashboard');
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design new landing page',
      description: 'Create a modern and responsive landing page design for the product launch',
      status: 'in-progress',
      priority: 'high',
      assignee: {
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['design', 'frontend'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Implement user authentication',
      description: 'Set up JWT-based authentication system with login and registration',
      status: 'todo',
      priority: 'urgent',
      assignee: {
        name: 'Mike Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      },
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['backend', 'security'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Write API documentation',
      description: 'Document all REST API endpoints with examples and error codes',
      status: 'completed',
      priority: 'medium',
      assignee: {
        name: 'Emily Davis',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      },
      tags: ['documentation'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Fix mobile responsive issues',
      description: 'Address layout problems on mobile devices for the dashboard',
      status: 'in-progress',
      priority: 'high',
      assignee: {
        name: 'Alex Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      },
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['frontend', 'mobile'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment pipeline',
      status: 'blocked',
      priority: 'medium',
      assignee: {
        name: 'David Kim',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      },
      tags: ['devops'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      title: 'Optimize database queries',
      description: 'Review and optimize slow database queries for better performance',
      status: 'todo',
      priority: 'low',
      assignee: {
        name: 'Lisa Wang',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      },
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['backend', 'performance'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      title: 'Create user onboarding flow',
      description: 'Design and implement a smooth onboarding experience for new users',
      status: 'in-progress',
      priority: 'high',
      assignee: {
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['design', 'ux'],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '8',
      title: 'Add dark mode support',
      description: 'Implement dark mode theme across the entire application',
      status: 'completed',
      priority: 'medium',
      assignee: {
        name: 'Mike Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      },
      tags: ['frontend', 'ui'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

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
      badge: tasks.filter((t) => t.status !== 'completed').length,
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

  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
    role: 'Project Manager',
  };

  const handleSidebarItemClick = (href: string) => {
    setCurrentPage(href as Page);
  };

  const handleProfileClick = () => {
    setCurrentPage('/profile');
  };

  const handleLogout = () => {
    console.log('Logging out');
    alert('User logged out');
  };

  const renderPage = () => {
    switch (currentPage) {
      case '/dashboard':
        return <DashboardDemo />;
      case '/tasks':
        return <NavBarDemo />;
      case '/projects':
        return <ProductCardDemo />;
      case '/profile':
        return <UserProfileDemo />;
      case '/team':
        return <UserProfileDemo />;
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

  return (
    <AppLayout
      sidebarItems={sidebarItems}
      user={user}
      currentPath={currentPage}
      onSidebarItemClick={handleSidebarItemClick}
      onProfileClick={handleProfileClick}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default App;
