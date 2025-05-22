'use client';

import { useState, useEffect } from 'react';
import FixedGradeProgressChart from '../components/FixedGradeProgressChart';
import GradeStats from '../components/GradeStats';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';
import ProtectedRoute from '../utils/ProtectedRoute';
import { getCurrentUser, logoutUser } from '../utils/auth';
import Link from 'next/link';
import { getTodayFormatted } from '../utils/dateUtils';
import { useRouter } from 'next/navigation';



// Using the SuperLogoutButton component instead of defining our own

export default function Dashboard() {
  const router = useRouter();
  const user = getCurrentUser();
  const username = user?.username || 'Student';
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    // This runs only on the client side after hydration
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-6">
        
        {/* Enhanced header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-purple-100 p-4 rounded-lg border-2 border-purple-300 shadow-lg">
          <div>
            <h1 className="text-3xl font-extrabold text-purple-900 dark:text-white mb-2">
              {username}&apos;s Dashboard
            </h1>
            <p className="text-purple-800 font-bold">
              Today is: {currentDate}
            </p>
          </div>
          
          {/* Standard LogoutButton in header */}
          <div className="mt-4 sm:mt-0">
            <LogoutButton 
              size="large" 
              className="border-2 border-purple-400 font-bold" 
              onLogout={() => {
                logoutUser();
                router.push('/signin');
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Daily Grade Entry</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Track your academic progress by logging your daily grades for each class period.
            </p>
            <Link 
              href="/log-grades" 
              className="inline-flex justify-center py-3 px-6 border border-transparent shadow-lg text-base font-bold rounded-md text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              Enter Today&apos;s Grades
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-extrabold text-purple-900 dark:text-white mb-4">Quick Stats</h2>
            <p className="text-purple-800 dark:text-gray-300 mb-2 font-bold">
              <span className="font-extrabold">Today's Date:</span> {currentDate}
            </p>
            <p className="text-purple-800 dark:text-gray-300 font-bold">
              <span className="font-extrabold">Latest Activity:</span> Grade logging
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <section>
            <h2 className="text-2xl font-extrabold text-purple-900 dark:text-white mb-4">Grade Progress</h2>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border-2 border-purple-300">
              {/* Using the chart component with real data from API or localStorage */}
              <FixedGradeProgressChart />
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-extrabold text-purple-900 dark:text-white mb-4">Grade Statistics</h2>
            <GradeStats />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
