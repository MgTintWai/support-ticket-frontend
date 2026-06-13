import { statusBadgeClass, statusLabel } from '../../utils/constants';

export default function TicketStatusBadge({ status }) {
  return <span className={statusBadgeClass}>{statusLabel(status)}</span>;
}
