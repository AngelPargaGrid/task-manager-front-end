import React, { useState } from 'react';
import type { UserProfileProps } from '../../types/user.types';

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onFollow,
  onUnfollow,
  onMessage,
  onEditProfile,
}) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFollowing && onUnfollow) {
        await onUnfollow(user.id);
        setIsFollowing(false);
      } else if (!isFollowing && onFollow) {
        await onFollow(user.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (onMessage) {
      onMessage(user.id);
    }
  };

  const handleEditProfileClick = () => {
    if (onEditProfile) {
      onEditProfile();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <article
      className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto"
      role="article"
      aria-label={`Profile for ${user.displayName}`}
    >
      {/* Header with cover image (optional) */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 w-full" />

      {/* Profile content */}
      <div className="px-4 sm:px-6 pb-6 -mt-16">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={`${user.displayName}'s profile picture`}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg object-cover"
              loading="lazy"
            />
            {user.isVerified && (
              <div
                className="absolute bottom-0 right-0 sm:-bottom-1 sm:-right-1 bg-blue-500 rounded-full p-1"
                aria-label="Verified account"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex-1 flex gap-2 sm:justify-end items-start sm:items-end pb-2">
            {user.isOwnProfile ? (
              <button
                onClick={handleEditProfileClick}
                className="flex-1 sm:flex-initial px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-300"
                aria-label="Edit your profile"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollowClick}
                  disabled={isLoading}
                  className={`flex-1 sm:flex-initial px-4 py-2 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFollowing
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-400 active:bg-gray-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 active:bg-blue-800'
                  }`}
                  aria-label={isFollowing ? `Unfollow ${user.displayName}` : `Follow ${user.displayName}`}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </span>
                  ) : isFollowing ? (
                    'Following'
                  ) : (
                    'Follow'
                  )}
                </button>
                <button
                  onClick={handleMessageClick}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-300"
                  aria-label={`Send message to ${user.displayName}`}
                >
                  Message
                </button>
              </>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user.displayName}
            </h1>
            {user.isVerified && (
              <svg
                className="w-6 h-6 text-blue-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-label="Verified account"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <p className="text-gray-500 text-sm sm:text-base mb-4">@{user.username}</p>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 text-sm sm:text-base mb-6 leading-relaxed whitespace-pre-wrap">
              {user.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-4 sm:gap-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-gray-900 tabular-nums">
                {formatNumber(user.stats.posts)}
              </span>
              <span className="text-sm text-gray-500">Posts</span>
            </div>
            <button
              className="flex flex-col text-left hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1"
              aria-label={`${formatNumber(user.stats.followers)} followers`}
              onClick={() => {
                // You can add navigation to followers list here
                console.log('View followers');
              }}
            >
              <span className="text-lg sm:text-xl font-bold text-gray-900 tabular-nums">
                {formatNumber(user.stats.followers)}
              </span>
              <span className="text-sm text-gray-500">Followers</span>
            </button>
            <button
              className="flex flex-col text-left hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1"
              aria-label={`${formatNumber(user.stats.following)} following`}
              onClick={() => {
                // You can add navigation to following list here
                console.log('View following');
              }}
            >
              <span className="text-lg sm:text-xl font-bold text-gray-900 tabular-nums">
                {formatNumber(user.stats.following)}
              </span>
              <span className="text-sm text-gray-500">Following</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

