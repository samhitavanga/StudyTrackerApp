'use client';

import { useState, useEffect } from 'react';
import { createLocalDate, formatDateForDisplay } from '../../src/app/utils/dateUtils';

// Sample test dates
const testDates = [
  '2025-03-14T00:00:00.000Z',
  '2025-03-15T00:00:00.000Z'
];

export default function TestDatePage() {
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    setCurrentDate(new Date().toISOString());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-purple-900 mb-6">Date Handling Test Page</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-purple-300">
        <h2 className="text-xl font-bold text-purple-900 mb-4">Current Date Information</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {JSON.stringify({
            browserDate: new Date().toISOString(),
            formattedDate: new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-purple-300">
        <h2 className="text-xl font-bold text-purple-900 mb-4">Date Utility Tests</h2>
        <div className="space-y-6">
          {testDates.map((date, index) => (
            <div key={index} className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-900 mb-2">Test Date {index + 1}: {date}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-md shadow">
                  <h4 className="font-semibold text-purple-800">Original Input</h4>
                  <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">{date}</pre>
                </div>
                <div className="bg-white p-4 rounded-md shadow">
                  <h4 className="font-semibold text-purple-800">createLocalDate Result</h4>
                  <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                    {createLocalDate(date).toISOString()}
                  </pre>
                </div>
                <div className="bg-white p-4 rounded-md shadow">
                  <h4 className="font-semibold text-purple-800">formatDateForDisplay (short)</h4>
                  <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                    {formatDateForDisplay(date, 'short')}
                  </pre>
                </div>
                <div className="bg-white p-4 rounded-md shadow">
                  <h4 className="font-semibold text-purple-800">formatDateForDisplay (long)</h4>
                  <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                    {formatDateForDisplay(date, 'long')}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-300">
        <h2 className="text-xl font-bold text-purple-900 mb-4">March 14th Test</h2>
        <p className="mb-4 text-purple-900">
          This section shows how the date for March 14, 2025 will be displayed in the chart.
          After our fix, it should correctly show as March 14, not March 13.
        </p>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-bold text-purple-900 mb-2">March 14, 2025</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md shadow">
              <h4 className="font-semibold text-purple-800">Original Format</h4>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">2025-03-14T00:00:00.000Z</pre>
            </div>
            <div className="bg-white p-4 rounded-md shadow">
              <h4 className="font-semibold text-purple-800">Display Format (Chart Label)</h4>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                {formatDateForDisplay('2025-03-14T00:00:00.000Z', 'short')}
              </pre>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <a href="/" className="px-6 py-3 bg-purple-700 text-white font-bold rounded-md hover:bg-purple-800 inline-block">
          Back to Home
        </a>
      </div>
    </div>
  );
}
