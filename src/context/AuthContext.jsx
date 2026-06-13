import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '../api/auth';
import { getToken } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const token = getToken();

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: Boolean(token),
    retry: false,
  });

  const value = useMemo(
    () => ({
      user: user ?? null,
      isLoading: Boolean(token) && isLoading,
      isAgent: user?.role === 'support_agent',
      isClient: user?.role === 'client',
      refetchUser: refetch,
    }),
    [user, isLoading, token, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
