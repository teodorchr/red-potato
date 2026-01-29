import api from './api';

export const clientService = {
  /**
   * Get list of all clients
   */
  async getClients(params = {}) {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  /**
   * Get a client by ID
   */
  async getClientById(id) {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  /**
   * Create a new client
   */
  async createClient(clientData) {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  /**
   * Update a client
   */
  async updateClient(id, clientData) {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  /**
   * Delete a client
   */
  async deleteClient(id) {
    const response = await api.delete(`/clients/${id}`);
    return response;
  },

  /**
   * Get clients with ITP expiring soon
   */
  async getExpiringClients(days = 7) {
    const response = await api.get('/clients/expiring', {
      params: { days },
    });
    return response.data;
  },
};

export default clientService;
