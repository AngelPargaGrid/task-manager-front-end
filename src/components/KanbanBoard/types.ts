export type KanbanStatus = 'todo' | 'in-progress' | 'done';
export type KanbanPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface KanbanAssignee {
  id: string;
  name: string;
  avatar: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: KanbanStatus;
  priority: KanbanPriority;
  assignee?: KanbanAssignee;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
}

export const KANBAN_COLUMNS: { id: KanbanStatus; title: string }[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];
