import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  showOnlineIndicator = false,
  isOnline = false,
  className = '',
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm`}
      />
      {showOnlineIndicator && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800 ${
            size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
          } ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        />
      )}
    </div>
  );
};
