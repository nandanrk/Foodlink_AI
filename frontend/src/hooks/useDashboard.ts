import { useState, useEffect } from 'react';
import { restaurantAPI, ngoAPI, volunteerAPI } from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useDashboard() {
  const { role } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    const fetchFn =
      role === 'restaurant' ? restaurantAPI.getDashboard :
      role === 'ngo' ? ngoAPI.getDashboard :
      volunteerAPI.getDashboard;

    fetchFn()
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [role]);

  return { stats, loading, error };
}
