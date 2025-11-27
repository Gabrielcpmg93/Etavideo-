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
        // Adding a small offset (+0.5) ensures that when exactly halfway, it rounds up to the next video.
        const newActiveIndex = Math.round((scrollTop + clientHeight / 2) / clientHeight);
        
        // Ensure newActiveIndex is within the bounds of available posts
        const clampedIndex = Math.max(0, Math.min(newActiveIndex, posts.length - 1));

        if (clampedIndex !== activeVideoIndex) {
          setActiveVideoIndex(clampedIndex);
        }
      }
    };

    const currentFeedRef = feedRef.current;
    if (currentFeedRef) {
      currentFeedRef.addEventListener('scroll', handleScroll, { passive: true });
      // Initial check for active video on mount
      handleScroll();
    }

    // Recalculate active video if posts change (e.g., new post added)
    // This ensures the feed starts with the newest post if it's sorted to the top.
    const handlePostsChange = () => {
      if (currentFeedRef && posts.length > 0) {
        currentFeedRef.scrollTo({ top: 0, behavior: 'instant' }); // Go to top for new posts
        setActiveVideoIndex(0); // Set first video as active
      }
    };
    handlePostsChange(); // Run once on mount and when posts update

    return () => {
      if (currentFeedRef) {
        currentFeedRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeVideoIndex, posts.length]); // Depend on posts.length to re-run for new posts

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
      // Corrected height: 100vh minus the bottom nav bar (h-16)
      className="w-screen h-[calc(100vh-theme(spacing.16))] overflow-y-scroll snap-y snap-mandatory bg-black"
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