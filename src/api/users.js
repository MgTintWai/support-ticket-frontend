import api from './axios';

export const fetchAgents = async () => {
  const { data } = await api.get('/users/agents');
  return data.data;
};
