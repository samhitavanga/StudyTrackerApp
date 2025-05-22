'use client';

import { useRouter } from 'next/navigation';
import { logoutUser } from '../utils/auth';
import { useEffect, useState } from 'react';

// Add this console log to check if the component is being imported and rendered
console.log('SuperLogoutButton component loaded');

/**
 * A super prominent logout button that's impossible to miss
 */
const SuperLogoutButton = () => {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  
  // Handle logout action
  const handleLogout = () => {
    console.log('Logging out user via SuperLogoutButton');
    alert('Logging out...');
    logoutUser();
    router.push('/signin');
  };
  
  // Add debugging log in useEffect
  useEffect(() => {
    console.log('SuperLogoutButton mounted');
  }, []);
  
  // Add a keystroke handler to logout when user presses 'L'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'l') {
        console.log('Logout shortcut detected');
        handleLogout();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="fixed top-4 right-4 z-[9999] m-4">
      <button
        onClick={handleLogout}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          flex items-center justify-center gap-2 
          px-6 py-4 
          bg-red-600 hover:bg-red-700 
          text-white font-extrabold text-xl
          rounded-lg shadow-2xl 
          border-4 border-red-400
          transition-all duration-300 
          ${isHovering ? 'scale-110' : 'scale-100'}
          ${isHovering ? 'animate-none' : 'animate-pulse'}
        `}
        style={{
          boxShadow: isHovering ? '0 0 15px 5px rgba(255, 0, 0, 0.5)' : '0 0 10px 2px rgba(255, 0, 0, 0.3)'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="tracking-wider uppercase">Logout</span>
      </button>
      
      {/* Instructions tooltip */}
      <div className="absolute top-full right-0 mt-2 bg-white text-red-600 text-xs p-2 rounded-md shadow-md border border-red-300 z-[9999]">
        Press 'L' to logout instantly
      </div>
    </div>
  );
};

export default SuperLogoutButton;
