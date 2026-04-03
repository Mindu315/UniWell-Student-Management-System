/**
 * Navbar Component
 * Top navigation bar + dashboard shell controls
 * UniWell Student Management System
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI, removeToken, getUserFromToken } from '../api';
import Sidebar from './Sidebar';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tokenUser = getUserFromToken();
  const [currentUser, setCurrentUser] = useState(tokenUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.data?.success) {
          setCurrentUser(response.data.data.user);
        }
      } catch (error) {
        setCurrentUser(tokenUser);
      }
    };

    fetchCurrentUser();
  }, [location.pathname]);

  const isAdmin = currentUser && currentUser.role === 'admin';
  const firstName = currentUser?.fullName?.split(' ')?.[0] || currentUser?.name?.split(' ')?.[0] || 'Student';

  const pageTitle = useMemo(() => {
    const titleMap = {
      '/dashboard': 'Dashboard',
      '/profile': 'Profile',
      '/admin': 'Reports & User Management',
      '/flashcards': 'Flashcards',
      '/ai-quizzes': 'AI Quizzes',
      '/stress-management': 'Stress Management',
      '/admin': 'Reports & User Management'
    };

    return titleMap[location.pathname] || 'UniWell Workspace';
  }, [location.pathname]);

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
        aria-hidden={!sidebarOpen}
      />

      <div className={`dashboard-sidebar-shell ${sidebarOpen ? 'is-open' : ''}`}>
        <Sidebar isAdmin={isAdmin} onNavigate={closeSidebar} />
      </div>

      <nav className="navbar" role="navigation" aria-label="Top navigation">
        <div className="navbar-container">
          <div className="navbar-left">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={sidebarOpen}
            >
              ☰
            </button>

            <div className="navbar-page-meta">
              <p className="navbar-breadcrumb">UniWell / Workspace</p>
              <h2 className="navbar-page-title">{pageTitle}</h2>
            </div>
          </div>

          <div className="navbar-right">
            <div className="navbar-search-wrap">
              <span className="navbar-search-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                className="navbar-search"
                placeholder="Search features, tools, resources..."
                aria-label="Search dashboard"
              />
            </div>

            <button type="button" className="icon-btn" aria-label="Notifications">
              🔔
            </button>

            <button type="button" className="icon-btn" aria-label="Messages">
              💬
            </button>

            <Link to="/profile" className="profile-chip" onClick={closeSidebar}>
              <div className="profile-avatar">{(firstName?.[0] || 'U').toUpperCase()}</div>
              <div className="topbar-profile-info">
                <span className="topbar-profile-name">Hi, {firstName}</span>
                <span className="topbar-profile-role">{isAdmin ? 'Administrator' : 'Student'}</span>
              </div>
              <span className="profile-chevron" aria-hidden="true">▾</span>
            </Link>

            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
