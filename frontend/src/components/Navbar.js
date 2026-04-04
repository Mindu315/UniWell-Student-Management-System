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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    setShowSearchResults(false);
    setSearchQuery('');
  }, [location.pathname]);

  const searchableFeatures = useMemo(() => {
    const baseItems = [
      { label: 'Dashboard', description: 'Open your main student dashboard', to: '/dashboard', icon: '🏠', keywords: ['home', 'overview', 'main'] },
      { label: 'Stress Management', description: 'Track check-ins and wellness insights', to: '/stress-management', icon: '🌿', keywords: ['wellbeing', 'stress', 'mental'] },
      { label: 'Academic Performance', description: 'Use GPA tools and academic calculators', to: '/academic-performance', icon: '📘', keywords: ['gpa', 'calculator', 'grades'] },
      { label: 'AI Quizzes', description: 'Generate quizzes from PDFs and review analytics', to: '/ai-quizzes', icon: '🤖', keywords: ['quiz', 'mcq', 'pdf'] },
      { label: 'Flashcards', description: 'Create and study flashcards', to: '/flashcards', icon: '🃏', keywords: ['cards', 'study', 'revision'] },
      { label: 'Career Guidance', description: 'Explore careers, salary, and courses', to: '/career-guidance', icon: '🎯', keywords: ['career', 'salary', 'courses'] },
      { label: 'Analysis', description: 'See your learning and wellbeing analysis', to: '/analysis', icon: '📊', keywords: ['analysis', 'insights', 'reports'] },
      { label: 'Profile', description: 'Manage your account profile', to: '/profile', icon: '👤', keywords: ['account', 'profile', 'me'] },
      { label: 'Settings', description: 'Control your experience preferences', to: '/settings', icon: '⚙️', keywords: ['preferences', 'settings', 'config'] }
    ];

    if (isAdmin) {
      baseItems.push({
        label: 'Admin Reports',
        description: 'Manage users and review system reports',
        to: '/admin',
        icon: '🛡️',
        keywords: ['admin', 'reports', 'users']
      });
    }

    return baseItems;
  }, [isAdmin]);

  const filteredFeatures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      return searchableFeatures.slice(0, 6);
    }

    return searchableFeatures.filter((item) => {
      const haystack = `${item.label} ${item.description} ${(item.keywords || []).join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [searchQuery, searchableFeatures]);

  const handleSearchNavigate = (to) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(to);
  };

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter' && filteredFeatures[0]) {
      event.preventDefault();
      handleSearchNavigate(filteredFeatures[0].to);
    }
  };

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

            <Link to="/dashboard" className="navbar-brand-shell" onClick={closeSidebar}>
              <img src="/logo.png" alt="UniWell Logo" className="navbar-brand-logo" />
              <span className="navbar-brand-copy">
                <strong>UniWell</strong>
                <span>Student Management System</span>
              </span>
            </Link>
          </div>

          <div className="navbar-right">
            <div className="navbar-search-wrap">
              <span className="navbar-search-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                className="navbar-search"
                value={searchQuery}
                placeholder="Search features, tools, resources..."
                aria-label="Search dashboard"
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => window.setTimeout(() => setShowSearchResults(false), 120)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onKeyDown={handleSearchSubmit}
              />
              {showSearchResults && (
                <div className="navbar-search-results">
                  {filteredFeatures.length > 0 ? (
                    filteredFeatures.map((item) => (
                      <button
                        key={item.to}
                        type="button"
                        className="navbar-search-item"
                        onMouseDown={() => handleSearchNavigate(item.to)}
                      >
                        <span className="navbar-search-item-icon" aria-hidden="true">{item.icon}</span>
                        <span className="navbar-search-item-copy">
                          <strong>{item.label}</strong>
                          <span>{item.description}</span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="navbar-search-empty">No matching tools found.</div>
                  )}
                </div>
              )}
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
