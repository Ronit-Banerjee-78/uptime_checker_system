export default function StatusBadge({ status }) {
  if (!status) return <span className="badge badge-unknown"><span className="badge-dot"/>—</span>;

  const map = {
    up: 'badge-up',
    down: 'badge-down',
    timeout: 'badge-timeout',
    error: 'badge-down',
  };

  const cls = map[status] || 'badge-unknown';
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
