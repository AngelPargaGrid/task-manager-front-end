import React from 'react';
import { Card } from '../shared/Card';
import { Avatar } from '../shared/Avatar';
import type { Activity, ActivityType } from '../types/activity';

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  task_completed: (
    <svg
      className="w-4 h-4 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  task_created: (
    <svg
      className="w-4 h-4 text-blue-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ),
  member_added: (
    <svg
      className="w-4 h-4 text-cyan-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
      />
    </svg>
  ),
  member_removed: (
    <svg
      className="w-4 h-4 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  meeting_scheduled: (
    <svg
      className="w-4 h-4 text-purple-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  report_generated: (
    <svg
      className="w-4 h-4 text-amber-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  status_changed: (
    <svg
      className="w-4 h-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 8,
}) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card padding="md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {displayActivities.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No recent activity
          </p>
        ) : (
          displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 animate-fade-in"
            >
              <div className="flex-shrink-0 mt-0.5">
                {activityIcons[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar
                    src={activity.userAvatar}
                    alt={activity.userName}
                    size="sm"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.userName} · {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
