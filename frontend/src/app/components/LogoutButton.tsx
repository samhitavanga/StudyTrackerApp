'use client';

import { useRouter } from 'next/navigation';
import { logoutUser } from '../utils/auth';

interface LogoutButtonProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * A standalone logout button component that can be placed anywhere in the application
 */
const LogoutButton: React.FC<LogoutButtonProps & { onLogout?: () => void }> = ({ 
  className = '', 
  size = 'medium',
  onLogout
}) => {
  const router = useRouter();

  // Size variants
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-5 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Handle logout action
  const handleLogout = () => {
    console.log('Logging out user...');
    if (onLogout) {
      // Use custom logout handler if provided
      onLogout();
    } else {
      // Default logout behavior
      logoutUser();
      router.push('/signin');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`
        ${sizeClasses[size]}
        font-bold text-white 
        bg-purple-700 hover:bg-purple-800 
        rounded-md shadow-lg 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
        transition-colors duration-200 
        border-2 border-purple-500
        ${className}
      `}
      aria-label="Logout"
    >
      Logout
    </button>
  );
};

// Export both as default and named export
export { LogoutButton };
export default LogoutButton;
