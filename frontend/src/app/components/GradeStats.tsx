'use client';

import { useEffect, useState } from 'react';
import { fetchDailyGrades } from '../utils/api';
import { DailyGrade, ApiListResponse } from '../types';

const GradeStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    averages: { [key: string]: number };
    highest: { [key: string]: number };
    lowest: { [key: string]: number };
    latest: { [key: string]: number };
  }>({
    averages: {},
    highest: {},
    lowest: {},
    latest: {}
  });

  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoading(true);
        const response = await fetchDailyGrades() as ApiListResponse<DailyGrade>;
        
        if (response.data.length === 0) {
          setLoading(false);
          return;
        }
        
        // Calculate statistics
        const dailyGrades = response.data;
        const periodNames = ['period1', 'period2', 'period3', 'period4', 'period5', 'period6', 'period7'];
        
        // Initialize stats
        const averages: { [key: string]: number } = {};
        const highest: { [key: string]: number } = {};
        const lowest: { [key: string]: number } = {};
        
        // Sort by date to get latest grades
        const sortedGrades = [...dailyGrades].sort((a, b) => 
          new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime()
        );
        
        const latestGrade = sortedGrades[0];
        const latest: { [key: string]: number } = {};
        
        // Calculate stats for each period
        periodNames.forEach(period => {
          // Get all grades for this period
          const grades = dailyGrades.map(grade => grade.attributes[period as keyof typeof grade.attributes] as number);
          
          // Calculate average
          const sum = grades.reduce((acc, grade) => acc + grade, 0);
          averages[period] = Number((sum / grades.length).toFixed(2));
          
          // Find highest and lowest
          highest[period] = Math.max(...grades);
          lowest[period] = Math.min(...grades);
          
          // Get latest grades
          latest[period] = latestGrade.attributes[period as keyof typeof latestGrade.attributes] as number;
        });
        
        setStats({ averages, highest, lowest, latest });
      } catch (err) {
        console.error('Failed to fetch daily grades:', err);
        setError('Failed to load grade statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Check if we have any data
  const hasData = Object.keys(stats.averages).length > 0;

  if (!hasData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">No grade data available. Start logging your daily grades to see statistics!</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Grade Statistics</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Period
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Latest Grade
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Average
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Highest
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Lowest
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3, 4, 5, 6, 7].map((periodNum) => {
              const periodKey = `period${periodNum}`;
              return (
                <tr key={periodKey} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Period {periodNum}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {stats.latest[periodKey].toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {stats.averages[periodKey].toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {stats.highest[periodKey].toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {stats.lowest[periodKey].toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeStats;
