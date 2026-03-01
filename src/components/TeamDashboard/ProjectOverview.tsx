import React from 'react';
import { Card } from '../shared/Card';
import { ProjectCard } from './ProjectCard';
import type { Project, ProjectMetric, TrendDirection } from '../types/project';

interface ProjectOverviewProps {
  projects: Project[];
  metrics: ProjectMetric[];
  onStatusBadgeClick?: (projectId: string) => void;
  onCompleteTask?: (projectId: string) => void;
}

const trendIcons: Record<TrendDirection, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

const trendColors: Record<TrendDirection, string> = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-500 dark:text-gray-400',
};

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  projects,
  metrics,
  onStatusBadgeClick,
  onCompleteTask,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Project Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <Card key={metric.label} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metric.value}
                  </p>
                </div>
                {metric.trend && (
                  <span
                    className={`text-sm font-medium ${trendColors[metric.trend]}`}
                  >
                    {trendIcons[metric.trend]} {metric.trendValue ?? ''}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onStatusBadgeClick={onStatusBadgeClick}
              onCompleteTask={onCompleteTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
