import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe } from '../api/auth';
import { clearToken, getToken, setToken as persistToken } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => getToken());

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: fetchMe,
    enabled: Boolean(token),
    retry: false,
  });

  const establishSession = useCallback((newToken, sessionUser) => {
    persistToken(newToken);
    setToken(newToken);
    queryClient.setQueryData(['auth', 'me', newToken], sessionUser);
    queryClient.removeQueries({ queryKey: ['tickets'] });
  }, [queryClient]);

  const clearSession = useCallback(() => {
    clearToken();
    setToken(null);
    queryClient.removeQueries({ queryKey: ['auth'] });
    queryClient.removeQueries({ queryKey: ['tickets'] });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      token,
      user: user ?? null,
      isLoading: Boolean(token) && isLoading,
      isAgent: user?.role === 'support_agent',
      isClient: user?.role === 'client',
      establishSession,
      clearSession,
      refetchUser: refetch,
    }),
    [token, user, isLoading, establishSession, clearSession, refetch],
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
