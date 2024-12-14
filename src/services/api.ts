import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle 401 errors silently
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && error.config?.url === '/auth/me') {
      // Silently handle 401 for /auth/me endpoint
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Add authentication token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RegisterData {
  email: string;
  password: string;
  whatsappNumber: string;
  role: 'traveler' | 'shopper';
}

interface LoginData {
  email: string;
  password: string;
}

export const auth = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  getProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

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

export const payments = {
  createPaymentIntent: async (amount: number) => {
    const response = await api.post('/payments/create-payment-intent', { amount });
    return response.data;
  },
  createAdPostingIntent: async () => {
    const response = await api.post('/payments/create-ad-posting-intent');
    return response.data;
  },
  createMembershipIntent: async (duration: number) => {
    const response = await api.post('/payments/create-membership-intent', { duration });
    return response.data;
  },
  getMembershipPrice: async () => {
    const response = await api.get('/payments/membership-price');
    return response.data;
  },
};

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
