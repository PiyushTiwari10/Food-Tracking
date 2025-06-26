import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG, getAuthHeaders} from '../config/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  error => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      try {
        await AsyncStorage.removeItem('userToken');
      } catch (e) {
        console.error('Error removing token:', e);
      }
    }
    return Promise.reject(error);
  },
);

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.REGISTER, {
      email,
      password,
      name,
    });
    return response.data;
  },

  verifyToken: async (token: string) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.VERIFY_TOKEN, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  },
};

export default api; 