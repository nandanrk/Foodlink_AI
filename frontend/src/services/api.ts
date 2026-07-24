import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Attach Supabase token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response error handler
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { email: string; password: string; role: string; name: string }) =>
    api.post('/auth/register', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  getProfile: () => api.get('/auth/profile'),
};

// ── Restaurant ────────────────────────────────────────────────────
export const restaurantAPI = {
  getProfile: () => api.get('/restaurants/profile'),
  updateProfile: (data: any) => api.put('/restaurants/profile', data),
  getDashboard: () => api.get('/restaurants/dashboard'),
};

// ── NGO ───────────────────────────────────────────────────────────
export const ngoAPI = {
  getProfile: () => api.get('/ngos/profile'),
  updateProfile: (data: any) => api.put('/ngos/profile', data),
  getNearbyDonations: (params?: any) => api.get('/ngos/nearby-donations', { params }),
  acceptDonation: (donationId: string) => api.post(`/ngos/accept/${donationId}`),
  getDashboard: () => api.get('/ngos/dashboard'),
};

// ── Volunteer ─────────────────────────────────────────────────────
export const volunteerAPI = {
  getProfile: () => api.get('/volunteers/profile'),
  updateProfile: (data: any) => api.put('/volunteers/profile', data),
  getAssignments: () => api.get('/volunteers/assignments'),
  updateAssignment: (assignmentId: string, data: any) => api.put(`/volunteers/assignments/${assignmentId}`, data),
  getDashboard: () => api.get('/volunteers/dashboard'),
};

// ── Donations ─────────────────────────────────────────────────────
export const donationAPI = {
  create: (data: any) => api.post('/donations', data),
  getAll: (params?: any) => api.get('/donations', { params }),
  getById: (id: string) => api.get(`/donations/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/donations/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Notifications ─────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

// ── Certificates ──────────────────────────────────────────────────
export const certificateAPI = {
  getAll: () => api.get('/certificates'),
  getById: (id: string) => api.get(`/certificates/${id}`),
};

// ── AI ────────────────────────────────────────────────────────────
export const aiAPI = {
  generateDescription: (data: any) => api.post('/ai/generate-description', data),
  generateShelfLife: (data: any) => api.post('/ai/shelf-life', data),
  chat: (message: string, context?: any) => api.post('/ai/chat', { message, context }),
};

// ── Maps ──────────────────────────────────────────────────────────
export const mapsAPI = {
  getRoute: (params: any) => api.get('/maps/route', { params }),
  getNearbyNGOs: (params: any) => api.get('/maps/nearby-ngos', { params }),
  getNearbyVolunteers: (params: any) => api.get('/maps/nearby-volunteers', { params }),
};

// ── Analytics ─────────────────────────────────────────────────────
export const analyticsAPI = {
  getPlatformStats: () => api.get('/analytics/platform'),
};
