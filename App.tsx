import React from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Post, UserProfile, GeminiApiKeyError } from './types'; // Import UserProfile, GeminiApiKeyError
import VideoFeed from './components/VideoFeed';
import PostCreator from './components/PostCreator';
import Modal from './components/Modal';
import ProfilePage from './components/ProfilePage'; // Import ProfilePage
import BottomNavBar from './components/BottomNavBar'; // Import the new BottomNavBar component

// The global declaration for `window.aistudio` is likely provided by the runtime
// environment or the @google/genai SDK, causing a conflict with explicit re-declaration here.
// interface Window {
//   aistudio: {
//     hasSelectedApiKey: () => Promise<boolean>;
//     openSelectKey: () => Promise<void>;
//   };
// }

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

  const [userProfile, setUserProfile] = React.useState<UserProfile>(() => {
    try {
      const storedProfile = localStorage.getItem('socialvid_user_profile');
      return storedProfile ? JSON.parse(storedProfile) : {
        id: crypto.randomUUID(),
        name: 'Usuário Gemini',
        bio: 'Olá! Sou um entusiasta de vídeos e adoro compartilhar momentos.',
        avatarUrl: 'https://i.pravatar.cc/150?img=68', // Default avatar
        followers: 0,
      };
    } catch (error) {
      console.error("Failed to parse user profile from localStorage:", error);
      return {
        id: crypto.randomUUID(),
        name: 'Usuário Gemini',
        bio: 'Olá! Sou um entusiasta de vídeos e adoro compartilhar momentos.',
        avatarUrl: 'https://i.pravatar.cc/150?img=68', // Default avatar
        followers: 0,
      };
    }
  });

  // State for API Key Modal
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
  const [apiKeyErrorPrompt, setApiKeyErrorPrompt] = React.useState('');

  const navigate = useNavigate(); // Initialize useNavigate hook

  React.useEffect(() => {
    localStorage.setItem('socialvid_posts', JSON.stringify(posts));
  }, [posts]);

  React.useEffect(() => {
    localStorage.setItem('socialvid_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const handlePost = (newPostData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'userName' | 'userAvatar'>) => {
    const newPost: Post = {
      ...newPostData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      likes: Math.floor(Math.random() * 100),
      comments: [],
      userName: userProfile.name, // Use current user's name
      userAvatar: userProfile.avatarUrl, // Use current user's avatar
    };
    setPosts((prevPosts) => [...prevPosts, newPost]);
    navigate('/'); // Navigate back to feed after posting using useNavigate
  };

  const handleApiKeySelectionNeeded = (message?: string) => {
    setApiKeyErrorPrompt(
      message ||
      'Uma API key é necessária para este recurso avançado (geração de título/legenda com IA). Por favor, selecione uma chave API paga no painel para continuar. ' +
      'Você pode encontrar mais informações sobre faturamento em ai.google.dev/gemini-api/docs/billing.'
    );
    setShowApiKeyModal(true);
    // As per guidelines, assume success and proceed after opening the selector
    // The actual API call will be retried by PostCreator after the user selects a key.
    window.aistudio.openSelectKey();
  };

  const updateUserProfile = (updatedProfile: Partial<UserProfile>) => {
    setUserProfile((prevProfile) => {
      const newProfile = { ...prevProfile, ...updatedProfile };
      localStorage.setItem('socialvid_user_profile', JSON.stringify(newProfile));
      return newProfile;
    });
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-black">
        {/* Main Content Area - takes up full available height */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={
              <VideoFeed
                posts={posts}
              />
            } />
            <Route
              path="/post"
              element={
                <PostCreator
                  onPost={handlePost}
                  onCancel={() => navigate('/')} // Use navigate for cancel
                  onApiKeyError={handleApiKeySelectionNeeded} // Pass the handler
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProfilePage
                  userProfile={userProfile}
                  updateUserProfile={updateUserProfile}
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
            Você deve ter uma chave API válida associada a um projeto Google Cloud faturável para usar recursos avançados da IA Gemini, como a geração automática de títulos e legendas com o modelo `gemini-3-pro-image-preview`.
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