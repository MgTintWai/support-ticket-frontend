import { slaClass } from '../../utils/constants';

export default function SlaBadge({ status }) {
  const label = status?.replace(/_/g, ' ') ?? 'unknown';

  return <span className={slaClass(status)}>{label}</span>;
}
