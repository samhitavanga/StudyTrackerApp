'use client';

import { useState, useEffect } from 'react';
import { fetchDailyGrades } from '../utils/api';
import DailyGradeForm from '../components/DailyGradeForm';
import Navbar from '../components/Navbar';
import { format, parseISO } from 'date-fns';
import { DailyGrade, ApiListResponse } from '../types';
import { useRouter } from 'next/navigation';

export default function LogGradesPage() {
  const [recentGrades, setRecentGrades] = useState<DailyGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [router]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const response = await fetchDailyGrades() as ApiListResponse<DailyGrade>;
      
      // Only show the 5 most recent entries
      const sortedGrades = [...response.data].sort((a, b) => 
        new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime()
      );
      
      setRecentGrades(sortedGrades.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch daily grades:', err);
      setError('Failed to load recent grades. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Load grades on mount and after submitting a new grade
  useEffect(() => {
    loadGrades();
  }, []);

  const handleFormSuccess = () => {
    loadGrades();
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Log Daily Grades</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <DailyGradeForm onSuccess={handleFormSuccess} />
          
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Recent Entries</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            ) : recentGrades.length === 0 ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">No grade entries found. Use the form above to log your first grades!</span>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                          <th key={period} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Period {period}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {recentGrades.map((grade) => (
                        <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {format(parseISO(grade.attributes.date), 'MMM dd, yyyy')}
                          </td>
                          {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                            <td key={period} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {(() => {
                                const value = grade.attributes[`period${period}` as keyof typeof grade.attributes];
                                if (value === undefined || value === null) return 'N/A';
                                return typeof value === 'number' ? `${value.toFixed(2)}%` : value.toString();
                              })()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
