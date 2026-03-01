import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { KanbanTask, KanbanStatus } from './types';
import { KANBAN_COLUMNS } from './types';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';
import { AddTaskModal } from './AddTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { INITIAL_KANBAN_TASKS } from './initialTasks';

const STORAGE_KEY = 'kanban-board-tasks';

function loadTasks(): KanbanTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as KanbanTask[];
      return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_KANBAN_TASKS;
}

function saveTasks(tasks: KanbanTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<KanbanTask[]>(loadTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<KanbanTask['priority'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<KanbanStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const filteredTasks = useCallback(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesStatus =
        statusFilter === 'all' || task.status === statusFilter;
      const matchesAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' && !task.assignee) ||
        (task.assignee?.id && task.assignee.id === assigneeFilter);
      return matchesSearch && matchesPriority && matchesStatus && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, statusFilter, assigneeFilter]);

  const tasksByColumn = KANBAN_COLUMNS.reduce(
    (acc, col) => ({
      ...acc,
      [col.id]: filteredTasks().filter((t) => t.status === col.id),
    }),
    {} as Record<KanbanStatus, KanbanTask[]>
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = KANBAN_COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: targetColumn.id } : t
        )
      );
      return;
    }

    // Dropped on another task - find its column
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: overTask.status } : t
        )
      );
    }
  };

  const handleAddTask = (taskData: Omit<KanbanTask, 'id' | 'createdAt'>) => {
    const newTask: KanbanTask = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleSaveTask = (task: KanbanTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? task : t))
    );
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) setEditingTask(task);
  };

  const handleTaskEdit = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) setEditingTask(task);
  };

  const assignees = tasks
    .map((t) => t.assignee)
    .filter((a): a is NonNullable<KanbanTask['assignee']> => !!a)
    .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Kanban Board
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as KanbanTask['priority'] | 'all')}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as KanbanStatus | 'all')}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-[960px]">
            {KANBAN_COLUMNS.map((column) => (
              <BoardColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={tasksByColumn[column.id]}
                onTaskClick={handleTaskClick}
                onTaskEdit={handleTaskEdit}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-95 rotate-2 scale-105">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
      />
    </div>
  );
};
