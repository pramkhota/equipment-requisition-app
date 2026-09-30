import axios from 'axios';

// Create a configured Axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach mock user ID for testing
api.interceptors.request.use((config) => {
  // Normally this would come from a real Auth context/token
  // We use localStorage to mock switching between Employee and Approver
  if (typeof window !== 'undefined') {
    const mockUserId = localStorage.getItem('MOCK_USER_ID') || 'employee-123';
    config.headers['X-User-Id'] = mockUserId;
  }
  return config;
});
