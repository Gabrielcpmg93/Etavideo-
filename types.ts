
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
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export class GeminiApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiApiKeyError';
  }
}