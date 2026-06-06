import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
    if (error) clearError();
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)        e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (_) {
      // error is in store
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-dot" />
          <span className="logo-text">uptime.watch</span>
        </div>

        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Monitor your URLs, stay ahead of downtime.</p>

        {error && (
          <div className="error-banner" style={{ marginBottom: 20 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              {/* placeholder — link once backend supports password reset */}
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                Forgot password?
              </span>
            </div>
            <div className="input-wrap">
              <input
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                autoComplete="current-password"
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
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Signing in...</> : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
