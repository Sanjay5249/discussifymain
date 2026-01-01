import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token and handle FormData
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If sending FormData, let the browser set the Content-Type with proper boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (formData) => api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    login: (credentials) => api.post('/auth/login', credentials),
    verifyEmail: (data) => api.post('/auth/verify-email', data),
    resendOTP: (data) => api.post('/auth/resend-otp', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (formData) => api.patch('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Community API
export const communityAPI = {
    getMyCommunities: () => api.get('/communities/my-communities'),
    getPopular: () => api.get('/communities/popular'),
    getRecommended: () => api.get('/communities/recommended'),
    getDiscoverable: (userId) => api.get(`/communities/discover/${userId}`),
    getOne: (idOrSlug) => api.get(`/communities/${idOrSlug}`),
    getDiscussions: (idOrSlug) => api.get(`/communities/${idOrSlug}/discussions`),
    create: (formData) => api.post('/communities/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (idOrSlug, formData) => api.patch(`/communities/${idOrSlug}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    join: (idOrSlug) => api.post(`/communities/${idOrSlug}/join`),
    leave: (idOrSlug) => api.post(`/communities/${idOrSlug}/leave`),
    invite: (idOrSlug, data) => api.post(`/communities/${idOrSlug}/invite`, data),
};

// Post API
export const postAPI = {
    getCommunityPosts: (communityId) => api.get(`/posts/community/${communityId}`),
    create: (formData) => api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    vote: (postId) => api.put(`/posts/${postId}/vote`),
    reply: (postId, data) => api.post(`/posts/${postId}/reply`, data),
    getComments: (postId) => api.get(`/posts/${postId}/comments`),
};

// Admin API
export const adminAPI = {
    getAnalytics: () => api.get('/admin/analytics'),
    getActivityFeed: () => api.get('/admin/activity-feed'),
    getAllCommunities: () => api.get('/admin/communities'),
    getCommunityPosts: (communityId) => api.get(`/admin/communities/${communityId}/posts`),
    updateCommunity: (communityId, data) => api.patch(`/admin/communities/${communityId}`, data),
    deleteCommunity: (communityId) => api.delete(`/admin/communities/${communityId}`),
    getAllUsers: () => api.get('/admin/users'),
    updateUser: (userId, data) => api.patch(`/admin/users/${userId}`, data),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    deletePost: (postId) => api.delete(`/admin/posts/${postId}`),
    editPost: (postId, data) => api.put(`/admin/posts/${postId}/edit`, data),
    reportPost: (postId, data) => api.put(`/admin/posts/${postId}/report`, data),
    resolveReports: (postId) => api.put(`/admin/posts/${postId}/reports/resolve`),
};

// Notification API
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/mark-all-read'),
    delete: (id) => api.delete(`/notifications/${id}`),
    clearAll: () => api.delete('/notifications'),
};

export default api;
