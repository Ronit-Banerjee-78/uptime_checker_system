import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMonitorStore } from '../store/monitorStore';
import { logsApi } from '../api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function Incidents() {
  const { monitors, fetchMonitors } = useMonitorStore();
  const [allIncidents, setAllIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      await fetchMonitors();
    };
    load();
  }, [fetchMonitors]);

  useEffect(() => {
    if (monitors.length === 0) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled(
          monitors.map((m) =>
            logsApi.getIncidents(m.id).then((r) =>
              r.data.map((inc) => ({ ...inc, monitorName: m.name, monitorId: m.id }))
            )
          )
        );
        const incidents = results
          .filter((r) => r.status === 'fulfilled')
          .flatMap((r) => r.value)
          .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
        setAllIncidents(incidents);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [monitors]);

  const open = allIncidents.filter((i) => !i.resolved_at);
  const resolved = allIncidents.filter((i) => i.resolved_at);

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Incidents</h1>
            <p className="page-subtitle">
              {open.length > 0 ? `${open.length} ongoing` : 'All clear'} · {allIncidents.length} total
            </p>
          </div>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading incidents...</div>
        ) : allIncidents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <div className="empty-title">No incidents recorded</div>
            <div className="empty-desc">Everything is running smoothly.</div>
          </div>
        ) : (
          <>
            {open.length > 0 && (
              <>
                <div className="section-title" style={{ color: 'var(--red)' }}>
                  Ongoing — {open.length}
                </div>
                <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(239,68,68,0.25)' }}>
                  {open.map((inc) => (
                    <div
                      key={inc.id}
                      className="incident-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/monitors/${inc.monitorId}`)}
                    >
                      <div className="incident-icon active" />
                      <div className="incident-info">
                        <div className="incident-type">
                          {inc.monitorName} · <span style={{ color: 'var(--text2)', fontWeight: 400 }}>{inc.type}</span>
                        </div>
                        <div className="incident-time">
                          Started {dayjs(inc.started_at).fromNow()} · {dayjs(inc.started_at).format('MMM D HH:mm')}
                        </div>
                      </div>
                      <div className="incident-duration">
                        <span style={{ color: 'var(--red)' }}>ongoing</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {resolved.length > 0 && (
              <>
                <div className="section-title">Resolved — {resolved.length}</div>
                <div className="card">
                  {resolved.slice(0, 50).map((inc) => {
                    const durationMs = new Date(inc.resolved_at) - new Date(inc.started_at);
                    const mins = Math.round(durationMs / 60000);
                    return (
                      <div
                        key={inc.id}
                        className="incident-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/monitors/${inc.monitorId}`)}
                      >
                        <div className="incident-icon resolved" />
                        <div className="incident-info">
                          <div className="incident-type">
                            {inc.monitorName} · <span style={{ color: 'var(--text2)', fontWeight: 400 }}>{inc.type}</span>
                          </div>
                          <div className="incident-time">
                            {dayjs(inc.started_at).format('MMM D, YYYY HH:mm')} → {dayjs(inc.resolved_at).format('HH:mm')}
                          </div>
                        </div>
                        <div className="incident-duration">
                          {mins < 60
                            ? `${mins}m`
                            : `${Math.floor(mins / 60)}h ${mins % 60}m`
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
