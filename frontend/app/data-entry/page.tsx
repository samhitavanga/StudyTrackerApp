'use client';

import { useState } from 'react';

interface StudentData {
  date: string;
  gpa: number;
  attendance: boolean;
  subjects: {
    name: string;
    grade: number;
  }[];
  notes: string;
}

export default function DataEntryPage() {
  const [formData, setFormData] = useState<StudentData>({
    date: new Date().toISOString().split('T')[0],
    gpa: 0,
    attendance: true,
    subjects: [{ name: '', grade: 0 }],
    notes: '',
  });

  const handleSubjectChange = (index: number, field: 'name' | 'grade', value: string | number) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = {
      ...newSubjects[index],
      [field]: value,
    };
    setFormData({ ...formData, subjects: newSubjects });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { name: '', grade: 0 }],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API endpoint when Strapi is integrated
      console.log('Submitting data:', formData);
    } catch (error) {
      console.error('Failed to submit data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-8">Daily Student Data Entry</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">GPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Attendance</label>
            <input
              type="checkbox"
              checked={formData.attendance}
              onChange={(e) => setFormData({ ...formData, attendance: e.target.checked })}
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Subjects</label>
            {formData.subjects.map((subject, index) => (
              <div key={index} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Subject name"
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Grade"
                  value={subject.grade}
                  onChange={(e) => handleSubjectChange(index, 'grade', parseInt(e.target.value))}
                  className="w-24 border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addSubject}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Add Subject
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Data
          </button>
        </form>
      </div>
    </div>
  );
}
