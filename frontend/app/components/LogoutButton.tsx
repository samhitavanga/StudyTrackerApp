'use client';

import { useEffect, useState } from 'react';

/**
 * A simplified logout button component that matches the app's aesthetic
 * Only displays when user is on protected pages like dashboard
 */
export default function LogoutButton() {
  // State to track button visibility
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    // Simple function to determine if button should be shown
    const checkVisibility = () => {
      // Get current path - this is guaranteed to be available on client side
      const path = window.location.pathname;
      console.log('Current path:', path);
      
      // List of public pages where logout should be hidden
      const publicPages = ['/', '/login', '/signin', '/signup', '/register'];
      
      // Always show on dashboard and other protected pages
      const isProtectedPage = path.includes('/dashboard');
      console.log('Is protected page:', isProtectedPage);
      
      // Hide on public pages
      const isPublicPage = publicPages.some(p => path === p);
      console.log('Is public page:', isPublicPage);
      
      // Show button if we're on a protected page OR not on a public page
      setShowButton(isProtectedPage || !isPublicPage);
      console.log('Button visibility set to:', isProtectedPage || !isPublicPage);
    };
    
    // Run immediately
    checkVisibility();
    
    // Update on navigation
    window.addEventListener('popstate', checkVisibility);
    
    return () => window.removeEventListener('popstate', checkVisibility);
  }, []);
  
  // Handle logout action
  const handleLogout = () => {
    console.log('Logout button clicked');
    
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('dailyGrades');
    localStorage.removeItem('isLoggedIn');
    
    // Clear cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Force redirect
    window.location.href = '/login';
  };

  // If we shouldn't show the button, render nothing
  if (!showButton) {
    console.log('Hiding logout button');
    return null;
  }

  console.log('Showing logout button');
  return (
    <button
      onClick={handleLogout}
      className="fixed top-5 right-5 z-[9999] 
                 px-4 py-2.5 
                 bg-gradient-to-r from-purple-700 to-purple-900 
                 hover:from-purple-800 hover:to-purple-900
                 text-white font-medium text-sm
                 rounded-md shadow-lg 
                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                 transition-all duration-300 ease-in-out
                 flex items-center gap-2"
      aria-label="Logout"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
      </svg>
      Logout
    </button>
  );
}
