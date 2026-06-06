import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMonitorStore } from '../store/monitorStore';
import MonitorForm from '../components/MonitorForm';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../hooks/useToast';
import dayjs from 'dayjs';

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-slider" />
    </label>
  );
}

export default function Monitors() {
  const { monitors, loading, error, fetchMonitors, addMonitor, updateMonitor, deleteMonitor } = useMonitorStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { fetchMonitors(); }, [fetchMonitors]);

  const handleAdd = async (data) => {
    setFormLoading(true);
    try {
      await addMonitor(data);
      toast('Monitor added', 'success');
      setShowForm(false);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    try {
      await updateMonitor(editTarget.id, data);
      toast('Monitor updated', 'success');
      setEditTarget(null);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (m) => {
    try {
      await updateMonitor(m.id, { enabled: !m.enabled });
      toast(m.enabled ? 'Monitor paused' : 'Monitor enabled', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMonitor(id);
      toast('Monitor removed', 'success');
      setConfirmDelete(null);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Monitors</h1>
            <p className="page-subtitle">{monitors.length} URL{monitors.length !== 1 ? 's' : ''} tracked</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="1" x2="6" y2="11"/>
              <line x1="1" y1="6" x2="11" y2="6"/>
            </svg>
            Add Monitor
          </button>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="error-banner">⚠ {error}</div>}

        {loading && monitors.length === 0 ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : monitors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">○</div>
            <div className="empty-title">No monitors added yet</div>
            <div className="empty-desc" style={{ marginBottom: 20 }}>Start monitoring a URL to track its uptime.</div>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add your first monitor</button>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Interval</th>
                  <th>Created</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {monitors.map((m) => (
                  <tr
                    key={m.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/monitors/${m.id}`)}
                  >
                    <td><StatusBadge status={m.enabled ? undefined : 'paused'} /></td>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{m.name}</td>
                    <td className="mono" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.url}
                    </td>
                    <td className="mono">{m.interval}s</td>
                    <td className="mono">{dayjs(m.created_at).format('MMM D, YYYY')}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Toggle checked={m.enabled} onChange={() => handleToggle(m)} />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-icon"
                          title="Edit"
                          onClick={(e) => { e.stopPropagation(); setEditTarget(m); }}
                        >
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 11L5 10L11 4L9 2L3 8L2 11z"/>
                          </svg>
                        </button>
                        <button
                          className="btn btn-icon"
                          title="Delete"
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(m); }}
                          style={{ color: 'var(--red)' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="1,3 12,3"/>
                            <path d="M4,3V2h5v1"/>
                            <rect x="2" y="3" width="9" height="9" rx="1"/>
                            <line x1="5" y1="6" x2="5" y2="9"/>
                            <line x1="8" y1="6" x2="8" y2="9"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <MonitorForm
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
          loading={formLoading}
        />
      )}

      {editTarget && (
        <MonitorForm
          initial={editTarget}
          onSubmit={handleEdit}
          onClose={() => setEditTarget(null)}
          loading={formLoading}
        />
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ width: 380 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Monitor</span>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>
              Remove <strong style={{ color: 'var(--text)' }}>{confirmDelete.name}</strong>? This will delete all associated logs and history permanently.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
