import React from 'react';
import { Post } from '../types';
import VideoCard from './VideoCard';
import Spinner from './Spinner';

interface VideoFeedProps {
  posts: Post[];
  isLoading?: boolean;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ posts, isLoading }) => {
  const [activeVideoIndex, setActiveVideoIndex] = React.useState(0);
  const feedRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (feedRef.current) {
        const { scrollTop, clientHeight } = feedRef.current;
        // Calculate the index of the video that is most in view
        const newActiveIndex = Math.round(scrollTop / clientHeight);
        if (newActiveIndex !== activeVideoIndex) {
          setActiveVideoIndex(newActiveIndex);
        }
      }
    };

    const currentFeedRef = feedRef.current;
    if (currentFeedRef) {
      currentFeedRef.addEventListener('scroll', handleScroll, { passive: true });
      // Initial check for active video
      handleScroll();
    }

    return () => {
      if (currentFeedRef) {
        currentFeedRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeVideoIndex, posts.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white">
        <Spinner size="lg" color="text-blue-500" />
        <p className="ml-3 text-lg text-gray-300 mt-4" aria-label="Carregando feed de vídeos">Carregando Feed...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white p-8 text-center">
        <p className="text-2xl font-bold mb-4">Seja o primeiro a postar!</p>
        <p className="text-lg text-gray-300">Parece que não há vídeos aqui ainda. Clique no botão "+" na navegação inferior para compartilhar um momento.</p>
      </div>
    );
  }

  // Sort posts by timestamp in descending order (most recent first)
  const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div
      ref={feedRef}
      className="w-screen h-[calc(100vh-theme(spacing.16)*2)] md:h-[calc(100vh-theme(spacing.16)*2)] lg:h-[calc(100vh-theme(spacing.16)*2)] overflow-y-scroll snap-y snap-mandatory bg-black"
      aria-label="Video Feed"
      role="feed"
    >
      {sortedPosts.map((post, index) => (
        <VideoCard
          key={post.id}
          post={post}
          isActive={index === activeVideoIndex}
        />
      ))}
    </div>
  );
};

export default VideoFeed;