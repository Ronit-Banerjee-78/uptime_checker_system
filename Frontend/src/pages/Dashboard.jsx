import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMonitorStore } from '../store/monitorStore';
import StatusBadge from '../components/StatusBadge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={accent ? { color: accent } : {}}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { overview, loading, error, fetchOverview } = useMonitorStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  const total = overview.length;
  const up = overview.filter((m) => m.current_status === 'up').length;
  const down = overview.filter((m) => m.current_status === 'down').length;
  const avgMs = overview.length
    ? Math.round(overview.filter((m) => m.avg_response_ms).reduce((a, m) => a + m.avg_response_ms, 0) / (overview.filter((m) => m.avg_response_ms).length || 1))
    : null;

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">24h overview · auto-refreshes every 30s</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="error-banner">⚠ {error}</div>}

        <div className="stats-grid">
          <StatCard label="Total Monitors" value={total} sub={`${overview.filter(m=>m.enabled).length} active`} />
          <StatCard label="Online" value={up} accent={up > 0 ? 'var(--green)' : undefined} />
          <StatCard label="Down" value={down} accent={down > 0 ? 'var(--red)' : undefined} />
          <StatCard label="Avg Response" value={avgMs ? `${avgMs}ms` : '—'} sub="across all monitors" />
        </div>

        {loading && overview.length === 0 ? (
          <div className="loading"><div className="spinner" /> Loading monitors...</div>
        ) : overview.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">○</div>
            <div className="empty-title">No monitors yet</div>
            <div className="empty-desc">Add your first URL in the Monitors tab.</div>
          </div>
        ) : (
          <>
            <div className="section-title">All Monitors</div>
            <div className="monitor-list">
              {overview.map((m) => {
                const uptimePct = m.total_checks > 0
                  ? ((m.up_count / m.total_checks) * 100).toFixed(1)
                  : null;
                return (
                  <div
                    key={m.id}
                    className="monitor-row"
                    onClick={() => navigate(`/monitors/${m.id}`)}
                  >
                    <StatusBadge status={m.enabled ? m.current_status : 'paused'} />
                    <span className="monitor-name">{m.name}</span>
                    <span className="monitor-url">{m.url}</span>
                    <div className="monitor-meta">
                      <span className="monitor-ms">
                        {m.avg_response_ms ? `${Math.round(m.avg_response_ms)}ms` : '—'}
                      </span>
                      <span className="monitor-uptime" style={{
                        color: uptimePct
                          ? uptimePct >= 99 ? 'var(--green)' : uptimePct >= 95 ? 'var(--yellow)' : 'var(--red)'
                          : 'var(--text3)'
                      }}>
                        {uptimePct ? `${uptimePct}%` : '—'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', minWidth: 80, textAlign: 'right' }}>
                        {m.last_checked ? dayjs(m.last_checked).fromNow() : 'never'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
