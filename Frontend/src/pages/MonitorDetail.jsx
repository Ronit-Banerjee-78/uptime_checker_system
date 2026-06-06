import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMonitorStore } from '../store/monitorStore';
import { logsApi } from '../api';
import StatusBadge from '../components/StatusBadge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function UptimeBars({ summary }) {
  if (!summary.length) return null;
  const sorted = [...summary].sort((a, b) => a.summary_date.localeCompare(b.summary_date)).slice(-30);

  return (
    <div>
      <div className="uptime-bars" style={{ height: 36 }}>
        {sorted.map((d) => {
          const pct = parseFloat(d.uptime_pct || 0);
          const color = pct >= 99 ? 'var(--green)' : pct >= 95 ? 'var(--yellow)' : 'var(--red)';
          return (
            <div
              key={d.summary_date}
              className="uptime-bar"
              title={`${d.summary_date}: ${pct}% uptime`}
              style={{
                height: `${Math.max(20, pct)}%`,
                background: color,
                opacity: 0.8,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          {sorted[0]?.summary_date}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>Today</span>
      </div>
    </div>
  );
}

function ResponseChart({ logs }) {
  if (!logs.length) return null;
  const upLogs = logs.filter(l => l.response_ms);
  if (!upLogs.length) return null;

  const max = Math.max(...upLogs.map(l => l.response_ms));
  const recent = upLogs.slice(0, 60).reverse();

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
      {recent.map((l) => (
        <div
          key={l.id}
          title={`${l.response_ms}ms at ${dayjs(l.checked_at).format('HH:mm')}`}
          style={{
            flex: 1,
            height: `${Math.max(8, (l.response_ms / max) * 100)}%`,
            background: l.status === 'up' ? 'var(--amber)' : 'var(--red)',
            borderRadius: 1,
            opacity: 0.7,
            minWidth: 3,
          }}
        />
      ))}
    </div>
  );
}

export default function MonitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { monitors } = useMonitorStore();
  const monitor = monitors.find((m) => m.id === parseInt(id));

  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('logs');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [l, s, i] = await Promise.all([
          logsApi.getLogs(id),
          logsApi.getSummary(id, 30),
          logsApi.getIncidents(id),
        ]);
        setLogs(l.data);
        setSummary(s.data);
        setIncidents(i.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const recentUp = logs.filter((l) => l.status === 'up').length;
  const uptime = logs.length ? ((recentUp / logs.length) * 100).toFixed(1) : null;
  const avgMs = logs.filter(l => l.response_ms).length
    ? Math.round(logs.filter(l => l.response_ms).reduce((a, l) => a + l.response_ms, 0) / logs.filter(l => l.response_ms).length)
    : null;
  const lastLog = logs[0];

  const tabStyle = (t) => ({
    padding: '6px 14px',
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'var(--mono)',
    cursor: 'pointer',
    border: 'none',
    background: tab === t ? 'var(--bg3)' : 'transparent',
    color: tab === t ? 'var(--text)' : 'var(--text3)',
    transition: 'all 0.15s',
  });

  return (
    <>
      <div className="page-header">
        <div
          className="back-btn"
          onClick={() => navigate('/monitors')}
        >
          ← Monitors
        </div>

        {monitor ? (
          <div className="page-header-row">
            <div>
              <h1 className="page-title">{monitor.name}</h1>
              <p className="page-subtitle" style={{ fontFamily: 'var(--mono)' }}>{monitor.url}</p>
            </div>
            <StatusBadge status={monitor.enabled ? lastLog?.status : 'paused'} />
          </div>
        ) : (
          <h1 className="page-title">Monitor #{id}</h1>
        )}
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading data...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="detail-header-stats">
              <div className="stat-card">
                <div className="stat-label">Uptime (recent)</div>
                <div className="stat-value" style={{ color: uptime >= 99 ? 'var(--green)' : uptime >= 95 ? 'var(--yellow)' : 'var(--red)' }}>
                  {uptime ? `${uptime}%` : '—'}
                </div>
                <div className="stat-sub">{logs.length} checks</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Response</div>
                <div className="stat-value">{avgMs ? `${avgMs}ms` : '—'}</div>
                <div className="stat-sub">recent checks</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Open Incidents</div>
                <div className="stat-value" style={{ color: incidents.filter(i => !i.resolved_at).length > 0 ? 'var(--red)' : undefined }}>
                  {incidents.filter(i => !i.resolved_at).length}
                </div>
                <div className="stat-sub">{incidents.length} total</div>
              </div>
            </div>

            {/* Uptime history */}
            {summary.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  30-day uptime
                </div>
                <UptimeBars summary={summary} />
              </div>
            )}

            {/* Response time chart */}
            {logs.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Response time — last {Math.min(logs.length, 60)} checks
                </div>
                <ResponseChart logs={logs} />
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              <button style={tabStyle('logs')} onClick={() => setTab('logs')}>Check Logs</button>
              <button style={tabStyle('incidents')} onClick={() => setTab('incidents')}>
                Incidents {incidents.length > 0 && `(${incidents.length})`}
              </button>
              <button style={tabStyle('summary')} onClick={() => setTab('summary')}>Daily Summary</button>
            </div>

            {tab === 'logs' && (
              <div className="card" style={{ padding: 0 }}>
                {logs.length === 0 ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <div className="empty-title">No logs yet</div>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Code</th>
                          <th>Response</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.slice(0, 100).map((l) => (
                          <tr key={l.id}>
                            <td className="mono">{dayjs(l.checked_at).format('MMM D HH:mm:ss')}</td>
                            <td><StatusBadge status={l.status} /></td>
                            <td className="mono">{l.status_code || '—'}</td>
                            <td className="mono">{l.response_ms ? `${l.response_ms}ms` : '—'}</td>
                            <td style={{ color: 'var(--red)', fontSize: 12 }}>{l.error_message || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === 'incidents' && (
              <div className="card">
                {incidents.length === 0 ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <div className="empty-title">No incidents recorded</div>
                    <div className="empty-desc">All clear!</div>
                  </div>
                ) : (
                  incidents.map((inc) => (
                    <div key={inc.id} className="incident-item">
                      <div className={`incident-icon ${inc.resolved_at ? 'resolved' : 'active'}`} />
                      <div className="incident-info">
                        <div className="incident-type">{inc.type}</div>
                        <div className="incident-time">
                          {dayjs(inc.started_at).format('MMM D, YYYY HH:mm')}
                          {inc.resolved_at && ` → ${dayjs(inc.resolved_at).format('HH:mm')}`}
                        </div>
                      </div>
                      <div className="incident-duration">
                        {inc.resolved_at
                          ? `${Math.round((new Date(inc.resolved_at) - new Date(inc.started_at)) / 60000)}m`
                          : <span style={{ color: 'var(--red)' }}>ongoing</span>
                        }
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'summary' && (
              <div className="card" style={{ padding: 0 }}>
                {summary.length === 0 ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <div className="empty-title">No summaries yet</div>
                    <div className="empty-desc">Daily summaries appear after 24h of monitoring.</div>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Uptime</th>
                          <th>Checks</th>
                          <th>Down</th>
                          <th>Avg ms</th>
                          <th>Min ms</th>
                          <th>Max ms</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...summary].sort((a,b) => b.summary_date.localeCompare(a.summary_date)).map((d) => (
                          <tr key={d.id}>
                            <td className="mono">{d.summary_date}</td>
                            <td className="mono" style={{
                              color: parseFloat(d.uptime_pct) >= 99 ? 'var(--green)'
                                : parseFloat(d.uptime_pct) >= 95 ? 'var(--yellow)' : 'var(--red)'
                            }}>
                              {d.uptime_pct}%
                            </td>
                            <td className="mono">{d.total_checks}</td>
                            <td className="mono" style={{ color: d.down_count > 0 ? 'var(--red)' : 'var(--text3)' }}>{d.down_count}</td>
                            <td className="mono">{d.avg_response_ms ? `${Math.round(d.avg_response_ms)}ms` : '—'}</td>
                            <td className="mono">{d.min_response_ms ? `${d.min_response_ms}ms` : '—'}</td>
                            <td className="mono">{d.max_response_ms ? `${d.max_response_ms}ms` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
