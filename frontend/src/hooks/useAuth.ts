import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiClient.getCurrentUser();
        setUser(response.data);
      } catch (err) {
        setError('Failed to load user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await apiClient.login(email, password);
      const userResponse = await apiClient.getCurrentUser();
      setUser(userResponse.data);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
