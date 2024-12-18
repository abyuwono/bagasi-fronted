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
export const login = async ({ email, password }: { email: string; password: string }) => {
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
};

export const checkAuth = async () => {
  try {
    const response = await api.get('/auth/me', {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    console.error('Check auth error:', error.response?.data || error.message);
    throw error;
  }
};

// Payment functions
export const createPaymentIntent = async (amount: number) => {
  try {
    const response = await api.post('/payments/create-payment-intent', { amount });
    return response.data;
  } catch (error: any) {
    console.error('Create payment intent error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMembershipPrice = async (duration: number) => {
  try {
    const response = await api.get(`/payments/membership/price/${duration}`);
    return response.data;
  } catch (error: any) {
    console.error('Get membership price error:', error.response?.data || error.message);
    throw error;
  }
};

export const createAdPostingIntent = async () => {
  try {
    const response = await api.post('/payments/ad/create-intent');
    return response.data;
  } catch (error: any) {
    console.error('Create ad posting intent error:', error.response?.data || error.message);
    throw error;
  }
};

export const createMembershipIntent = async (duration: number) => {
  try {
    const response = await api.post('/payments/membership/create-intent', { duration });
    return response.data;
  } catch (error: any) {
    console.error('Create membership intent error:', error.response?.data || error.message);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId: string) => {
  try {
    const response = await api.post('/payments/confirm', { paymentIntentId });
    return response.data;
  } catch (error: any) {
    console.error('Confirm payment error:', error.response?.data || error.message);
    throw error;
  }
};

// Ads functions
export const getAds = async () => {
  const response = await api.get('/ads');
  return response.data;
};

export const getAd = async (id: string) => {
  const response = await api.get(`/ads/${id}`);
  return response.data;
};

export const createAd = async (data: any) => {
  const response = await api.post('/ads', data);
  return response.data;
};

export const bookAd = async (adId: string, data: { weight: number }) => {
  try {
    const response = await api.post(`/ads/${adId}/book`, data);
    return response.data;
  } catch (error: any) {
    console.error('Book ad error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateAdStatus = async (id: string, status: string) => {
  try {
    const response = await api.patch(`/ads/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    console.error('Update ad status error:', error.response?.data || error.message);
    throw error;
  }
};

// Profile functions
export const getProfile = async (userId: string) => {
  const response = await api.get(`/profile/${userId}`);
  return response.data;
};

export const updateProfile = async (userId: string, data: any) => {
  const response = await api.put(`/profile/${userId}`, data);
  return response.data;
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
