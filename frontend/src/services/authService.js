import api from './api';

export const authService = {
  /**
   * User login
   */
  async login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  /**
   * User logout
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Register new user (admin only)
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get user from localStorage
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is admin
   */
  isAdmin() {
    const user = this.getUser();
    return user?.rol === 'admin';
  },
};

export default authService;
