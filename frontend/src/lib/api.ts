import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach access token from store on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const { accessToken } = res.data;
        if (accessToken) {
          const { user, setUser } = useAuthStore.getState();
          if (user) setUser(user, accessToken);
        }
        return api(original);
      } catch {
        useAuthStore.getState().clearUser();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  register:      (data: unknown) => api.post('/auth/register', data),
  confirmEmail:  (data: unknown) => api.post('/auth/confirm-email', data),
  resendCode:    (email: string) => api.post('/auth/resend-code', { email }),
  login:         (data: unknown) => api.post('/auth/login', data),
  logout:        ()              => api.post('/auth/logout'),
  me:            ()              => api.get('/auth/me'),
  forgotPassword:(email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: unknown) => api.post('/auth/reset-password', data),
};

export const issueApi = {
  list:         (params?: Record<string, unknown>) => api.get('/issues', { params }),
  nearby:       (lng: number, lat: number, radius = 50) =>
                  api.get('/issues/nearby', { params: { lng, lat, radius } }),
  get:          (id: string) => api.get(`/issues/${id}`),
  create:       (data: unknown) => api.post('/issues', data),
  update:       (id: string, data: unknown) => api.patch(`/issues/${id}`, data),
  delete:       (id: string) => api.delete(`/issues/${id}`),
  updateStatus: (id: string, data: unknown) => api.patch(`/issues/${id}/status`, data),
  upvote:       (id: string) => api.post(`/issues/${id}/upvote`),
  follow:       (id: string) => api.post(`/issues/${id}/follow`),
  addComment:   (id: string, text: string) => api.post(`/issues/${id}/comments`, { text }),
  getComments:  (id: string) => api.get(`/issues/${id}/comments`),
};

export const analyticsApi = {
  public: () => api.get('/analytics/public'),
  admin:  () => api.get('/analytics/admin'),
};

export const uploadApi = {
  presignedUrl: (filename: string, contentType: string) =>
    api.post('/uploads/presigned-url', { filename, contentType }),
};

export const adminApi = {
  listUsers:        (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  updateUser:       (id: string, data: unknown)        => api.patch(`/admin/users/${id}`, data),
  listDepartments:  ()                                  => api.get('/admin/departments'),
  createDepartment: (name: string)                      => api.post('/admin/departments', { name }),
  updateDepartment: (id: string, name: string)          => api.patch(`/admin/departments/${id}`, { name }),
  listCategories:   ()                                  => api.get('/admin/categories'),
  createCategory:   (d: unknown)                        => api.post('/admin/categories', d),
  updateCategory:   (id: string, d: unknown)            => api.patch(`/admin/categories/${id}`, d),
  listAuditLogs:    (params?: Record<string, unknown>)  => api.get('/admin/audit-logs', { params }),
};
