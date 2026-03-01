import { useState } from 'react';
import { UserAvatar } from './UserAvatar';
import type { Comment, FeedUser } from './types';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUser: FeedUser;
  onAddComment: (postId: string, content: string, parentId?: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
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

function CommentItem({
  comment,
  currentUser,
  postId,
  onAddReply,
  onLikeComment,
  isReply = false,
}: {
  comment: Comment;
  currentUser: FeedUser;
  postId: string;
  onAddReply: (postId: string, content: string, parentId: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  isReply?: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = () => {
    if (replyContent.trim()) {
      onAddReply(postId, replyContent.trim(), comment.id);
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className={isReply ? 'ml-10 mt-2' : ''}>
      <div className="flex gap-3">
        <img
          src={comment.author.avatar}
          alt={comment.author.name}
          className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} rounded-full object-cover flex-shrink-0`}
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {comment.author.name}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-0.5">
              {comment.content}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTime(comment.createdAt)}</span>
            <button
              onClick={() => onLikeComment(postId, comment.id)}
              className={`font-medium hover:underline ${
                comment.isLiked ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              {comment.isLiked ? 'Liked' : 'Like'}
            </button>
            {!isReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="font-medium hover:underline"
              >
                Reply
              </button>
            )}
            {comment.likes > 0 && (
              <span>{comment.likes} {comment.likes === 1 ? 'like' : 'likes'}</span>
            )}
          </div>
          {showReplyInput && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              />
              <button
                onClick={handleReply}
                className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
              >
                Reply
              </button>
            </div>
          )}
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              postId={postId}
              onAddReply={onAddReply}
              onLikeComment={onLikeComment}
              isReply
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommentSection({
  postId,
  comments,
  currentUser,
  onAddComment,
  onLikeComment,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(postId, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <UserAvatar user={currentUser} showName={false} size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors"
          >
            Comment
          </button>
        </div>
      </div>
      <div className="space-y-4 mt-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            postId={postId}
            onAddReply={onAddComment}
            onLikeComment={onLikeComment}
          />
        ))}
      </div>
    </div>
  );
}
