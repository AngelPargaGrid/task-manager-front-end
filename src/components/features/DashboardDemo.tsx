import { useState } from 'react';
import { Dashboard } from '../layout/Dashboard';
import type { Task, StatWidget } from '../../types/dashboard.types';

export const DashboardDemo = () => {
  const [tasks, setTasks] = useState<Task[]>([
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
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
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

  const stats: StatWidget[] = [
    {
      label: 'Total Tasks',
      value: tasks.length,
      change: { value: 12, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'In Progress',
      value: tasks.filter((t) => t.status === 'in-progress').length,
      change: { value: 5, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Completed',
      value: tasks.filter((t) => t.status === 'completed').length,
      change: { value: 8, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Overdue',
      value: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
      ).length,
      change: { value: -2, isPositive: false },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const handleTaskClick = (taskId: string) => {
    console.log('Task clicked:', taskId);
    // In a real app, this would navigate to task details
  };

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
    console.log(`Task ${taskId} status changed to ${status}`);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleTaskAdd = (task: Partial<Task>) => {
    const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: task.title || 'New Task',
        description: task.description || '',
        status: 'todo',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        ...task,
    } as Task;
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  return (
    <Dashboard
      tasks={tasks}
      stats={stats}
      onTaskClick={handleTaskClick}
      onTaskStatusChange={handleTaskStatusChange}
      onTaskDelete={handleTaskDelete}
      onTaskAdd={handleTaskAdd}
    />
  );
};
