import React from 'react';

interface StarRatingProps {
  rating: number; // 0-5
  showRating?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  showRating = false,
  size = 'md',
  className = '',
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
      {Array.from({ length: fullStars }).map((_, index) => (
        <svg
          key={`full-${index}`}
          className={`${sizeClasses[size]} text-yellow-400 fill-current`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
      {hasHalfStar && (
        <svg
          className={`${sizeClasses[size]} text-yellow-400 fill-current`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
            fill="url(#half-fill)"
          />
          <path
            d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0z"
            fill="currentColor"
          />
        </svg>
      )}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <svg
          key={`empty-${index}`}
          className={`${sizeClasses[size]} text-gray-300 fill-current`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
      {showRating && (
        <span className="text-sm text-gray-600 ml-1" aria-hidden="true">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

