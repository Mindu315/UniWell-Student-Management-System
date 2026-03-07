/**
 * Dashboard Page
 * User's home page after login
 * UniWell Student Management System - Wellness Dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authAPI } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.fullName?.split(' ')?.[0] || 'Rashmika';
  const weeklyData = [58, 70, 66, 78, 74, 86, 92];
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const careerSuggestions = [
    { title: 'Data Science', match: 85, icon: '📊', tone: 'career-strong' },
    { title: 'UX Design', match: 72, icon: '🎨', tone: 'career-medium' },
    { title: 'Project Mgmt', match: 68, icon: '🧩', tone: 'career-base' }
  ];

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading your wellness dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container dashboard-main">
        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <p className="hero-eyebrow">UniWell Student Management System</p>
            <h1 className="hero-title">
              Good Morning, {firstName}! <span>🌤️</span>
            </h1>
            <p className="hero-subtitle">
              Balance your Mind, Boost your <strong>Future</strong>.
            </p>
            <div className="hero-accent" />
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-logo-badge">
              <img src="/logo.png" alt="UniWell" className="hero-logo" />
            </div>
            <p className="hero-visual-text">Wellness + Academics</p>
          </div>
        </section>

        <section className="dashboard-summary-grid">
          <article className="summary-card stress-card">
            <div className="summary-icon">🌸</div>
            <h3>Stress Level</h3>
            <span className="summary-badge">Moderate</span>
            <div className="summary-progress">
              <span style={{ width: '64%' }} />
            </div>
          </article>

          <article className="summary-card gpa-card">
            <div className="summary-icon">📘</div>
            <h3>GPA Overview</h3>
            <p className="summary-value">3.72 <small>/ 4.00</small></p>
          </article>

          <article className="summary-card neuro-card">
            <div className="summary-icon">🧠</div>
            <h3>Neuro Card</h3>
            <button className="summary-action">View →</button>
          </article>

          <article className="summary-card quiz-card">
            <div className="summary-icon">🤖</div>
            <h3>AI Quizzes</h3>
            <button className="summary-action">Start Quiz →</button>
          </article>
        </section>

        <section className="dashboard-insights-grid">
          <article className="dashboard-panel weekly-progress-panel">
            <div className="panel-header">
              <h2>Weekly Progress</h2>
            </div>

            <div className="chart-area">
              <div className="chart-grid-lines">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="chart-bars">
                {weeklyData.map((value, index) => (
                  <div key={weekLabels[index]} className="chart-bar-item">
                    <div className="chart-bar-track">
                      <span className="chart-bar-fill" style={{ height: `${value}%` }} />
                    </div>
                    <p>{weekLabels[index]}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="dashboard-panel career-panel">
            <div className="panel-header">
              <h2>Career Suggestions</h2>
              <button className="panel-link">See All →</button>
            </div>

            <div className="career-list">
              {careerSuggestions.map((career) => (
                <div key={career.title} className="career-item">
                  <div className="career-item-head">
                    <span className="career-icon" aria-hidden="true">{career.icon}</span>
                    <div>
                      <p className="career-title">{career.title}</p>
                      <p className="career-match">{career.match}% Match</p>
                    </div>
                  </div>
                  <div className="career-progress">
                    <span className={career.tone} style={{ width: `${career.match}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="dashboard-grid dashboard-tools-grid">
          <div className="dashboard-card">
            <div className="card-gradient-header">
              <h2>Your Profile</h2>
            </div>
            <div className="profile-info">
              <p><strong>Email</strong> <span>{user?.email}</span></p>
              <p><strong>Student ID</strong> <span>{user?.studentId}</span></p>
              <p><strong>Faculty</strong> <span>{user?.faculty}</span></p>
              <p><strong>Degree Program</strong> <span>{user?.degreeProgram}</span></p>
              <p><strong>Year</strong> <span>Year {user?.year}</span></p>
              <p><strong>Role</strong> <span>{user?.role}</span></p>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate('/profile')}
            >
              Edit Profile
            </button>
          </div>

          <div className="dashboard-card">
            <h2>🌱 Wellness Tools</h2>
            <div className="quick-actions">
              <button className="action-btn">🧘‍♀️ Mindfulness Exercise</button>
              <button className="action-btn">💭 Stress Assessment</button>
              <button className="action-btn">🎵 Relaxation Music</button>
              <button className="action-btn">📖 Wellness Resources</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>📚 Academic Tools</h2>
            <div className="quick-actions">
              <button className="action-btn">📝 Assignment Tracker</button>
              <button className="action-btn">📅 Study Schedule</button>
              <button className="action-btn">📊 Grade Calculator</button>
              <button className="action-btn">🎓 Course Progress</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>🤖 AI Guidance</h2>
            <div className="quick-actions">
              <button className="action-btn">🎯 Career Recommendations</button>
              <button className="action-btn">💡 Study Tips</button>
              <button className="action-btn">🔮 Goal Suggestions</button>
              <button className="action-btn">📈 Progress Insights</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>⚙️ Quick Actions</h2>
            <div className="quick-actions">
              <button
                className="action-btn"
                onClick={() => navigate('/profile')}
              >
                📝 Update Profile
              </button>
              {user?.role === 'admin' && (
                <button
                  className="action-btn"
                  onClick={() => navigate('/admin')}
                >
                  👥 Manage Users
                </button>
              )}
              <button className="action-btn">🔔 Notifications</button>
              <button className="action-btn">⚙️ Settings</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>📊 Recent Activity</h2>
            <div className="profile-info">
              <p>✅ Completed stress assessment</p>
              <p>📚 Submitted assignment #3</p>
              <p>🎯 Set new wellness goal</p>
              <p>💪 Practiced mindfulness</p>
            </div>
          </div>
        </section>

        <div className="info-section dashboard-about">
          <h2>About UniWell Student Management System</h2>
          <p>
            UniWell is your comprehensive platform for student wellbeing and academic success. 
            We combine mental health support, academic tracking, stress management tools, 
            and AI-powered career guidance to help you thrive throughout your university journey. 
            Our holistic approach ensures you maintain balance between your academic goals and personal wellness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
