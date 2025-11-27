
import React from 'react';
import { Post } from '../types';
import Spinner from './Spinner';

interface VideoCardProps {
  post: Post;
  isActive: boolean; // New prop to indicate if this video is currently in the viewport
  showAiSummary?: boolean; // New prop for advanced feed
  onGenerateAiSummary?: (postId: string, base64Thumbnail: string) => Promise<string | null>; // New prop for advanced feed
}

const VideoCard: React.FC<VideoCardProps> = ({ post, isActive, showAiSummary = false, onGenerateAiSummary }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [showPlayIcon, setShowPlayIcon] = React.useState(true); // Control visibility of play/pause overlay
  const [isMuted, setIsMuted] = React.useState(true); // Control mute state, default to muted
  const [isLiked, setIsLiked] = React.useState(false); // Client-side like state
  const [likeCount, setLikeCount] = React.useState(post.likes);
  const [isLoadingVideo, setIsLoadingVideo] = React.useState(true); // New: for video buffering indicator
  const [loadingAiSummary, setLoadingAiSummary] = React.useState(false); // New: for AI summary generation
  const [hasUserManuallyToggledPlay, setHasUserManuallyToggledPlay] = React.useState(false); // New: to track user's explicit play/pause

  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted; // Always apply local mute state

      if (isActive) {
        if (!hasUserManuallyToggledPlay) { // Only auto-play if user hasn't explicitly toggled
          setIsLoadingVideo(true); // Assume loading when activated
          videoRef.current.play().then(() => {
            // isPlaying and showPlayIcon will be set by onPlay handler
            setIsLoadingVideo(false);
          }).catch(error => {
            console.error("Error attempting to auto-play video:", error);
            videoRef.current!.pause(); // Ensure it's paused if auto-play fails
            setIsPlaying(false);
            setShowPlayIcon(true);
            setIsLoadingVideo(false); // Stop loading if play fails
          });
        }
      } else {
        videoRef.current.pause();
        // isPlaying and showPlayIcon will be set by onPause handler
        setHasUserManuallyToggledPlay(false); // Reset for next time it becomes active
        setIsLoadingVideo(false); // Not loading if not active
      }
    }
  }, [isActive, isMuted, hasUserManuallyToggledPlay]);

  // New: Effect to generate AI summary if needed for advanced feed
  React.useEffect(() => {
    // Only attempt to generate if conditions are met
    if (showAiSummary && !post.aiSummary && !loadingAiSummary && onGenerateAiSummary && post.thumbnailUrl) {
      setLoadingAiSummary(true);
      const base64ThumbnailData = post.thumbnailUrl.split(',')[1];
      const summaryPrompt = `Gere um resumo curto e objetivo (máx. 50 palavras) do conteúdo deste vídeo. Dê uma ideia geral do que se trata.`;

      onGenerateAiSummary(post.id, base64ThumbnailData)
        .finally(() => {
          setLoadingAiSummary(false);
        });
    }
  }, [showAiSummary, post.aiSummary, loadingAiSummary, onGenerateAiSummary, post.id, post.thumbnailUrl]);


  const togglePlay = () => {
    if (videoRef.current) {
      setHasUserManuallyToggledPlay(true); // User explicitly interacted

      if (isPlaying) {
        videoRef.current.pause();
        // isPlaying and showPlayIcon will be set by onPause handler
      } else {
        setIsLoadingVideo(true); // Indicate loading when user clicks play
        videoRef.current.play().then(() => {
          // isPlaying and showPlayIcon will be set by onPlay handler
          setIsLoadingVideo(false);
        }).catch(error => {
          console.error("Manual play failed:", error);
          setIsPlaying(false);
          setShowPlayIcon(true);
          setIsLoadingVideo(false); // Stop loading if play fails
        });
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video play/pause
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video play/pause
    setIsLiked(prev => {
      if (prev) {
        setLikeCount(prevCount => prevCount - 1);
      } else {
        setLikeCount(prevCount => prevCount + 1);
      }
      return !prev;
    });
  };

  if (!post.videoUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-900 text-white min-h-screen">
        <p>Vídeo indisponível.</p>
      </div>
    );
  }

  return (
    <div
      className="relative flex-shrink-0 w-full h-full bg-black snap-center"
      onClick={togglePlay} // Only toggle play/pause on main video click
      aria-label={`Video post by ${post.userName} with caption: ${post.caption}`}
      role="region"
      aria-live="polite"
    >
      <video
        ref={videoRef}
        src={post.videoUrl}
        poster={post.thumbnailUrl}
        loop
        playsInline // Important for iOS to play inline
        preload="auto"
        className="w-full h-full object-cover"
        onPlay={() => { setIsPlaying(true); setShowPlayIcon(false); setIsLoadingVideo(false); }}
        onPause={() => { setIsPlaying(false); setShowPlayIcon(true); }}
        onWaiting={() => setIsLoadingVideo(true)} // Video is buffering
        onPlaying={() => setIsLoadingVideo(false)} // Video has enough data to play
        onLoadedData={() => setIsLoadingVideo(false)} // First frame loaded or metadata loaded
        aria-describedby={`video-caption-${post.id}`}
      >
        Your browser does not support the video tag.
      </video>

      {/* Video Loading Spinner */}
      {isActive && isLoadingVideo && ( // Only show spinner if active and loading
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
          <Spinner size="lg" color="text-white" />
        </div>
      )}

      {/* Play/Pause Overlay */}
      {showPlayIcon && !isLoadingVideo && ( // Only show if not loading and play icon needed
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none">
          {isPlaying ? (
            <svg className="w-24 h-24 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
            </svg>
          ) : (
            <svg className="w-24 h-24 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          )}
        </div>
      )}

      {/* AI Summary Overlay for Advanced Feed */}
      {showAiSummary && (post.aiSummary || loadingAiSummary) && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white text-xs px-3 py-1.5 rounded-lg max-w-[calc(100%-80px)] z-10 shadow-md">
          <p className="font-semibold mb-1 flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" />
            </svg>
            Resumo IA: {loadingAiSummary ? <Spinner size="sm" color="text-white" className="ml-2" /> : ''}
          </p>
          {!loadingAiSummary && post.aiSummary && <p>{post.aiSummary}</p>}
        </div>
      )}


      {/* Overlaid UI Elements - Adjusted bottom position to avoid overlap with BottomNavBar */}
      <div className="absolute left-0 right-0 p-4 flex justify-between items-end text-white z-10 bottom-16">
        {/* User Info and Caption (Bottom Left) */}
        <div className="flex-1 pr-16"> {/* Add right padding to prevent overlap with buttons */}
          <div className="flex items-center mb-2">
            <img
              src={post.userAvatar || `https://picsum.photos/40/40?random=${post.id}`}
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white mr-3"
            />
            <p className="font-bold text-lg">{post.userName}</p>
          </div>
          <p id={`video-caption-${post.id}`} className="text-sm break-words whitespace-pre-wrap max-h-24 overflow-hidden text-shadow-sm" aria-label={`Caption: ${post.caption}`}>{post.caption}</p>
        </div>

        {/* Action Buttons (Bottom Right) */}
        <div className="flex flex-col items-center space-y-5">
          <button
            onClick={handleLikeClick}
            className="flex flex-col items-center text-white"
            aria-label={`${isLiked ? 'Unlike' : 'Like'} video. Current likes: ${likeCount}`}
          >
            <svg
              className={`w-9 h-9 ${isLiked ? 'text-red-500' : 'text-white'} transition-colors duration-200`}
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 21.35l-1.84-1.66C4.41 14.27 1 11.21 1 7.5 1 4.42 3.42 2 6.5 2c1.74 0 3.41.81 4.5 2.09C12.09 2.81 13.76 2 15.5 2 18.58 2 21 4.42 21 7.5c0 3.71-3.41 6.77-9.16 11.84L12 21.35z"></path>
            </svg>
            <span className="text-xs font-semibold mt-1" aria-hidden="true">{likeCount}</span>
          </button>
          <button
            className="flex flex-col items-center text-white"
            aria-label={`View comments. Current comments: ${post.comments.length}`}
            disabled // Placeholder, actual comment modal not yet implemented
          >
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15.04V6.29c0-.45-.3-.85-.75-1.03l-10-4.01c-.56-.22-1.19.04-1.42.6L8 3.5v9l-5.65 2.26c-.39.16-.65.57-.65 1V19c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-4.96c0-.45-.3-.85-.75-1.03l-1-4.01c-.22-.56-.85-.82-1.42-.6L13 13.5v-9l-1.35-.54c-.39-.16-.65-.57-.65-1V19c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-4.96zM12 18H5V6.7L12 3.85V18zm0-10.29V17l7-2.85V6.7L12 3.85V7.71z"></path>
            </svg>
            <span className="text-xs font-semibold mt-1" aria-hidden="true">{post.comments.length}</span>
          </button>
          <button
            onClick={toggleMute}
            className="flex flex-col items-center text-white"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.52 1.52C20.63 14.91 21 13.5 21 12c0-4.28-3.05-7.8-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5V9l-1.73-1.73L4.27 3zM10 15.17l-2.61-2.62L10 9.17v6zm-.12 3.39l-1.92-1.92L12 12l6.01 6.01 1.41 1.41-16.17-16.17z"></path>
              </svg>
            ) : (
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.95 7-4.47 7-8.77s-2.99-7.82-7-8.77z"></path>
              </svg>
            )}
            <span className="text-xs font-semibold mt-1" aria-hidden="true">{isMuted ? 'Mudo' : 'Som'}</span>
          </button>
          <button
            className="flex flex-col items-center text-white"
            aria-label="Share video"
          >
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.52.47 1.2.77 1.96.77 1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2c0 .24.04.47.09.7L7.14 9.85C6.62 9.36 5.94 9.08 5.18 9.08c-1.1 0-2 .9-2 2s.9 2 2 2c.76 0 1.44-.3 1.96-.77l7.05 4.11c-.05.23-.09.46-.09.7 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2z"></path>
            </svg>
            <span className="text-xs font-semibold mt-1" aria-hidden="true">Compart.</span>
          </button>
        </div>
      </div>
      {/* Visual aid for text shadow for readability */}
      <style>{`
        .text-shadow-sm {
          text-shadow: 1px 1px 2px rgba(0,0,0,0.6);
        }
      `}</style>
    </div>
  );
};

export default VideoCard;