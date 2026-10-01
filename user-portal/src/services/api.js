import axios from 'axios';

export const BASE_URL = 'http://localhost:5000';
export const API_BASE_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/users/me'),
};

export const userAPI = {
    updateProfile: (profileData) => api.patch('/users/me', profileData),
    changePassword: (passwordData) => api.post('/users/change-password', passwordData),
};

export const requestAPI = {
    create: (formData) => api.post('/requests', formData),
    getMyRequests: () => api.get('/requests/my'),
    getById: (id) => api.get(`/requests/${id}`),
    updateAction: (id, actionType) => api.post(`/requests/${id}/${actionType}`),
    negotiate: (id, message) => api.post(`/requests/${id}/negotiate`, { message }),
};

export const categoryAPI = {
    getActive: () => api.get('/categories?active=true'),
    getById: (id) => api.get(`/categories/${id}`),
};

export default api;
