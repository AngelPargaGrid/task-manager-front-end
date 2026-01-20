import React, { useState } from 'react';
import type { Task, TaskStatus } from '../../types/dashboard.types';
import { TaskCard } from '../ui/TaskCard';

export const TaskBoard: React.FC = () => {
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
      status: 'blocked',
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
        title: 'Fix navigation bug',
        description: 'Menu not closing on mobile when clicking outside',
        status: 'todo',
        priority: 'low',
        createdAt: new Date().toISOString(),
    }
  ]);

  const columns: { status: TaskStatus | 'todo'; title: string; color: string }[] = [
    { status: 'blocked', title: 'Blocked', color: 'bg-red-50 dark:bg-red-900/20' },
    { status: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { status: 'completed', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' },
  ];

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleDelete = (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Task
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-[800px] h-full pb-4">
          {columns.map(column => (
            <div key={column.status} className={`flex-1 min-w-[280px] rounded-xl p-4 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200">{column.title}</h2>
                <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm font-medium text-gray-600 dark:text-gray-400 shadow-sm">
                  {tasks.filter(t => t.status === column.status).length}
                </span>
              </div>
              
              <div className="space-y-4">
                {tasks
                  .filter(task => task.status === column.status)
                  .map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))}
                  
                  {tasks.filter(t => t.status === column.status).length === 0 && (
                      <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                          No tasks
                      </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
