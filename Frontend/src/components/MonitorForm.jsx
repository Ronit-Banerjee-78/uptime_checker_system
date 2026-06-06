import { useState } from 'react';

const INTERVALS = [
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
];

export default function MonitorForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    url: initial?.url || '',
    interval: initial?.interval || 60,
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.url.trim()) e.url = 'URL is required';
    else {
      try { new URL(form.url); }
      catch { e.url = 'Enter a valid URL (include https://)'; }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{initial ? 'Edit Monitor' : 'Add Monitor'}</span>
          <button className="btn-icon" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="13" y2="13"/>
              <line x1="13" y1="1" x2="1" y2="13"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              placeholder="My Website"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">URL</label>
            <input
              className="form-input"
              placeholder="https://example.com"
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
            />
            {errors.url && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.url}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Check Interval</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {INTERVALS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('interval', opt.value)}
                  style={{
                    flex: 1,
                    padding: '7px 4px',
                    background: form.interval === opt.value ? 'rgba(245,158,11,0.12)' : 'var(--bg3)',
                    border: `1px solid ${form.interval === opt.value ? 'var(--amber)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    color: form.interval === opt.value ? 'var(--amber)' : 'var(--text2)',
                    fontSize: 12,
                    fontFamily: 'var(--mono)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
