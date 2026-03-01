import type { Post } from './types';

export const samplePosts: Post[] = [
  {
    id: '1',
    author: {
      id: 'u1',
      name: 'Alex Chen',
      username: 'alexchen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    content:
      'Just shipped a new feature! 🚀 Excited to see how it improves the user experience. Grateful for the amazing team behind this.',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 42,
    comments: [],
    shares: 5,
    isLiked: false,
  },
  {
    id: '2',
    author: {
      id: 'u2',
      name: 'Jordan Lee',
      username: 'jordanlee',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    },
    content:
      'Morning coffee and code. The best combination to start the day. ☕ What\'s your favorite coding ritual?',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 128,
    comments: [
      {
        id: 'c1',
        postId: '2',
        author: {
          id: 'u3',
          name: 'Sam Wilson',
          username: 'samwilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
        },
        content: 'Same here! I always start with a 5-min stretch and then dive in.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        isLiked: false,
      },
      {
        id: 'c2',
        postId: '2',
        author: {
          id: 'u1',
          name: 'Alex Chen',
          username: 'alexchen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        },
        content: 'I need at least 2 cups before my brain wakes up 😅',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        isLiked: true,
        replies: [
          {
            id: 'c2r1',
            postId: '2',
            author: {
              id: 'u2',
              name: 'Jordan Lee',
              username: 'jordanlee',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
            },
            content: 'Haha relatable!',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 3,
            isLiked: false,
          },
        ],
      },
    ],
    shares: 12,
    isLiked: true,
  },
  {
    id: '3',
    author: {
      id: 'u4',
      name: 'Taylor Swift',
      username: 'taylorswift',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor',
    },
    content:
      'Beautiful sunset from the office today. Sometimes you need to step back and appreciate the small moments. 🌅',
    images: [
      'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: 256,
    comments: [],
    shares: 34,
    isLiked: false,
  },
];
