import React, { useState } from 'react';
import type { DashboardProps } from '../../types/dashboard.types';
import { TaskCard } from '../ui/TaskCard';
import { StatWidget } from '../ui/StatWidget';

export const Dashboard: React.FC<DashboardProps & {
  onTaskDelete?: (taskId: string) => void;
  onTaskAdd?: (task: any) => void;
}> = ({
  tasks,
  stats,
  onTaskClick,
  onTaskStatusChange,
  onTaskDelete,
  onTaskAdd,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Filter tasks based on selected filter
  const filteredTasks =
    selectedFilter === 'all'
      ? tasks
      : tasks.filter((task) => task.status === selectedFilter);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
        onTaskAdd?.({
            title: newTaskTitle,
            status: 'todo',
            priority: 'medium',
            description: 'New task description',
            createdAt: new Date().toISOString(),
        });
        setNewTaskTitle('');
        setIsAddingTask(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Add Task"
            >
                {isAddingTask ? 'Cancel' : 'Add Task'}
            </button>
          </div>

          {isAddingTask && (
            <form onSubmit={handleAddTask} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Enter task title..."
                        className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        disabled={!newTaskTitle.trim()}
                    >
                        Save
                    </button>
                </div>
            </form>
          )}

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
                  onDelete={onTaskDelete}
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
