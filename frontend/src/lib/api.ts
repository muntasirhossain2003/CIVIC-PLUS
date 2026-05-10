import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        return api(original);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export const issueApi = {
  list: (params?: Record<string, unknown>) => api.get('/issues', { params }),
  nearby: (lng: number, lat: number, radius = 50) =>
    api.get('/issues/nearby', { params: { lng, lat, radius } }),
  get: (id: string) => api.get(`/issues/${id}`),
  create: (data: unknown) => api.post('/issues', data),
  updateStatus: (id: string, data: unknown) => api.patch(`/issues/${id}/status`, data),
  upvote: (id: string) => api.post(`/issues/${id}/upvote`),
  follow: (id: string) => api.post(`/issues/${id}/follow`),
  addComment: (id: string, text: string) => api.post(`/issues/${id}/comments`, { text }),
};

export const authApi = {
  register: (data: unknown) => api.post('/auth/register', data),
  login: (data: unknown) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
};

export const analyticsApi = {
  public: () => api.get('/analytics/public'),
  admin: () => api.get('/analytics/admin'),
};

export const uploadApi = {
  presignedUrl: (filename: string, contentType: string) =>
    api.post('/uploads/presigned-url', { filename, contentType }),
};
