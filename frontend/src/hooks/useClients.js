import { useState, useEffect, useCallback } from 'react';
import clientService from '../services/clientService';
import toast from 'react-hot-toast';

export const useClients = (initialParams = {}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'dataExpirareItp',
    sortOrder: 'asc',
    activ: 'true',
    ...initialParams,
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await clientService.getClients(params);
      setClients(response.clients);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
      toast.error('Error loading clients');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const refreshClients = () => {
    fetchClients();
  };

  const setPage = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const setSearch = (search) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const setSort = (sortBy, sortOrder) => {
    setParams((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const deleteClient = async (id) => {
    try {
      await clientService.deleteClient(id);
      toast.success('Client deleted successfully');
      refreshClients();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return {
    clients,
    loading,
    error,
    pagination,
    params,
    setPage,
    setSearch,
    setSort,
    refreshClients,
    deleteClient,
  };
};

export default useClients;
