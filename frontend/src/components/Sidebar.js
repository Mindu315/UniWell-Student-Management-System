import { NavLink } from 'react-router-dom';

const Sidebar = ({ isAdmin, onNavigate }) => {
  const primaryMenuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠', to: '/dashboard', type: 'route' },
    { key: 'stress', label: 'Stress Management', icon: '🌿', to: '/stress-management', type: 'route' },
    { key: 'academic', label: 'Academic Performance', icon: '📘', type: 'placeholder' },
    { key: 'neuro', label: 'Neuro Card', icon: '🧠', type: 'placeholder' },
    { key: 'quiz', label: 'AI Quizzes', icon: '🤖', type: 'placeholder' },
    { key: 'career', label: 'Career Guidance', icon: '🎯', type: 'placeholder' }
  ];

  const secondaryMenuItems = [
    { key: 'reports', label: isAdmin ? 'Reports' : 'Progress Reports', icon: '📊', to: isAdmin ? '/admin' : null, type: isAdmin ? 'route' : 'placeholder' },
    { key: 'profile', label: 'Profile', icon: '👤', to: '/profile', type: 'route' },
    { key: 'settings', label: 'Settings', icon: '⚙️', type: 'placeholder' }
  ];

  return (
    <aside className="dashboard-sidebar" aria-label="Sidebar">
      <div className="sidebar-logo-section">
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo-circle">
            <img src="/logo.png" alt="UniWell Logo" className="sidebar-logo-img" />
          </div>
          <div className="sidebar-logo-text">
            <h1>UniWell</h1>
            <p>Student Management System</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-group-title">Main</p>
        <ul>
          {primaryMenuItems.map((item) => (
            <li key={item.key}>
              {item.type === 'route' ? (
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
                >
                  <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </NavLink>
              ) : (
                <button type="button" className="sidebar-link is-disabled" disabled>
                  <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <nav className="sidebar-nav sidebar-nav-secondary">
        <p className="sidebar-group-title">Account</p>
        <ul>
          {secondaryMenuItems.map((item) => (
            <li key={item.key}>
              {item.type === 'route' ? (
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
                >
                  <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </NavLink>
              ) : (
                <button type="button" className="sidebar-link is-disabled" disabled>
                  <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-wellness-card">
        <p className="wellness-title">Your mind matters.</p>
        <p className="wellness-text">Balance your mind, boost your future.</p>
      </div>
    </aside>
  );
};

export default Sidebar;