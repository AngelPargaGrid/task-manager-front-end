export type ActivityType =
  | 'task_completed'
  | 'task_created'
  | 'member_added'
  | 'member_removed'
  | 'meeting_scheduled'
  | 'report_generated'
  | 'status_changed';

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
}
