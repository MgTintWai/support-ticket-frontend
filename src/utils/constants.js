export const TICKET_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_on_client', label: 'Waiting on Client' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const SLA_STATUSES = [
  { value: 'on_track', label: 'On Track' },
  { value: 'due_soon', label: 'Due Soon' },
  { value: 'overdue', label: 'Overdue' },
];

export const statusLabel = (value) =>
  TICKET_STATUSES.find((s) => s.value === value)?.label ?? value;

export const priorityLabel = (value) =>
  TICKET_PRIORITIES.find((p) => p.value === value)?.label ?? value;

const badgeBase = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize';

export const slaClass = (status) => {
  switch (status) {
    case 'overdue':
      return `${badgeBase} bg-red-100 text-red-800`;
    case 'due_soon':
      return `${badgeBase} bg-amber-100 text-amber-800`;
    case 'on_track':
      return `${badgeBase} bg-emerald-100 text-emerald-800`;
    default:
      return `${badgeBase} bg-slate-200 text-slate-700`;
  }
};

export const statusBadgeClass = `${badgeBase} bg-slate-200 text-slate-700`;
