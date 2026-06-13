import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import AppLayout from '../components/layout/AppLayout';
import { createTicket } from '../api/tickets';
import { fetchOrganizations } from '../api/organizations';
import { useAuth } from '../context/AuthContext';
import { TICKET_PRIORITIES } from '../utils/constants';
import {
  btnPrimary,
  cardClass,
  inputClass,
  labelClass,
  mutedTextClass,
  pageTitleClass,
  selectClass,
} from '../utils/ui';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { isAgent } = useAuth();
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    organization_id: '',
  });
  const [error, setError] = useState('');

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    enabled: isAgent,
  });

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => navigate(`/tickets/${ticket.id}`),
    onError: (err) => {
      setError(err.response?.data?.message || 'Unable to create ticket.');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      subject: form.subject,
      description: form.description,
      priority: form.priority,
    };

    if (isAgent) {
      payload.organization_id = Number(form.organization_id);
    }

    mutation.mutate(payload);
  };

  return (
    <AppLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className={pageTitleClass}>Create Ticket</h1>
        <p className={`mt-1 ${mutedTextClass}`}>Submit a new support request.</p>
      </div>

      <form className={`${cardClass} max-w-2xl`} onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isAgent && (
            <label className={labelClass}>
              Organization
              <select
                className={selectClass}
                value={form.organization_id}
                onChange={(e) => setForm((prev) => ({ ...prev, organization_id: e.target.value }))}
                required
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </label>
          )}

          <label className={labelClass}>
            Subject
            <input
              type="text"
              className={inputClass}
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              required
            />
          </label>

          <label className={labelClass}>
            Description
            <textarea
              rows={6}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </label>

          <label className={labelClass}>
            Priority
            <select
              className={selectClass}
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
            >
              {TICKET_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          className={`${btnPrimary} mt-6 w-full sm:w-auto`}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </AppLayout>
  );
}
