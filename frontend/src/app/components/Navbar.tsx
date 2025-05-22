'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logoutUser, getCurrentUser } from '../utils/auth';

import React from "react";
import logoImage from "frontend/testlogopicture.png";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in on client side
    if (typeof window !== 'undefined') {
      const user = getCurrentUser();
      const loggedIn = !!localStorage.getItem('token');
      setIsLoggedIn(loggedIn);
      if (user?.username) {
        setUsername(user.username);
      }
      console.log('Auth state:', { loggedIn, user, token: localStorage.getItem('token') });
    }
  }, []);
  
  const handleLogout = () => {
    console.log('Logging out...');
    logoutUser();
    router.push('/signin');
  };
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b-2 border-purple-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-extrabold text-purple-900 dark:text-purple-400">
                Study Tracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                href="/log-grades"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/log-grades')}`}
              >
                Log Grades
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <span className="text-sm font-extrabold text-purple-900 dark:text-purple-300 mr-4">
              {username ? `Hello, ${username}` : 'Hello, Student'}
            </span>
            <button
              onClick={handleLogout}
              className="px-6 py-3 text-base font-extrabold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 border-2 border-purple-500 animate-pulse"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === '/dashboard'
                ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/log-grades"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === '/log-grades'
                ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Log Grades
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-center py-3 mt-3 mb-1 text-lg font-extrabold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-lg transition-colors duration-200 border-2 border-purple-500 animate-pulse"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
