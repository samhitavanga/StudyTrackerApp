'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import GradeInputSidebar from '../../components/GradeInputSidebar';

// Simple Logout Button Component specifically for the dashboard
function DashboardLogoutButton() {
  const handleLogout = () => {
    console.log('Dashboard LogoutButton: Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Keep 'dailyGrades' in localStorage to preserve user data across sessions
    localStorage.removeItem('isLoggedIn');
    
    // Clear cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login
    window.location.href = '/login';
  };

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

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type GradingScale = 'percentage' | 'fourPoint';

interface GradeEntry {
  subject: string;
  grade: number;
  attended: boolean;
  missingAssignments: number;
  gradingScale: GradingScale;
}

interface DailyGrade {
  date: string;
  entries: GradeEntry[];
}

const COLORS = ['#4C1D95', '#5B21B6', '#7C3AED', '#8B9467', '#A78BFA', '#C7B8EA', '#E2D1F9'];

export default function Dashboard() {
  const [grades, setGrades] = useState<DailyGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'quarter' | 'month' | 'week'>('all');
  const router = useRouter();

  useEffect(() => {
    // Ensure we never clear localStorage on mount to preserve data across sessions
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to fetch from API first
      const response = await fetch('/api/daily-grades');
      
      if (response.ok) {
        const responseData = await response.json();
        // Make sure we're extracting the actual grades data from the response
        const data = responseData.data ? responseData.data : responseData;
        console.log("Fetched grades from API:", data);
        
        // Check if the data is actually an array of grades
        if (Array.isArray(data)) {
          // Get local grades to merge with API grades
          let localGrades: DailyGrade[] = [];
          try {
            const localGradesStr = localStorage.getItem('dailyGrades');
            if (localGradesStr) {
              localGrades = JSON.parse(localGradesStr);
            }
          } catch (e) {
            console.error('Error parsing localStorage grades:', e);
          }
          
          // Create a map of API grades by date for easy lookup
          const apiGradesByDate = new Map<string, DailyGrade>();
          data.forEach((grade: DailyGrade) => {
            apiGradesByDate.set(grade.date, grade);
          });
          
          // Create a map of local grades by date for easy lookup
          const localGradesByDate = new Map<string, DailyGrade>();
          localGrades.forEach((grade: DailyGrade) => {
            localGradesByDate.set(grade.date, grade);
          });
          
          // Merge local grades with API grades
          // Local grades take precedence for dates not in API data
          const mergedGradesMap = new Map<string, DailyGrade>([...localGradesByDate, ...apiGradesByDate]);
          const mergedGrades = Array.from(mergedGradesMap.values());
          
          // Sort by date (newest first)
          mergedGrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setGrades(mergedGrades);
          
          // Update localStorage with merged data for offline access using user-specific key
          const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';
          const storageKey = userEmail ? `dailyGrades_${userEmail}` : 'dailyGrades';
          localStorage.setItem(storageKey, JSON.stringify(mergedGrades));
          console.log(`Merged and saved grades to localStorage (${storageKey}):`, mergedGrades);
        } else {
          console.error("API response doesn't contain valid grades data:", responseData);
          // Fall back to localStorage
          tryLocalStorage();
        }
      } else {
        console.log("API request failed, status:", response.status);
        // If API fails, try to get from localStorage
        tryLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      // Try localStorage as fallback
      tryLocalStorage();
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to try loading grades from localStorage
  const tryLocalStorage = () => {
    try {
      // Use user-specific storage key
      const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';
      const storageKey = userEmail ? `dailyGrades_${userEmail}` : 'dailyGrades';
      console.log(`Trying to fetch grades from localStorage using key: ${storageKey}`);
      
      const localGrades = localStorage.getItem(storageKey);
      
      if (localGrades) {
        const parsedGrades = JSON.parse(localGrades);
        console.log(`Using grades from localStorage (${storageKey}):`, parsedGrades);
        
        if (Array.isArray(parsedGrades)) {
          setGrades(parsedGrades);
        } else {
          console.error(`localStorage (${storageKey}) contains invalid grades data:`, parsedGrades);
          setGrades([]);
        }
      } else {
        // No data available
        console.log(`No grades found in localStorage (${storageKey})`);
        setGrades([]);
      }
    } catch (storageError) {
      console.error('Error accessing localStorage:', storageError);
      setGrades([]);
    }
  };

  const handleGradeSubmit = (newGrade: DailyGrade) => {
    // Update the grades state with the new grade
    console.log("Received new grade submission:", newGrade);
    const updatedGrades = [...grades];
    const existingIndex = updatedGrades.findIndex((g: DailyGrade) => g.date === newGrade.date);
    
    if (existingIndex >= 0) {
      console.log("Updating existing grade entry at index:", existingIndex);
      updatedGrades[existingIndex] = newGrade;
    } else {
      console.log("Adding new grade entry");
      updatedGrades.unshift(newGrade);
    }
    
    console.log("Updated grades:", updatedGrades);
    setGrades(updatedGrades);
    
    // Always update localStorage to ensure data persistence across sessions
    try {
      const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';
      const storageKey = userEmail ? `dailyGrades_${userEmail}` : 'dailyGrades';
      localStorage.setItem(storageKey, JSON.stringify(updatedGrades));
      console.log(`Updated grades saved to localStorage (${storageKey})`);
    } catch (error) {
      console.error("Failed to save grades to localStorage:", error);
    }
  };

  interface GradeChartEntry {
    date: Date;
    grade: number;
    gradingScale: GradingScale;
  }

  interface SubjectGrades {
    [subject: string]: GradeChartEntry[];
  }

  interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    pointBackgroundColor: string;
    pointBorderColor: string;
    pointRadius: number;
    pointHoverRadius: number;
  }

  interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
  }

  const createChartData = useCallback((gradesData: DailyGrade[], selectedTimeRange: string): ChartData | null => {
    if (!gradesData || gradesData.length === 0) {
      return null;
    }
    
    // Filter data based on time range
    const filteredGrades = filterGradesByTimeRange(gradesData, selectedTimeRange);

    // Group grades by subject
    const subjectGrades: SubjectGrades = {};
    filteredGrades.forEach((entry: DailyGrade) => {
      entry.entries.forEach((e: GradeEntry) => {
        if (!subjectGrades[e.subject]) {
          subjectGrades[e.subject] = [];
        }
        // Only include entries that were attended
        if (e.attended) {
          subjectGrades[e.subject].push({
            date: new Date(entry.date),
            grade: typeof e.grade === 'string' ? parseFloat(e.grade) || 0 : (e.grade || 0), // Ensure we have a valid number
            gradingScale: e.gradingScale || 'percentage' // Use percentage as default if not specified
          });
        }
      });
    });

    // Get all unique dates
    const allDates = [...new Set(filteredGrades.map((entry: DailyGrade) => entry.date))].sort();

    // Create datasets for each subject
    const datasets = Object.keys(subjectGrades).map((subject: string, index: number) => {
      const color = COLORS[index % COLORS.length];
      
      // Sort entries by date
      const sortedEntries = subjectGrades[subject].sort((a: GradeChartEntry, b: GradeChartEntry) => {
        return a.date.getTime() - b.date.getTime();
      });
      
      // Normalize all grades to percentage for consistent visualization
      const normalizedData = sortedEntries.map((entry: GradeChartEntry) => {
        return normalizeGrade(entry.grade || 0, entry.gradingScale || 'percentage');
      });
      
      return {
        label: subject,
        data: normalizedData, // Normalized data for consistent visualization
        borderColor: color,
        backgroundColor: `${color}20`, // Add transparency
        tension: 0.3,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    return {
      // Fix for date display issue - adjust date timezone correctly by adding 'T00:00:00'
      labels: allDates.map((date: string) => {
        // Ensure we create the date without timezone issues
        const localDate = new Date(date + 'T00:00:00');
        return localDate.toLocaleDateString();
      }),
      datasets
    };
  }, []);

  // Filter grades based on selected time range
  const filterGradesByTimeRange = (gradesData: DailyGrade[], range: string): DailyGrade[] => {
    if (range === 'all' || !gradesData || gradesData.length === 0) {
      return gradesData;
    }
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch(range) {
      case 'week':
        // Last 7 days
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        // Last 30 days
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        // Last 90 days
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'year':
        // Last 365 days
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 365);
        break;
      default:
        return gradesData;
    }
    
    // Convert cutoff date to string format for comparison (YYYY-MM-DD)
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    return gradesData.filter(grade => {
      return grade.date >= cutoffDateStr;
    });
  };

  // Get filtered grades based on time range
  const filteredGrades = filterGradesByTimeRange(grades, timeRange);
  
  // Create chart data and calculate metrics based on filtered grades
  const chartData = createChartData(grades, timeRange);
  const averageGrade = getAverageGrade(filteredGrades);
  const gpa = getGPA(filteredGrades);
  const attendanceRate = getAttendanceRate(filteredGrades);
  const totalMissingAssignments = getTotalMissingAssignments(grades);
  
  // Define interface for missing assignment data by class
  interface MissingAssignmentByClass {
    subject: string;
    count: number;
  }
  
  // Get missing assignments grouped by class
  const getMissingAssignmentsByClass = (): MissingAssignmentByClass[] => {
    if (!grades || grades.length === 0) return [];
    
    // Get the most recent grade entry
    const latestGrade = grades[0];
    
    // Create an array of subjects with their missing assignment counts
    const subjectMissingAssignments: MissingAssignmentByClass[] = latestGrade.entries
      .filter(entry => entry.missingAssignments > 0)
      .map(entry => ({
        subject: entry.subject,
        count: entry.missingAssignments
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
    
    return subjectMissingAssignments;
  };
  
  // Determine color based on missing assignment count
  const getColorForMissingCount = (count: number): string => {
    if (count === 0) return '#10B981'; // Green for no missing assignments
    if (count <= 3) return '#FBBF24'; // Yellow for 1-3 missing assignments
    if (count <= 7) return '#F97316'; // Orange for 4-7 missing assignments
    return '#EF4444'; // Red for 8+ missing assignments
  };
  
  const missingAssignmentsColor = getColorForMissingCount(totalMissingAssignments);
  const recentGrades = getRecentGrades(grades);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Add the logout button */}
      <DashboardLogoutButton />
      
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-0 -ml-5'} overflow-hidden`}>
        <div className="h-full">
          <GradeInputSidebar 
            isOpen={isSidebarOpen} 
            onClose={toggleSidebar} 
            onGradeSubmit={handleGradeSubmit}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Toggle sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 style={{ color: '#4C1D95', fontWeight: 'bold' }} className="text-3xl">Study Progress Dashboard</h1>
            </div>
            
            {/* We removed the duplicate logout button since we have the global one now */}
          </div>
          
          {grades.length === 0 ? (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 style={{ color: '#4C1D95', fontWeight: '600' }} className="mt-4 text-xl">No grades found</h2>
              <p className="mt-2 text-gray-600">Start tracking your study progress by adding your first grade entry.</p>
              <button
                onClick={toggleSidebar}
                style={{ backgroundColor: '#7C3AED', color: 'white' }}
                className="mt-4 px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Add Grades
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Average Grade Card */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 style={{ color: '#4C1D95', fontWeight: 'bold' }} className="text-lg mb-2">Average Grade</h2>
                  <div className="flex items-end">
                    <span style={{ color: '#5B21B6', fontWeight: '800', fontSize: '3rem' }}>{isNaN(averageGrade) ? '0' : averageGrade}</span>
                    <span style={{ color: '#4C1D95', fontWeight: 'bold' }} className="text-xl ml-2 mb-1">%</span>
                  </div>
                  <div style={{ color: '#4C1D95', fontWeight: '500' }} className="mt-2 text-sm">Across all subjects</div>
                </div>
                
                {/* GPA Card */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 style={{ color: '#4C1D95', fontWeight: 'bold' }} className="text-lg mb-2">GPA</h2>
                  <div className="flex items-end">
                    <span style={{ color: '#5B21B6', fontWeight: '800', fontSize: '3rem' }}>{isNaN(parseFloat(gpa)) ? '0.0' : gpa}</span>
                    <span style={{ color: '#4C1D95', fontWeight: 'bold' }} className="text-xl ml-2 mb-1">/ 4.0</span>
                  </div>
                  <div style={{ color: '#4C1D95', fontWeight: '500' }} className="mt-2 text-sm">Cumulative GPA</div>
                </div>
                
                {/* Attendance Rate Card */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 style={{ color: '#4C1D95', fontWeight: 'bold' }} className="text-lg mb-2">Attendance</h2>
                  <div className="flex items-end">
                    <span style={{ color: '#5B21B6', fontWeight: '800', fontSize: '3rem' }}>{isNaN(attendanceRate) ? '0' : attendanceRate}%</span>
                  </div>
                  <div style={{ color: '#4C1D95', fontWeight: '500' }} className="mt-2 text-sm">Class attendance rate</div>
                </div>
                
                {/* Missing Assignments Bar Graph */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 style={{ color: '#4C1D95', fontWeight: 'bold' }} className="text-lg mb-3">Missing Assignments</h2>
                  
                  {getMissingAssignmentsByClass().length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="text-green-500 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-center text-lg font-bold text-green-600">All caught up!</p>
                      <p className="text-center text-sm text-purple-900 mt-1">No missing assignments</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getMissingAssignmentsByClass().map((item, index) => (
                        <div key={index} className="relative pt-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-purple-900">{item.subject}</span>
                            <span className="text-sm font-medium text-purple-800">{item.count}</span>
                          </div>
                          <div className="overflow-hidden h-3 text-xs flex rounded bg-purple-100">
                            <div
                              style={{
                                width: `${Math.min(100, (item.count / Math.max(...getMissingAssignmentsByClass().map(i => i.count))) * 100)}%`,
                                backgroundColor: getColorForMissingCount(item.count)
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                            ></div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center text-xs text-purple-900 mt-2 pt-1">
                        {totalMissingAssignments > 0 && 
                          <p>Total: {totalMissingAssignments} missing {totalMissingAssignments === 1 ? 'assignment' : 'assignments'}</p>
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Entries Card */}
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 style={{ color: '#4C1D95', fontWeight: 'bold' }} className="text-lg mb-4">Most Recent Grades</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th style={{ color: '#4C1D95', fontWeight: 'bold' }} className="px-4 py-2 text-left text-xs uppercase tracking-wider">Subject</th>
                        <th style={{ color: '#4C1D95', fontWeight: 'bold' }} className="px-4 py-2 text-center text-xs uppercase tracking-wider">Grade</th>
                        <th style={{ color: '#4C1D95', fontWeight: 'bold' }} className="px-4 py-2 text-left text-xs uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentGrades.map((entry, index) => (
                        <tr key={index}>
                          <td style={{ color: '#4C1D95', fontWeight: '500' }} className="px-4 py-2 whitespace-nowrap text-sm">{entry.subject}</td>
                          <td style={{ color: '#4C1D95', fontWeight: '500' }} className="px-4 py-3 text-center">
                            {entry.gradingScale === 'fourPoint' 
                              ? `${formatGradeForDisplay(entry.grade, 'fourPoint')}/4.0` 
                              : `${formatGradeForDisplay(entry.grade, 'percentage')}%`}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {entry.attended ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-900">
                                Attended
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-900">
                                Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Chart - Made wider */}
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 style={{ color: '#4C1D95', fontWeight: 'bold' }} className="text-lg">Grade Trends</h2>
                  
                  <div className="flex items-center">
                    <label htmlFor="timeRange" className="mr-2 text-sm font-medium text-purple-900">
                      Time Range:
                    </label>
                    <select
                      id="timeRange"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value as 'all' | 'year' | 'quarter' | 'month' | 'week')}
                      className="bg-purple-50 border border-purple-300 text-purple-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2"
                    >
                      <option value="all">All Time</option>
                      <option value="year">Past Year</option>
                      <option value="quarter">Past 3 Months</option>
                      <option value="month">Past Month</option>
                      <option value="week">Past Week</option>
                    </select>
                  </div>
                </div>
                <div className="h-96 w-full">
                  {chartData && <Line data={chartData} options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: 3, // Wider aspect ratio
                    scales: {
                      y: {
                        min: 0,
                        max: 100,
                        ticks: {
                          stepSize: 20,
                          padding: 10,
                          font: {
                            size: 12,
                            weight: 'bold'
                          },
                          color: '#4C1D95' // purple-900
                        },
                        grid: {
                          color: 'rgba(76, 29, 149, 0.1)' // purple-900 with opacity
                        },
                        border: {
                          dash: [4, 4]
                        }
                      },
                      x: {
                        ticks: {
                          padding: 10,
                          font: {
                            size: 12,
                            weight: 'bold'
                          },
                          color: '#4C1D95' // purple-900
                        },
                        grid: {
                          color: 'rgba(76, 29, 149, 0.1)' // purple-900 with opacity
                        },
                        border: {
                          dash: [4, 4]
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          font: {
                            size: 12,
                            weight: 'bold'
                          },
                          color: '#4C1D95' // purple-900
                        }
                      },
                      tooltip: {
                        padding: 12,
                        boxPadding: 6,
                        titleFont: {
                          weight: 'bold'
                        },
                        bodyFont: {
                          size: 12,
                          weight: 'bold'
                        },
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#4C1D95', // purple-900
                        bodyColor: '#4C1D95', // purple-900
                        borderColor: '#6D28D9', // purple-700
                        borderWidth: 1
                      }
                    }
                  }} />}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Floating Action Button */}
      <button
        onClick={toggleSidebar}
        style={{ 
          backgroundColor: '#7C3AED', 
          color: 'white',
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          padding: '1rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
        aria-label="Add Grade"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
}

// Normalize a grade to the percentage scale for consistent calculations
function normalizeGrade(grade: number, scale: GradingScale): number {
  if (scale === 'percentage') {
    return grade;
  } else if (scale === 'fourPoint') {
    // Convert 4.0 scale to percentage (4.0 = 100%, 0 = 0%)
    return (grade / 4) * 100;
  }
  return grade; // Default fallback
}

// Format a grade for display based on its scale
function formatGradeForDisplay(grade: number, scale: GradingScale): string {
  if (scale === 'percentage') {
    return Math.round(grade).toString();
  } else if (scale === 'fourPoint') {
    return grade.toFixed(1);
  }
  return grade.toString(); // Default fallback
}

function getAverageGrade(gradesData: DailyGrade[]): number {
  if (!gradesData || !gradesData.length) return 0;
  
  let totalNormalizedGrade = 0;
  let count = 0;

  gradesData.forEach((dailyGrade) => {
    dailyGrade.entries.forEach((entry) => {
      if (entry.attended) {
        // Normalize all grades to percentage scale for averaging
        totalNormalizedGrade += normalizeGrade(entry.grade, entry.gradingScale || 'percentage');
        count++;
      }
    });
  });
  
  return count > 0 ? Math.round(totalNormalizedGrade / count) : 0;
}

function getRecentGrades(gradesData: DailyGrade[]): GradeEntry[] {
  if (!gradesData || !gradesData.length) return [];
  
  // Get the most recent grade entry with proper date handling
  const sortedGrades = [...gradesData].sort((a: DailyGrade, b: DailyGrade) => {
    // Create dates in UTC to avoid timezone issues
    const dateA = new Date(a.date + 'T12:00:00Z');
    const dateB = new Date(b.date + 'T12:00:00Z');
    return dateB.getTime() - dateA.getTime(); // Descending order
  });
  
  return sortedGrades.length > 0 ? sortedGrades[0].entries : [];
}

function getAttendanceRate(gradesData: DailyGrade[]): number {
  if (!gradesData || !gradesData.length) return 100;
  
  let totalClasses = 0;
  let attendedClasses = 0;
  
  gradesData.forEach((grade: DailyGrade) => {
    grade.entries.forEach((entry: GradeEntry) => {
      totalClasses++;
      if (entry.attended) {
        attendedClasses++;
      }
    });
  });
  
  return totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
}

function getGPA(gradesData: DailyGrade[]): string {
  if (!gradesData || !gradesData.length) return "0.00";
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  // Default credit value for each subject
  const creditValue = 3;
  
  gradesData.forEach((dailyGrade: DailyGrade) => {
    dailyGrade.entries.forEach((entry: GradeEntry) => {
      if (entry.attended) {
        const numericGrade = typeof entry.grade === 'string' ? parseFloat(entry.grade) : (entry.grade || 0);
        const credits = creditValue;
        let gradePoints = 0;
        
        if (entry.gradingScale === 'fourPoint') {
          // For 4.0 scale, use the grade directly as grade points (already on 4.0 scale)
          gradePoints = Math.min(4.0, Math.max(0, numericGrade));
        } else {
          // Convert percentage grade to grade points on a 4.0 scale
          if (numericGrade >= 93) gradePoints = 4.0;
          else if (numericGrade >= 90) gradePoints = 3.7;
          else if (numericGrade >= 87) gradePoints = 3.3;
          else if (numericGrade >= 83) gradePoints = 3.0;
          else if (numericGrade >= 80) gradePoints = 2.7;
          else if (numericGrade >= 77) gradePoints = 2.3;
          else if (numericGrade >= 73) gradePoints = 2.0;
          else if (numericGrade >= 70) gradePoints = 1.7;
          else if (numericGrade >= 67) gradePoints = 1.3;
          else if (numericGrade >= 63) gradePoints = 1.0;
          else if (numericGrade >= 60) gradePoints = 0.7;
          else gradePoints = 0.0;
        }
        
        totalPoints += gradePoints * credits;
        totalCredits += credits;
      }
    });
  });
  
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
}

/**
 * Calculate the total number of missing assignments across all subjects
 */
function getTotalMissingAssignments(gradesData: DailyGrade[]): number {
  if (!gradesData || gradesData.length === 0) return 0;
  
  // Get the latest entry
  const latestEntry = gradesData[0];
  
  // Sum all missing assignments from the latest entry
  return latestEntry.entries.reduce((total, entry) => total + (entry.missingAssignments || 0), 0);
}

/**
 * Calculate the streak of consecutive days with entries
 */
function getInputStreak(gradesData: DailyGrade[]): number {
  // Early return if no data
  if (!gradesData || !gradesData.length) return 0;
  
  // Create a map of all dates with entries for quick lookup
  const dateMap = new Map<string, boolean>();
  
  gradesData.forEach((grade: DailyGrade) => {
    // Ensure we have a consistent date format - use YYYY-MM-DD format
    // We need to handle potential timezone issues by using a proper date object
    const dateParts = grade.date.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(dateParts[2]);
      
      // Create date in local timezone to avoid UTC conversion issues
      const dateObj = new Date(year, month, day);
      
      // Format the date consistently as YYYY-MM-DD
      const formattedDate = dateObj.toISOString().split('T')[0];
      dateMap.set(formattedDate, true);
    }
  });
  
  // Convert the map keys to an array and sort by date (newest first)
  const dates = Array.from(dateMap.keys()).sort().reverse();
  
  if (dates.length === 0) return 0;
  
  // Get today and yesterday's date strings for comparison
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayString = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  
  // Get the most recent date with a grade entry
  const mostRecentDate = dates[0];
  
  // Active streak requires an entry from either today or yesterday
  if (mostRecentDate !== todayString && mostRecentDate !== yesterdayString) {
    console.log('No recent entries. Most recent:', mostRecentDate, 'Today:', todayString, 'Yesterday:', yesterdayString);
    return 0;
  }
  
  // Calculate the streak by checking for consecutive days
  let streak = 1; // Start with 1 for the most recent day
  let currentDate = new Date(mostRecentDate + 'T00:00:00'); // Create a proper date object
  
  // Work backwards from the most recent date to find consecutive days
  while (true) {
    // Move to the previous day
    currentDate.setDate(currentDate.getDate() - 1);
    
    // Format as YYYY-MM-DD for map lookup
    const prevDateString = currentDate.toISOString().split('T')[0];
    
    // If we have an entry for this day, increase the streak
    if (dateMap.has(prevDateString)) {
      streak++;
    } else {
      // The streak is broken
      break;
    }
  }
  
  console.log('Calculated streak:', streak, 'Most recent date:', mostRecentDate);
  return streak;
}
