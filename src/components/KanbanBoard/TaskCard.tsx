import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanTask } from './types';
import { Avatar } from '../shared/Avatar';
import { Badge } from '../shared/Badge';

interface TaskCardProps {
  task: KanbanTask;
  onClick?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
}

const priorityConfig: Record<
  KanbanTask['priority'],
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
> = {
  low: { label: 'Low', variant: 'neutral' },
  medium: { label: 'Medium', variant: 'default' },
  high: { label: 'High', variant: 'warning' },
  urgent: { label: 'Urgent', variant: 'danger' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  const priority = priorityConfig[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task.id)}
      className={`
        group relative rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700
        p-4 cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800
        transition-all duration-200
        ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-blue-500 dark:ring-blue-400 z-50' : ''}
      `}
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
      {/* Drag handle indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h2zM15 2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V4a2 2 0 012-2h2z" />
        </svg>
      </div>

      <div className="flex items-start justify-between gap-2 mb-2 pr-6">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 flex-1">
          {task.title}
        </h3>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant={priority.variant}>{priority.label}</Badge>
        {task.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        {task.assignee && (
          <div className="flex items-center gap-2">
            <Avatar src={task.assignee.avatar} alt={task.assignee.name} size="sm" />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
              {task.assignee.name}
            </span>
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs">
            <svg
              className={`w-4 h-4 ${
                isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
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

      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task.id);
          }}
          className="absolute bottom-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-opacity"
          aria-label="Edit task"
        >
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
    </div>
  );
};
