import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { KanbanTask, KanbanStatus } from './types';
import { TaskCard } from './TaskCard';

interface BoardColumnProps {
  id: KanbanStatus;
  title: string;
  tasks: KanbanTask[];
  onTaskClick?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
}

const columnStyles: Record<KanbanStatus, string> = {
  todo: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
  'in-progress':
    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50',
  done: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50',
};

export const BoardColumn: React.FC<BoardColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
  onTaskEdit,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col min-w-[300px] max-w-[320px] flex-1
        rounded-xl border-2 p-4 transition-colors
        ${columnStyles[id]}
        ${isOver ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-sm border border-gray-200 dark:border-gray-700">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 overflow-y-auto min-h-[200px]">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onEdit={onTaskEdit}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
              <svg
                className="w-10 h-10 mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Drop tasks here</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
