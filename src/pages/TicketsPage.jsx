import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TicketListCard from '../components/tickets/TicketListCard';
import SlaBadge from '../components/tickets/SlaBadge';
import TicketStatusBadge from '../components/tickets/TicketStatusBadge';
import { fetchTickets } from '../api/tickets';
import { fetchOrganizations } from '../api/organizations';
import { useAuth } from '../context/AuthContext';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  SLA_STATUSES,
  priorityLabel,
} from '../utils/constants';
import {
  btnPrimary,
  btnSecondary,
  cardClass,
  fieldClass,
  linkClass,
  mutedTextClass,
  pageTitleClass,
} from '../utils/ui';

export default function TicketsPage() {
  const { isAgent } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sla_status: '',
    organization_id: '',
  });

  const params = useMemo(() => {
    const payload = { per_page: 20 };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) payload[key] = value;
    });
    return payload;
  }, [filters]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => fetchTickets(params),
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    enabled: isAgent,
  });

  const tickets = data?.data ?? [];

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={pageTitleClass}>Tickets</h1>
          <p className={`mt-1 ${mutedTextClass}`}>Search and filter support requests.</p>
        </div>
        <Link to="/tickets/new" className={`${btnPrimary} w-full sm:w-auto`}>
          New Ticket
        </Link>
      </div>

      <section className={`${cardClass} mb-6`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <input
            type="search"
            className={fieldClass}
            placeholder="Search subject or description"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
          <select
            className={fieldClass}
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All statuses</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <select
            className={fieldClass}
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
          >
            <option value="">All priorities</option>
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
          <select
            className={fieldClass}
            value={filters.sla_status}
            onChange={(e) => setFilters((prev) => ({ ...prev, sla_status: e.target.value }))}
          >
            <option value="">All SLA states</option>
            {SLA_STATUSES.map((sla) => (
              <option key={sla.value} value={sla.value}>{sla.label}</option>
            ))}
          </select>
          {isAgent && (
            <select
              className={fieldClass}
              value={filters.organization_id}
              onChange={(e) => setFilters((prev) => ({ ...prev, organization_id: e.target.value }))}
            >
              <option value="">All organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            className={`${btnSecondary} w-full sm:col-span-2 lg:col-span-1`}
            onClick={() => refetch()}
          >
            Apply Filters
          </button>
        </div>
      </section>

      <section className={cardClass}>
        {isLoading ? (
          <p className={mutedTextClass}>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className={mutedTextClass}>No tickets match your filters.</p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {tickets.map((ticket) => (
                <TicketListCard key={ticket.id} ticket={ticket} isAgent={isAgent} />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">SLA</th>
                    {isAgent && <th className="px-3 py-3">Organization</th>}
                    {isAgent && <th className="px-3 py-3">Assignee</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 text-slate-500">#{ticket.id}</td>
                      <td className="px-3 py-3">
                        <Link to={`/tickets/${ticket.id}`} className={linkClass}>
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="px-3 py-3"><TicketStatusBadge status={ticket.status} /></td>
                      <td className="px-3 py-3 text-slate-700">{priorityLabel(ticket.priority)}</td>
                      <td className="px-3 py-3"><SlaBadge status={ticket.sla_status} /></td>
                      {isAgent && (
                        <td className="px-3 py-3 text-slate-700">{ticket.organization?.name}</td>
                      )}
                      {isAgent && (
                        <td className="px-3 py-3 text-slate-700">
                          {ticket.assignee?.name ?? 'Unassigned'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </AppLayout>
  );
}
