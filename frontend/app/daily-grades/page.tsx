'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface GradeEntry {
  subject: string;
  grade: number;
  attended: boolean;
}

export default function DailyGradesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [date, setDate] = useState('');
  const [entries, setEntries] = useState<GradeEntry[]>([
    { subject: 'Mathematics', grade: 0, attended: true },
    { subject: 'Science', grade: 0, attended: true },
    { subject: 'English', grade: 0, attended: true },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Set today's date as default
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
  }, [status, router]);

  const handleAddSubject = () => {
    setEntries([...entries, { subject: '', grade: 0, attended: true }]);
  };

  const handleRemoveSubject = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  const handleEntryChange = (index: number, field: keyof GradeEntry, value: string | number | boolean) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value,
    };
    setEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entries
    if (entries.some(entry => !entry.subject.trim())) {
      setError('Please enter a subject name for all entries');
      return;
    }

    if (entries.some(entry => entry.grade < 0 || entry.grade > 100)) {
      setError('Grades must be between 0 and 100');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/daily-grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          entries,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Grades submitted successfully!');
        
        // Store in localStorage for offline access
        const storedGrades = JSON.parse(localStorage.getItem('dailyGrades') || '[]');
        const newGrades = [{ date, entries }, ...storedGrades];
        localStorage.setItem('dailyGrades', JSON.stringify(newGrades));
        
        // Reset form
        setEntries([
          { subject: 'Mathematics', grade: 0, attended: true },
          { subject: 'Science', grade: 0, attended: true },
          { subject: 'English', grade: 0, attended: true },
        ]);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(data.error || 'Failed to submit grades. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting grades:', error);
      setError('Failed to submit grades. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Daily Grades Entry</h1>
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Back to Dashboard
            </a>
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
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="space-y-4 mb-6">
              {entries.map((entry, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Subject {index + 1}</h3>
                    {entries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Name
                      </label>
                      <input
                        type="text"
                        value={entry.subject}
                        onChange={(e) => handleEntryChange(index, 'subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={entry.grade}
                        onChange={(e) => handleEntryChange(index, 'grade', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entry.attended}
                          onChange={(e) => handleEntryChange(index, 'attended', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Attended</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mb-6">
              <button
                type="button"
                onClick={handleAddSubject}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Add Subject
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Grades'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
