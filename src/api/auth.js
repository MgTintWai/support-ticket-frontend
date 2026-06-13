import api from './axios';
import { setToken, clearToken } from '../utils/storage';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  setToken(data.data.token);
  return data.data.user;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    clearToken();
  }
};

export const fetchMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.data;
};
