import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import toast from 'react-hot-toast';

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
      toast.error('Error loading statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshStats = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};

export default useDashboard;
