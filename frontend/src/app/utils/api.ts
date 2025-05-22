import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in the requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchDailyGrades = async () => {
  try {
    const response = await axiosInstance.get('/daily-grades?sort=date:desc&populate=*');
    return response.data;
  } catch (error) {
    console.error('Error fetching daily grades:', error);
    throw error;
  }
};

export const createDailyGrade = async (data: any) => {
  try {
    const response = await axiosInstance.post('/daily-grades', { data });
    return response.data;
  } catch (error) {
    console.error('Error creating daily grade:', error);
    throw error;
  }
};

export const updateDailyGrade = async (id: number, data: any) => {
  try {
    const response = await axiosInstance.put(`/daily-grades/${id}`, { data });
    return response.data;
  } catch (error) {
    console.error(`Error updating daily grade ${id}:`, error);
    throw error;
  }
};

export const deleteDailyGrade = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/daily-grades/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting daily grade ${id}:`, error);
    throw error;
  }
};
