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
  createAdPostingIntent: async () => {
    const response = await api.post('/payments/create-payment-intent', {
      type: 'ad_posting'
    });
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

export default api;
