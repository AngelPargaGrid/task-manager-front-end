import { useState, useCallback, useRef, useEffect } from 'react';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { samplePosts } from './samplePosts';
import type { Post, FeedUser, Comment } from './types';

const currentUser: FeedUser = {
  id: 'current',
  name: 'You',
  username: 'you',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
};

function addCommentToPost(
  posts: Post[],
  postId: string,
  content: string,
  author: FeedUser,
  parentId?: string
): Post[] {
  return posts.map((post) => {
    if (post.id !== postId) return post;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      postId,
      author,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };
    if (parentId) {
      const addReply = (comments: Comment[]): Comment[] =>
        comments.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment],
            };
          }
          if (c.replies?.length) {
            return { ...c, replies: addReply(c.replies) };
          }
          return c;
        });
      return {
        ...post,
        comments: addReply(post.comments),
      };
    }
    return {
      ...post,
      comments: [...post.comments, newComment],
    };
  });
}

function toggleCommentLike(
  posts: Post[],
  postId: string,
  commentId: string
): Post[] {
  const toggleInComments = (comments: Comment[]): Comment[] =>
    comments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          isLiked: !c.isLiked,
          likes: c.likes + (c.isLiked ? -1 : 1),
        };
      }
      if (c.replies?.length) {
        return { ...c, replies: toggleInComments(c.replies) };
      }
      return c;
    });

  return posts.map((post) =>
    post.id === postId
      ? { ...post, comments: toggleInComments(post.comments) }
      : post
  );
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.likes + (p.isLiked ? -1 : 1),
            }
          : p
      )
    );
  }, []);

  const handleShare = useCallback((postId: string) => {
    // Placeholder: could show a share modal or copy link
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, shares: p.shares + 1 } : p
      )
    );
  }, []);

  const handleAddComment = useCallback(
    (postId: string, content: string, parentId?: string) => {
      setPosts((prev) =>
        addCommentToPost(prev, postId, content, currentUser, parentId)
      );
    },
    []
  );

  const handleLikeComment = useCallback((postId: string, commentId: string) => {
    setPosts((prev) => toggleCommentLike(prev, postId, commentId));
  }, []);

  const handleCreatePost = useCallback((content: string, images?: string[]) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: currentUser,
      content,
      images,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      shares: 0,
      isLiked: false,
    };
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  // Infinite scroll placeholder
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    // Simulate loading more posts
    setTimeout(() => {
      setIsLoadingMore(false);
      // In a real app, you would fetch and append new posts here
    }, 1500);
  }, [isLoadingMore]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    observerRef.current.observe(el);
    return () => observerRef.current?.disconnect();
  }, [handleLoadMore, isLoadingMore]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feed
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Stay connected with your network
          </p>
        </div>

        {/* Create Post */}
        <div className="mb-6">
          <CreatePost currentUser={currentUser} onSubmit={handleCreatePost} />
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={handleLike}
              onShare={handleShare}
              onAddComment={handleAddComment}
              onLikeComment={handleLikeComment}
            />
          ))}
        </div>

        {/* Infinite Scroll Placeholder */}
        <div
          ref={loadMoreRef}
          className="flex flex-col items-center justify-center py-12 gap-4"
        >
          {isLoadingMore ? (
            <>
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading more posts...
              </p>
            </>
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              Load more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
