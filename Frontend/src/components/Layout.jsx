import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const icons = {
  dashboard: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  ),
  monitors: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2" />
      <line x1="8" y1="2" x2="8" y2="4" />
      <line x1="8" y1="12" x2="8" y2="14" />
      <line x1="2" y1="8" x2="4" y2="8" />
      <line x1="12" y1="8" x2="14" y2="8" />
    </svg>
  ),
  incidents: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2L14 13H2L8 2z" />
      <line x1="8" y1="7" x2="8" y2="10" />
      <circle cx="8" cy="12" r="0.5" fill="currentColor" />
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3" />
      <polyline points="9,4 12,7 9,10" />
      <line x1="12" y1="7" x2="5" y2="7" />
    </svg>
  ),
};

function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {/* <div className="logo-dot" /> */}
        <span className="logo-text">UpTime-Checker</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {icons.dashboard}
          Dashboard
        </NavLink>
        <NavLink to="/monitors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {icons.monitors}
          Monitors
        </NavLink>
        <NavLink to="/incidents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {icons.incidents}
          Incidents
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="status-pill">
          <div className="dot" />
          API connected
        </div>
      </div>

      {/* User section */}
      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'User'}</div>
          <div className="user-email">{user?.email || ''}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Sign out">
          {icons.logout}
        </button>
      </div>
    </aside>
  );
}

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
