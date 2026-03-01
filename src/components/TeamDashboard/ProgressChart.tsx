import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from '../shared/Card';
import type { Project } from '../types/project';
import type { Milestone } from '../types/project';

interface ProgressChartProps {
  projects: Project[];
  milestones?: Milestone[];
  completedTasksByProject?: { name: string; completed: number; total: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ProgressChart: React.FC<ProgressChartProps> = ({
  projects,
  milestones = [],
  completedTasksByProject,
}) => {
  const chartData =
    completedTasksByProject ??
    projects.map((p) => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
      completed: p.completedTasks,
      total: p.totalTasks,
      progress: p.progress,
      fullName: p.name,
    }));


  return (
    <Card padding="md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Task Completion Progress
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-600"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tick={{ fill: 'currentColor', fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number | undefined) => [value ?? 0, 'Tasks']}
              labelFormatter={(label) => `Project: ${label}`}
            />
            <Bar dataKey="completed" name="Completed" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
            <Bar
              dataKey="total"
              name="Total"
              radius={[4, 4, 0, 0]}
              fillOpacity={0.3}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-total-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {milestones.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Milestones
          </h3>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {m.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {m.dueDate} {m.completed ? '✓' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
