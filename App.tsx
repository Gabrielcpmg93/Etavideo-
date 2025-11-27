import React from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Post } from './types';
import VideoFeed from './components/VideoFeed';
import PostCreator from './components/PostCreator';
import Modal from './components/Modal'; // Import the Modal component

// Declare window.aistudio globally for TypeScript using interface augmentation
interface Window {
  aistudio: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}

// Bottom Navigation Bar Component
const BottomNavBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-lg p-3 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
            location.pathname === '/' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
          aria-label="Feed"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
          </svg>
          <span className="text-xs mt-1">Feed</span>
        </Link>

        <Link
          to="/post"
          className="flex flex-col items-center justify-center p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-transform duration-200 transform hover:scale-105 shadow-lg"
          style={{ width: '60px', height: '60px', marginTop: '-20px' }} // Larger, slightly raised button
          aria-label="Create new post"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
          </svg>
          <span className="sr-only">Criar Post</span>
        </Link>

        {/* Placeholder for Profile/Inbox for full TikTok parity - keeping it simple for now */}
        <button
          className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white transition-colors duration-200 cursor-not-allowed opacity-50"
          disabled
          aria-label="Profile (coming soon)"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
          </svg>
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [posts, setPosts] = React.useState<Post[]>(() => {
    try {
      const storedPosts = localStorage.getItem('socialvid_posts');
      return storedPosts ? JSON.parse(storedPosts) : [];
    } catch (error) {
      console.error("Failed to parse posts from localStorage:", error);
      return [];
    }
  });

  // State for API Key Modal
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
  const [apiKeyErrorPrompt, setApiKeyErrorPrompt] = React.useState('');

  React.useEffect(() => {
    localStorage.setItem('socialvid_posts', JSON.stringify(posts));
  }, [posts]);

  const handlePost = (newPostData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'userName' | 'userAvatar'>) => {
    const newPost: Post = {
      ...newPostData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      likes: Math.floor(Math.random() * 100),
      comments: [],
      userName: 'Usuário Gemini',
      userAvatar: `https://picsum.photos/40/40?random=${crypto.randomUUID()}`,
    };
    setPosts((prevPosts) => [...prevPosts, newPost]);
    window.location.hash = '#/'; // Navigate back to feed after posting
  };

  const handleApiKeySelectionNeeded = () => {
    setApiKeyErrorPrompt(
      'A API key é necessária para este recurso avançado (geração de legenda com IA). Por favor, selecione uma chave API paga no painel para continuar. ' +
      'Você pode encontrar mais informações sobre faturamento em ai.google.dev/gemini-api/docs/billing.'
    );
    setShowApiKeyModal(true);
    // As per guidelines, assume success and proceed after opening the selector
    // The actual API call will be retried by PostCreator after the user selects a key.
    window.aistudio.openSelectKey();
  };


  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-black">
        {/* Main Content Area - takes up full available height */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<VideoFeed posts={posts} />} />
            <Route
              path="/post"
              element={
                <PostCreator
                  onPost={handlePost}
                  onCancel={() => window.location.hash = '#/'}
                  onApiKeyError={handleApiKeySelectionNeeded} // Pass the handler
                />
              }
            />
            {/* Redirect any unmatched routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNavBar />

        {/* API Key Selection Modal */}
        <Modal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          title="API Key Necessária"
        >
          <p className="text-gray-700 mb-4">{apiKeyErrorPrompt}</p>
          <p className="text-sm text-gray-500">
            Você deve ter uma chave API válida associada a um projeto Google Cloud faturável para usar recursos avançados da IA Gemini, como a geração automática de legendas com o modelo `gemini-3-pro-image-preview`.
          </p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowApiKeyModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </Modal>
      </div>
    </Router>
  );
};

export default App;