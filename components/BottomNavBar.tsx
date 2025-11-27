
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-lg p-3 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
            location.pathname === '/' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
          aria-label="Feed Padrão"
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

        {/* Profile Link */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
            location.pathname === '/profile' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
          aria-label="Profile"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
          </svg>
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavBar;