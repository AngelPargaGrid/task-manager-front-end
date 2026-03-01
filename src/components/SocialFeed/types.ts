export interface FeedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: FeedUser;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface Post {
  id: string;
  author: FeedUser;
  content: string;
  images?: string[];
  createdAt: string;
  likes: number;
  comments: Comment[];
  shares: number;
  isLiked?: boolean;
}
