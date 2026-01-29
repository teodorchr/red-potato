import api from './api';

export const notificationService = {
  /**
   * Get list of notifications
   */
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Send test notification
   */
  async sendTestNotification(clientId, tip) {
    const response = await api.post('/notifications/test', { clientId, tip });
    return response;
  },

  /**
   * Get notification statistics
   */
  async getStats() {
    const response = await api.get('/notifications/stats');
    return response.data;
  },

  /**
   * Get a client's notifications
   */
  async getClientNotifications(clientId) {
    const response = await api.get(`/notifications/client/${clientId}`);
    return response.data;
  },

  /**
   * Retry notification
   */
  async retryNotification(notificationId) {
    const response = await api.post(`/notifications/${notificationId}/retry`);
    return response;
  },
};

export default notificationService;
