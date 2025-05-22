'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { createDailyGrade } from '../utils/api';

interface DailyGradeFormProps {
  onSuccess?: () => void;
}

interface FormValues {
  date: string;
  period1: number;
  period2: number;
  period3: number;
  period4: number;
  period5: number;
  period6: number;
  period7: number;
  notes: string;
}

const DailyGradeForm: React.FC<DailyGradeFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      period1: 0,
      period2: 0,
      period3: 0,
      period4: 0,
      period5: 0,
      period6: 0,
      period7: 0,
      notes: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse the date from the form
      const [year, month, day] = data.date.split('-').map(Number);
      
      // Create a date in UTC to avoid timezone issues
      const utcDate = new Date(Date.UTC(year, month - 1, day));
      
      // Format the date as YYYY-MM-DD
      const formattedDate = utcDate.toISOString().split('T')[0];
      
      console.log('Date handling debug:', {
        inputDate: data.date,
        parsedParts: { year, month, day },
        utcDate: utcDate.toISOString(),
        formattedDate: formattedDate,
        currentTimestamp: new Date().toISOString()
      });
      
      await createDailyGrade({
        ...data,
        date: formattedDate,
        period1: Number(data.period1),
        period2: Number(data.period2),
        period3: Number(data.period3),
        period4: Number(data.period4),
        period5: Number(data.period5),
        period6: Number(data.period6),
        period7: Number(data.period7),
      });
      
      setSuccess('Daily grades successfully logged!');
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        period1: 0,
        period2: 0,
        period3: 0,
        period4: 0,
        period5: 0,
        period6: 0,
        period7: 0,
        notes: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to log daily grades. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Log Daily Grades</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            type="date"
            id="date"
            {...register('date', { required: 'Date is required' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6, 7].map((period) => (
            <div key={period}>
              <label htmlFor={`period${period}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Period {period} Grade
              </label>
              <input
                type="number"
                id={`period${period}`}
                min="0"
                max="100"
                step="0.01"
                {...register(`period${period}` as keyof FormValues, { 
                  required: `Period ${period} grade is required`,
                  min: { value: 0, message: 'Grade must be at least 0' },
                  max: { value: 100, message: 'Grade must be at most 100' },
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors[`period${period}` as keyof FormValues] && (
                <p className="mt-1 text-sm text-red-600">{errors[`period${period}` as keyof FormValues]?.message}</p>
              )}
            </div>
          ))}
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-3 px-6 border border-transparent shadow-lg text-base font-bold rounded-md text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors duration-200"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DailyGradeForm;
