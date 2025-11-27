

export interface Post {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
  userName: string;
  userAvatar: string;
  aiSummary?: string; // New: Optional AI-generated summary for advanced feed
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  followers: number;
}

export class GeminiApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiApiKeyError';
  }
}