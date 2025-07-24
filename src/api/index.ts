import axios from 'axios';
import { useMessage } from 'naive-ui';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器
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
  },
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = useMessage();

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      message.error('服务器错误，请稍后重试');
    }

    return Promise.reject(error);
  },
);

// API 接口定义
export const authAPI = {
  login: (data: { username: string; password: string }) => api.post('/auth/login', data),
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getInfo: () => api.get('/user/info'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.put('/user/password', data),
  resetAccessKey: () => api.post('/user/reset-access-key'),
  realNameVerification: (data: { realName: string; idCard: string }) =>
    api.post('/user/real-name-verification', data),
  signIn: () => api.post('/user/sign-in'),
};

export const tunnelAPI = {
  list: () => api.get('/tunnels'),
  create: (data: any) => api.post('/tunnels', data),
  update: (id: number, data: any) => api.put(`/tunnels/${id}`, data),
  delete: (id: number) => api.delete(`/tunnels/${id}`),
  getConfig: (id: number) => api.get(`/tunnels/${id}/config`),
  getStatus: (id: number) => api.get(`/tunnels/${id}/status`),
};

export const nodeAPI = {
  list: () => api.get('/nodes'),
  getStatus: () => api.get('/nodes/status'),
};

export const adminAPI = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  banUser: (id: number) => api.post(`/admin/users/${id}/ban`),
  unbanUser: (id: number) => api.post(`/admin/users/${id}/unban`),

  getTunnels: (params?: any) => api.get('/admin/tunnels', { params }),
  deleteTunnel: (id: number) => api.delete(`/admin/tunnels/${id}`),

  getNodes: () => api.get('/admin/nodes'),
  createNode: (data: any) => api.post('/admin/nodes', data),
  updateNode: (id: number, data: any) => api.put(`/admin/nodes/${id}`, data),
  deleteNode: (id: number) => api.delete(`/admin/nodes/${id}`),

  getVerifications: () => api.get('/admin/verifications'),
};
