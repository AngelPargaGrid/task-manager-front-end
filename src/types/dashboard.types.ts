export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: {
    name: string;
    avatar: string;
  };
  dueDate?: string;
  tags?: string[];
  createdAt: string;
}

export interface StatWidget {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
}

export interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  isActive?: boolean;
}

export interface DashboardProps {
  tasks: Task[];
  stats: StatWidget[];
  onTaskClick?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
}

