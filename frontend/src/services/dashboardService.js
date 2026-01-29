import api from './api';

export const dashboardService = {
  /**
   * Get statistics for dashboard
   */
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
