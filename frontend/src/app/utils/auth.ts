// Authentication utility functions
import cookies from 'js-cookie';

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// Cookie options
const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
};

/**
 * Login user using Strapi authentication
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    console.log('Using Strapi URL for login:', strapiUrl);
    
    const response = await fetch(`${strapiUrl}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Login response error:', data);
      throw new Error(data.error?.message || 'Login failed. Please check your credentials and try again.');
    }
    
    // Store authentication data in cookies and localStorage
    cookies.set('token', data.jwt, COOKIE_OPTIONS);
    cookies.set('user', JSON.stringify(data.user), COOKIE_OPTIONS);
    
    // Also store in localStorage as fallback
    localStorage.setItem('token', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('isLoggedIn', 'true');

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Register a new user
 */
export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
  try {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    console.log('Using Strapi URL for registration:', strapiUrl);
    
    const response = await fetch(`${strapiUrl}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Registration response error:', data);
      throw new Error(data.error?.message || 'Registration failed. Please try again with different credentials.');
    }
    
    // Store authentication data in cookies and localStorage
    cookies.set('token', data.jwt, COOKIE_OPTIONS);
    cookies.set('user', JSON.stringify(data.user), COOKIE_OPTIONS);
    
    // Also store in localStorage as fallback
    localStorage.setItem('token', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('isLoggedIn', 'true');

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Logout user
 */
export function logoutUser(): void {
  // Remove from cookies
  cookies.remove('token');
  cookies.remove('user');
  
  // Remove from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check cookies first, then localStorage as fallback
  const token = cookies.get('token') || localStorage.getItem('token');
  return !!token;
}

/**
 * Get current user
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Try to get from cookies first
  const userStr = cookies.get('user') || localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

/**
 * Get authentication token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Try to get from cookies first
  return cookies.get('token') || localStorage.getItem('token');
}
