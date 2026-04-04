import React from 'react';
import { Settings, RefreshCw, LogIn } from 'lucide-react';

const MaintenancePage = ({ message = 'Site is under maintenance. Please try again later.' }) => {
  const handleAdminLogin = () => {
    // Clear current session and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center px-6 max-w-md">
        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center">
            <Settings className="w-12 h-12 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">Under Maintenance</h1>
        
        {/* Message */}
        <p className="text-gray-300 text-lg mb-8">{message}</p>
        
        {/* Contact Info */}
        <p className="text-gray-400 text-sm mb-6">
          We're working hard to bring the site back online. Thank you for your patience!
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2 justify-center"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          
          <button
            onClick={handleAdminLogin}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2 justify-center"
          >
            <LogIn size={20} />
            Admin Login
          </button>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
