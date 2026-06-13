import { Link } from 'react-router-dom';
import SlaBadge from './SlaBadge';
import TicketStatusBadge from './TicketStatusBadge';
import { linkClass, mutedTextClass } from '../../utils/ui';
import { priorityLabel } from '../../utils/constants';

export default function TicketListCard({ ticket, isAgent }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">#{ticket.id}</p>
          <Link to={`/tickets/${ticket.id}`} className={`${linkClass} line-clamp-2 text-base`}>
            {ticket.subject}
          </Link>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-600">{priorityLabel(ticket.priority)}</span>
        <span className="text-slate-300">·</span>
        <SlaBadge status={ticket.sla_status} />
      </div>

      {isAgent && (
        <div className={`mt-3 space-y-1 ${mutedTextClass}`}>
          {ticket.organization?.name && <p>Org: {ticket.organization.name}</p>}
          <p>Assignee: {ticket.assignee?.name ?? 'Unassigned'}</p>
        </div>
      )}
    </article>
  );
}
