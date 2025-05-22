'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from './auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * A component that protects routes requiring authentication
 * Redirects to sign-in page if user is not logged in
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userLoggedIn = isLoggedIn();
    
    setIsAuthenticated(userLoggedIn);
    setIsLoading(false);
    
    if (!userLoggedIn) {
      // Redirect to sign-in with callback URL
      const currentPath = window.location.pathname;
      router.replace(`/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [router]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Only render children when authenticated
  return isAuthenticated ? <>{children}</> : null;
}
