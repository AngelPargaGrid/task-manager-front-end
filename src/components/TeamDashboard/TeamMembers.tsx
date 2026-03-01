import React from 'react';
import { Card } from '../shared/Card';
import { Avatar } from '../shared/Avatar';
import { Badge } from '../shared/Badge';
import type { TeamMember, TeamMemberRole } from '../types/team';

interface TeamMembersProps {
  members: TeamMember[];
  onContact?: (memberId: string) => void;
  onAddMember?: () => void;
}

const roleLabels: Record<TeamMemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

const roleVariants: Record<TeamMemberRole, 'default' | 'success' | 'warning' | 'info' | 'neutral'> = {
  owner: 'default',
  admin: 'info',
  member: 'success',
  viewer: 'neutral',
};

export const TeamMembers: React.FC<TeamMembersProps> = ({
  members,
  onContact,
  onAddMember,
}) => {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team Members
        </h2>
        {onAddMember && (
          <button
            onClick={onAddMember}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            + Add member
          </button>
        )}
      </div>
      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Avatar
                src={member.avatar}
                alt={member.name}
                size="md"
                showOnlineIndicator
                isOnline={member.isOnline}
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {member.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {member.email}
                </p>
              </div>
              <Badge variant={roleVariants[member.role]}>
                {roleLabels[member.role]}
              </Badge>
            </div>
            {onContact && (
              <button
                onClick={() => onContact(member.id)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Contact"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
