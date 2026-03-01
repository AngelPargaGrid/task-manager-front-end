export type TeamMemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: TeamMemberRole;
  isOnline: boolean;
}
