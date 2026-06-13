import api from './axios';

export const fetchTickets = async (params = {}) => {
  const { data } = await api.get('/tickets', { params });
  return data;
};

export const fetchTicket = async (id) => {
  const { data } = await api.get(`/tickets/${id}`);
  return data.data;
};

export const createTicket = async (payload) => {
  const { data } = await api.post('/tickets', payload);
  return data.data;
};

export const updateTicket = async (id, payload) => {
  const { data } = await api.put(`/tickets/${id}`, payload);
  return data.data;
};

export const updateTicketStatus = async (id, status) => {
  const { data } = await api.patch(`/tickets/${id}/status`, { status });
  return data.data;
};

export const assignTicket = async (id, assignedTo) => {
  const { data } = await api.patch(`/tickets/${id}/assign`, {
    assigned_to: assignedTo,
  });
  return data.data;
};
