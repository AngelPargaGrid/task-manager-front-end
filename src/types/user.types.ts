export interface UserStats {
  followers: number;
  following: number;
  posts: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  stats: UserStats;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  isVerified?: boolean;
}

export interface UserProfileProps {
  user: UserProfile;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onEditProfile?: () => void;
}

