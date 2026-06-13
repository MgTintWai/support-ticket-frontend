import api from './axios';

export const fetchComments = async (ticketId) => {
  const { data } = await api.get(`/tickets/${ticketId}/comments`);
  return data.data;
};

export const createComment = async (ticketId, payload) => {
  const { data } = await api.post(`/tickets/${ticketId}/comments`, payload);
  return data.data;
};
