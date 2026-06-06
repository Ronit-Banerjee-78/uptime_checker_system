import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
    if (error) clearError();
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name     = 'Name is required';
    if (!form.email.trim())         e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)             e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/', { replace: true });
    } catch (_) {
      // error is in store
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)  s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'var(--red)', 'var(--yellow)', 'var(--amber)', 'var(--green)'][strength];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-dot" />
          <span className="logo-text">uptime.watch</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Start monitoring your URLs in minutes.</p>

        {error && (
          <div className="error-banner" style={{ marginBottom: 20 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              type="text"
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              autoComplete="name"
              autoFocus
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-eye"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/>
                    <line x1="2" y1="2" x2="12" y2="12"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/>
                    <circle cx="7" cy="7" r="1.5"/>
                  </svg>
                )}
              </button>
            </div>
            {/* Password strength meter */}
            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map((i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      background: i <= strength ? strengthColor : 'var(--bg4)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className={`form-input ${errors.confirm ? 'input-error' : ''}`}
              type={showPass ? 'text' : 'password'}
              placeholder="Repeat password"
              value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)}
              autoComplete="new-password"
            />
            {errors.confirm && <div className="field-error">{errors.confirm}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating account...</> : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
