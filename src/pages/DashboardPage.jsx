import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TicketListCard from '../components/tickets/TicketListCard';
import SlaBadge from '../components/tickets/SlaBadge';
import TicketStatusBadge from '../components/tickets/TicketStatusBadge';
import { fetchTickets } from '../api/tickets';
import { useAuth } from '../context/AuthContext';
import { priorityLabel } from '../utils/constants';
import { btnPrimary, cardClass, linkClass, mutedTextClass, pageTitleClass } from '../utils/ui';

export default function DashboardPage() {
  const { isAgent } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', 'dashboard'],
    queryFn: () => fetchTickets({ per_page: 8 }),
  });

  const tickets = data?.data ?? [];
  const overdue = tickets.filter((t) => t.sla_status === 'overdue').length;
  const dueSoon = tickets.filter((t) => t.sla_status === 'due_soon').length;
  const open = tickets.filter((t) => t.status === 'open').length;

  const stats = [
    { label: 'Open Tickets', value: open },
    { label: 'Due Soon', value: dueSoon },
    { label: 'Overdue', value: overdue },
  ];

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={pageTitleClass}>
            {isAgent ? 'Support Dashboard' : 'Client Dashboard'}
          </h1>
          <p className={`mt-1 ${mutedTextClass}`}>
            {isAgent
              ? 'Monitor SLA risk and ticket workload across organizations.'
              : 'Track your organization support requests.'}
          </p>
        </div>
        <Link to="/tickets/new" className={`${btnPrimary} w-full sm:w-auto`}>
          Create Ticket
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className={cardClass}>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className={cardClass}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Tickets</h2>
          <Link to="/tickets" className={linkClass}>View all</Link>
        </div>

        {isLoading ? (
          <p className={mutedTextClass}>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className={mutedTextClass}>No tickets yet.</p>
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
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">SLA</th>
                    {isAgent && <th className="px-3 py-3">Organization</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
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
