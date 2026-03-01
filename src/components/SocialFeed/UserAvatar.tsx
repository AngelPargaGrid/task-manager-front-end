import type { FeedUser } from './types';

interface UserAvatarProps {
  user: FeedUser;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { img: 'w-8 h-8', text: 'text-sm' },
  md: { img: 'w-10 h-10', text: 'text-base' },
  lg: { img: 'w-14 h-14', text: 'text-lg' },
};

export function UserAvatar({
  user,
  size = 'md',
  showName = true,
  className = '',
}: UserAvatarProps) {
  const { img, text } = sizeClasses[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={user.avatar}
        alt={user.name}
        className={`${img} rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm flex-shrink-0`}
      />
      {showName && (
        <div className="min-w-0">
          <p className={`font-semibold text-gray-900 dark:text-white truncate ${text}`}>
            {user.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{user.username}
          </p>
        </div>
      )}
    </div>
  );
}
