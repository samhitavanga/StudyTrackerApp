'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from './utils/auth';

/**
 * Standalone logout component that will work regardless of authentication status
 */
export default function LogoutPage() {
  const router = useRouter();
  
  // Log the user out immediately when this page is accessed
  useEffect(() => {
    // Force cleanup of any authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Also use the regular logout function
    logoutUser();
    
    // Redirect to sign in
    router.push('/signin');
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-800 mb-4">Logging Out...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    </div>
  );
}
