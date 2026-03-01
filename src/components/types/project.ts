export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'planning';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface ProjectMetric {
  label: string;
  value: string | number;
  trend?: TrendDirection;
  trendValue?: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  metrics: ProjectMetric[];
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  progress: number;
}
