'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Supported grading scales
type GradingScale = 'percentage' | 'fourPoint';

interface GradeEntry {
  subject: string;
  grade: number;
  attended: boolean;
  missingAssignments: number;
  gradingScale: GradingScale;
}

interface GradeInputSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onGradeSubmit: (newGrade: { date: string; entries: GradeEntry[] }) => void;
}

const DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'History'];

export default function GradeInputSidebar({ 
  isOpen, 
  onClose,
  onGradeSubmit
}: GradeInputSidebarProps) {
  // Get today's date in YYYY-MM-DD format, ensuring it's in local timezone
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');
  const localDateString = `${year}-${month}-${day}`;
  
  const [date, setDate] = useState<string>(localDateString);
  const [entries, setEntries] = useState<GradeEntry[]>(
    DEFAULT_SUBJECTS.map(subject => ({
      subject,
      grade: 85,
      attended: true,
      missingAssignments: 0,
      gradingScale: 'percentage'
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    // Don't clear localStorage on mount - this was causing saved grades to be lost
    // localStorage.removeItem('dailyGrades');
  }, []);

  const handleGradeChange = (index: number, value: number) => {
    const newEntries = [...entries];
    const scale = newEntries[index].gradingScale;
    
    // Ensure grade is within appropriate range based on scale
    if (scale === 'percentage') {
      newEntries[index].grade = Math.max(0, Math.min(100, value));
    } else if (scale === 'fourPoint') {
      newEntries[index].grade = Math.max(0, Math.min(4, value));
    }
    
    setEntries(newEntries);
  };

  const handleAttendanceChange = (index: number, value: boolean) => {
    const newEntries = [...entries];
    newEntries[index].attended = value;
    setEntries(newEntries);
  };

  const handleMissingAssignmentsChange = (index: number, value: number) => {
    const newEntries = [...entries];
    newEntries[index].missingAssignments = Math.max(0, value);
    setEntries(newEntries);
  };
  
  const handleGradingScaleChange = (index: number, value: GradingScale) => {
    const newEntries = [...entries];
    const oldScale = newEntries[index].gradingScale;
    const currentGrade = newEntries[index].grade;
    
    // Convert grade when changing scale
    if (oldScale === 'percentage' && value === 'fourPoint') {
      // Convert from percentage to 4.0 scale
      newEntries[index].grade = Math.min(4, (currentGrade / 100) * 4);
    } else if (oldScale === 'fourPoint' && value === 'percentage') {
      // Convert from 4.0 scale to percentage
      newEntries[index].grade = Math.min(100, (currentGrade / 4) * 100);
    }
    
    newEntries[index].gradingScale = value;
    setEntries(newEntries);
  };

  const handleSubjectChange = (index: number, value: string) => {
    const newEntries = [...entries];
    newEntries[index].subject = value;
    setEntries(newEntries);
  };

  const addSubject = () => {
    setEntries([...entries, { subject: '', grade: 85, attended: true, missingAssignments: 0, gradingScale: 'percentage' }]);
  };

  const removeSubject = (index: number) => {
    if (entries.length > 1) {
      const newEntries = [...entries];
      newEntries.splice(index, 1);
      setEntries(newEntries);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entries
    if (entries.some(entry => !entry.subject.trim())) {
      setError('All subjects must have a name');
      return;
    }
    
    // Check for duplicate subjects
    const subjects = entries.map(entry => entry.subject.trim().toLowerCase());
    if (new Set(subjects).size !== subjects.length) {
      setError('Each subject must be unique');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    // Ensure the date is properly formatted (YYYY-MM-DD)
    // This ensures consistency with how we display dates
    const formattedDate = date;
    
    console.log("Saving grades for date:", formattedDate);
    
    // Create new grade object
    const newGrade = { date: formattedDate, entries };
    
    try {
      // IMPORTANT: Always update localStorage first to ensure data is saved locally
      // regardless of API success or failure
      // Use user-specific key to prevent data leakage between users
      const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';
      const storageKey = userEmail ? `dailyGrades_${userEmail}` : 'dailyGrades';
      
      const existingGrades = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Add to localStorage (replace if same date exists)
      const dateIndex = existingGrades.findIndex((g: any) => g.date === formattedDate);
      if (dateIndex >= 0) {
        existingGrades[dateIndex] = newGrade;
      } else {
        existingGrades.unshift(newGrade); // Add to beginning
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existingGrades));
      console.log(`Saved grades to localStorage (${storageKey}):`, existingGrades);
      
      // Now try to submit to API
      const response = await fetch('/api/daily-grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGrade),
      });
      
      // Notify parent component first so UI updates
      onGradeSubmit(newGrade);
      
      if (response.ok) {
        const jsonResponse = await response.json();
        console.log("API response:", jsonResponse);
        setSuccess('Grades saved successfully to server and locally!');
      } else {
        console.warn("API request failed but data was saved locally");
        setSuccess('Grades saved locally (offline mode)');
      }
      
      // Reset form to today's date if different
      if (date !== localDateString) {
        setDate(localDateString);
      }
    } catch (error) {
      console.error('Error submitting grades:', error);
      
      // Ensure data is saved to localStorage even on API error
      try {
        const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';
        const storageKey = userEmail ? `dailyGrades_${userEmail}` : 'dailyGrades';
        
        const existingGrades = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const dateIndex = existingGrades.findIndex((g: any) => g.date === formattedDate);
        if (dateIndex >= 0) {
          existingGrades[dateIndex] = newGrade;
        } else {
          existingGrades.unshift(newGrade);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(existingGrades));
        console.log(`Saved grades to localStorage (fallback) (${storageKey}):`, existingGrades);
        
        // Still notify parent component
        onGradeSubmit(newGrade);
        
        setSuccess('Grades saved locally (offline mode)');
      } catch (localStorageError) {
        console.error('Failed to save to localStorage:', localStorageError);
        setError('Failed to save your grades. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-indigo-50">
        <h2 className="text-xl font-semibold text-indigo-800">Enter Daily Grades</h2>
        {isOpen && (
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              required
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Subjects</h3>
              <button
                type="button"
                onClick={addSubject}
                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
              >
                + Add Subject
              </button>
            </div>
            
            {entries.map((entry, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-100">
                <div className="flex justify-between mb-2">
                  <input
                    type="text"
                    value={entry.subject}
                    onChange={(e) => handleSubjectChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    placeholder="Subject name"
                    required
                  />
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Grade {entry.gradingScale === 'percentage' ? '(0-100)' : '(0-4.0)'}
                    </label>
                    <div className="flex items-center">
                      <label className="mr-2 text-xs font-medium text-gray-600">Scale:</label>
                      <select
                        value={entry.gradingScale}
                        onChange={(e) => handleGradingScaleChange(index, e.target.value as GradingScale)}
                        className="text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 p-1"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fourPoint">4.0 Scale</option>
                      </select>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={entry.gradingScale === 'percentage' ? "100" : "4"}
                    step={entry.gradingScale === 'percentage' ? "1" : "0.1"}
                    value={entry.grade}
                    onChange={(e) => handleGradeChange(index, parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    required
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={entry.attended}
                      onChange={(e) => handleAttendanceChange(index, e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Attended class</span>
                  </label>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Missing Assignments
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={entry.missingAssignments}
                      onChange={(e) => handleMissingAssignmentsChange(index, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Grades'}
          </button>
        </form>
      </div>
    </div>
  );
}
