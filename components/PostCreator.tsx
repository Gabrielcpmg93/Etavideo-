
import React from 'react';
import Button from './Button';
import { generateVideoTitle, generateVideoCaption } from '../services/geminiService';
import { Post, GeminiApiKeyError } from '../types'; // Import GeminiApiKeyError
import Spinner from './Spinner';

interface PostCreatorProps {
  onPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'userName' | 'userAvatar'>) => void;
  onCancel: () => void;
  onApiKeyError: (message?: string) => void; // New prop to handle API key errors, now with optional message
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPost, onCancel, onApiKeyError }) => {
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = React.useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [caption, setCaption] = React.useState<string>('');
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [generatingThumbnail, setGeneratingThumbnail] = React.useState(false);
  const [hasApiKeyError, setHasApiKeyError] = React.useState(false); // State for API key error
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl); // Clean up previous object URL
    }

    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setCaption(''); // Clear caption for new video
      setThumbnailUrl(null); // Clear previous thumbnail
      setGeneratingThumbnail(true);
      setHasApiKeyError(false); // Reset API key error on new file selection

      // Extract thumbnail
      const videoElement = document.createElement('video');
      videoElement.src = url;
      videoElement.crossOrigin = 'anonymous'; // Important for canvas.toDataURL if video is from different origin
      videoElement.autoplay = false;
      videoElement.muted = true;
      videoElement.preload = 'metadata';
      videoElement.currentTime = 0; // Start at 0 to ensure metadata loads

      videoElement.onloadedmetadata = () => {
        // Attempt to capture a frame after 1 second, or immediately if video is shorter
        videoElement.currentTime = Math.min(1, videoElement.duration / 2);
      };

      videoElement.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const thumbUrl = canvas.toDataURL('image/jpeg');
          setThumbnailUrl(thumbUrl);
          setGeneratingThumbnail(false);
          // Auto-generate suggestions after thumbnail is ready
          handleGenerateSuggestions(thumbUrl);
        } else {
          setGeneratingThumbnail(false);
        }
        videoElement.remove(); // Clean up temporary video element
      };

      videoElement.onerror = (e) => {
        console.error("Error loading video for thumbnail extraction:", e);
        setThumbnailUrl(null); // Clear thumbnail on error
        setGeneratingThumbnail(false);
        alert('Erro ao carregar vídeo para extração de miniatura.');
        videoElement.remove();
      };

    } else {
      setVideoFile(null);
      setVideoPreviewUrl(null);
      setThumbnailUrl(null);
      setCaption('');
      setGeneratingThumbnail(false);
      setHasApiKeyError(false);
      alert('Por favor, selecione um arquivo de vídeo válido.');
    }
  };

  const handleGenerateSuggestions = React.useCallback(async (thumbUrl: string | null) => {
    if (!thumbUrl) {
      alert('Por favor, faça upload de um vídeo primeiro para gerar sugestões.');
      return;
    }
    
    // If an API key error occurred previously, open the selection dialog first.
    if (hasApiKeyError) {
      onApiKeyError();
      setHasApiKeyError(false); // Reset error state after triggering selection
      return;
    }

    setLoadingSuggestions(true);
    setHasApiKeyError(false); // Clear previous API key error on new attempt
    try {
      // The Gemini service expects the base64 data without the data URI prefix.
      const base64Data = thumbUrl.split(',')[1];

      // Prompt for both title and caption to get richer suggestions
      const titlePrompt = `Sugira um título cativante e curto para mídia social (máx. 10 palavras) para este vídeo.`;
      const captionPrompt = `Escreva uma legenda envolvente e descritiva para mídia social (máx. 150 caracteres) para este vídeo. Concentre-se no que é visível e em possíveis ações.`;

      const [suggestedTitle, suggestedCaption] = await Promise.all([
        generateVideoTitle(base64Data, titlePrompt),
        generateVideoCaption(base64Data, captionPrompt),
      ]);

      let combinedSuggestion = '';
      if (suggestedTitle) {
        combinedSuggestion += suggestedTitle;
      }
      if (suggestedCaption) {
        if (combinedSuggestion) combinedSuggestion += '\n\n';
        combinedSuggestion += suggestedCaption;
      }
      setCaption(combinedSuggestion || '');

    } catch (error) {
      if (error instanceof GeminiApiKeyError) {
        setHasApiKeyError(true);
        onApiKeyError(error.message); // Trigger API key selection flow with error message
      } else {
        console.error("Failed to generate suggestions:", error);
        alert('Erro ao gerar sugestões. Tente novamente.');
      }
    } finally {
      setLoadingSuggestions(false);
    }
  }, [thumbnailUrl, hasApiKeyError, onApiKeyError]);

  const handleSubmit = () => {
    if (videoFile && videoPreviewUrl && thumbnailUrl && caption.trim()) {
      onPost({ videoUrl: videoPreviewUrl, thumbnailUrl, caption: caption.trim() });
      // Reset form
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoFile(null);
      setVideoPreviewUrl(null);
      setThumbnailUrl(null);
      setCaption('');
      setHasApiKeyError(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      alert('Por favor, faça upload de um vídeo e adicione uma legenda antes de postar.');
    }
  };

  const handleCancelClick = () => {
    // Revoke object URL to free memory if a preview exists
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setThumbnailUrl(null);
    setCaption('');
    setHasApiKeyError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancel();
  };

  const getButtonText = () => {
    if (loadingSuggestions) return 'Gerando sugestões...';
    if (hasApiKeyError) return 'Selecionar API Key e Tentar Novamente';
    return 'Gerar Legenda com IA Gemini';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="relative bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl my-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Criar Nova Publicação</h2>

        {/* Video Upload Section */}
        <div className="mb-6 border-b border-gray-700 pb-6">
          <label htmlFor="video-upload" className="block text-lg font-medium text-gray-200 mb-3">
            1. Selecione um vídeo para upload
          </label>
          <input
            ref={fileInputRef}
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700 cursor-pointer transition-colors duration-200"
            aria-label="Upload video file"
          />
          {generatingThumbnail && (
            <div className="mt-5 flex items-center justify-center min-h-[200px] bg-gray-700 rounded-lg">
              <Spinner size="md" color="text-blue-400" className="mr-3" />
              <span className="text-gray-300">Gerando miniatura...</span>
            </div>
          )}
          {videoPreviewUrl && !generatingThumbnail && (
            <div className="mt-5 relative bg-black rounded-lg overflow-hidden aspect-video border border-gray-700">
              <video
                ref={videoRef}
                src={videoPreviewUrl}
                controls
                className="w-full h-full object-contain"
                aria-label="Video preview"
              />
            </div>
          )}
        </div>

        {/* Caption Section */}
        <div className="mb-8">
          <label htmlFor="caption-input" className="block text-lg font-medium text-gray-200 mb-3">
            2. Adicione uma legenda
          </label>
          <textarea
            id="caption-input"
            className="mt-1 block w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base resize-y min-h-[120px] placeholder-gray-400"
            placeholder="Escreva uma legenda envolvente para o seu vídeo..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            aria-label="Video caption input"
            aria-autocomplete="none"
          ></textarea>
          {thumbnailUrl && (
            <Button
              onClick={() => handleGenerateSuggestions(thumbnailUrl)}
              disabled={!thumbnailUrl || loadingSuggestions || generatingThumbnail}
              loading={loadingSuggestions}
              variant={hasApiKeyError ? 'danger' : 'primary'} // Red if there's an API key error
              size="sm"
              className="mt-4 w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
              aria-label={hasApiKeyError ? "Select API Key and retry generating caption" : "Generate caption with Gemini AI"}
            >
              {getButtonText()}
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
          <Button
            onClick={handleCancelClick}
            variant="secondary"
            className="order-2 sm:order-1 bg-gray-600 hover:bg-gray-700 text-white"
            aria-label="Cancel post creation"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!videoFile || !caption.trim() || loadingSuggestions || generatingThumbnail}
            className="order-1 sm:order-2 bg-blue-500 hover:bg-blue-600 text-white"
            aria-label="Post video"
          >
            Postar Vídeo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostCreator;