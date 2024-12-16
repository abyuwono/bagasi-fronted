import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: getAuthHeaders(),
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const auth = {
  login: async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me', {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Check auth error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Payment functions
export const payments = {
  createPaymentIntent: async (amount: number) => {
    try {
      const response = await api.post('/payments/create-payment-intent', { amount });
      return response.data;
    } catch (error: any) {
      console.error('Create payment intent error:', error.response?.data || error.message);
      throw error;
    }
  },
  confirmPayment: async (paymentIntentId: string) => {
    try {
      const response = await api.post('/payments/confirm', { paymentIntentId });
      return response.data;
    } catch (error: any) {
      console.error('Confirm payment error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Ads functions
export const ads = {
  getAll: async () => {
    const response = await api.get('/ads');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/ads/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/ads', data);
    return response.data;
  },
  book: async (id: string, data: any) => {
    const response = await api.post(`/ads/${id}/book`, data);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/ads/${id}/status`, { status });
    return response.data;
  },
};

// Profile functions
export const profile = {
  getProfile: async (userId: string) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },
  addReview: async (userId: string, data: { rating: number; comment: string }) => {
    const response = await api.post(`/profile/${userId}/reviews`, data);
    return response.data;
  }
};

// Admin API functions
export const adminApi = {
  // Auth
  getAuthOptions: () => axios.post('/api/admin/auth/generate-auth-options').then(res => res.data),
  verifyAuth: (credential: any) => axios.post('/api/admin/auth/verify', { credential }).then(res => res.data),
  
  // Users
  getUsers: () => axios.get('/api/admin/users').then(res => res.data),
  updateUserStatus: (userId: string, status: { active?: boolean; verified?: boolean }) => 
    axios.patch(`/api/admin/users/${userId}/status`, status).then(res => res.data),
  updateUserWhatsapp: (userId: string, whatsapp: string) => 
    axios.patch(`/api/admin/users/${userId}/whatsapp`, { whatsapp }).then(res => res.data),
  
  // Ads
  getAds: () => axios.get('/api/admin/ads').then(res => res.data),
  updateAdStatus: (adId: string, active: boolean) => 
    axios.patch(`/api/admin/ads/${adId}/status`, { active }).then(res => res.data),
  createAd: (adData: any) => axios.post('/api/admin/ads', adData).then(res => res.data),
};

export default api;
