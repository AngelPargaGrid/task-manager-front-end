import React from 'react';
import type { Task, TaskStatus } from '../../types/dashboard.types';

interface TaskCardProps {
  task: Task;
  onClick?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const priorityColors = {
  low: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
  medium: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
}) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div
      onClick={() => onClick?.(task.id)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 cursor-pointer border border-gray-200 dark:border-gray-700"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(task.id);
        }
      }}
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 flex-1">
          {task.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Toggle status logic
            const nextStatus: TaskStatus =
              task.status === 'todo'
                ? 'in-progress'
                : task.status === 'in-progress'
                ? 'completed'
                : 'todo';
            onStatusChange?.(task.id, nextStatus);
          }}
          className={`ml-2 px-2 py-1 rounded-md text-xs font-medium transition-colors ${statusColors[task.status]}`}
          aria-label={`Change task status from ${task.status}`}
        >
          {task.status === 'todo'
            ? 'Start'
            : task.status === 'in-progress'
            ? 'Complete'
            : 'Reopen'}
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${priorityColors[task.priority]}`}
          >
            {priorityLabels[task.priority]}
          </span>
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[task.status]}`}
          >
            {task.status.replace('-', ' ')}
          </span>
        </div>

        {task.assignee && (
          <div className="flex items-center gap-2">
            <img
              src={task.assignee.avatar}
              alt={task.assignee.name}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700"
              loading="lazy"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
              {task.assignee.name}
            </span>
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {task.dueDate && (
        <div className="flex items-center gap-1 text-xs">
          <svg
            className={`w-4 h-4 ${
              isOverdue
                ? 'text-red-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span
            className={
              isOverdue
                ? 'text-red-600 dark:text-red-400 font-medium'
                : 'text-gray-600 dark:text-gray-400'
            }
          >
            {formatDate(task.dueDate)}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>
      )}
    </div>
  );
};

