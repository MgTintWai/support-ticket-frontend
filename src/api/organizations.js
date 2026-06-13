import api from './axios';

export const fetchOrganizations = async () => {
  const { data } = await api.get('/organizations');
  return data.data;
};
