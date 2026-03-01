import React from 'react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import type { Project, ProjectStatus } from '../types/project';

interface ProjectCardProps {
  project: Project;
  onStatusBadgeClick?: (projectId: string) => void;
  onCompleteTask?: (projectId: string) => void;
}

const statusVariantMap: Record<ProjectStatus, 'success' | 'warning' | 'info' | 'neutral'> = {
  active: 'success',
  on_hold: 'warning',
  completed: 'info',
  planning: 'neutral',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onStatusBadgeClick,
  onCompleteTask,
}) => {
  return (
    <Card padding="md" className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {project.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant={statusVariantMap[project.status]}
              className={onStatusBadgeClick ? 'cursor-pointer' : ''}
            >
              <span
                onClick={() => onStatusBadgeClick?.(project.id)}
                className={onStatusBadgeClick ? 'cursor-pointer' : ''}
              >
                {project.status.replace('_', ' ')}
              </span>
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {project.completedTasks} of {project.totalTasks} tasks completed
        </span>
        {onCompleteTask && project.completedTasks < project.totalTasks && (
          <button
            onClick={() => onCompleteTask(project.id)}
            className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline"
          >
            + Complete task
          </button>
        )}
      </div>
    </Card>
  );
};
