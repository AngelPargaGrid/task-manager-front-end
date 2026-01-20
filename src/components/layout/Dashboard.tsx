import React, { useState } from 'react';
import type { DashboardProps } from '../../types/dashboard.types';
import { TaskCard } from '../ui/TaskCard';
import { StatWidget } from '../ui/StatWidget';

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  stats,
  onTaskClick,
  onTaskStatusChange,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Filter tasks based on selected filter
  const filteredTasks =
    selectedFilter === 'all'
      ? tasks
      : tasks.filter((task) => task.status === selectedFilter);

  return (
    <div className="p-4 sm:p-6">
          {/* Statistics Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {stats.map((stat, index) => (
              <StatWidget key={index} stat={stat} />
            ))}
          </div>

          {/* Task Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Tasks' },
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'blocked', label: 'Blocked' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
                aria-pressed={selectedFilter === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Task Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                  onStatusChange={onTaskStatusChange}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No tasks found for the selected filter.
                </p>
              </div>
            )}
          </div>
    </div>
  );
};

