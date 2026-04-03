import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { aiQuizAPI, authAPI, careerAPI, flashcardAPI, wellbeingAPI } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [careerIndustryCount, setCareerIndustryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const results = await Promise.allSettled([
          authAPI.getMe(),
          wellbeingAPI.getMyCheckins(7),
          flashcardAPI.getFlashcards(),
          aiQuizAPI.getQuizAnalytics(),
          careerAPI.getIndustries()
        ]);

        const [userResult, wellbeingResult, flashcardsResult, analyticsResult, careerResult] = results;

        if (userResult.status === 'fulfilled' && userResult.value.data?.success) {
          setUser(userResult.value.data.data.user);
        } else {
          setError('Failed to load user data');
        }

        if (wellbeingResult.status === 'fulfilled') {
          setCheckins(wellbeingResult.value.data?.data?.checkins || []);
        }

        if (flashcardsResult.status === 'fulfilled') {
          const flashcardData = flashcardsResult.value.data?.data || {};
          setFlashcardCount(flashcardData.count || flashcardData.flashcards?.length || 0);
        }

        if (analyticsResult.status === 'fulfilled') {
          setQuizAnalytics(analyticsResult.value.data?.data || null);
        }

        if (careerResult.status === 'fulfilled') {
          setCareerIndustryCount(careerResult.value.data?.data?.length || 0);
        }
      } catch (apiError) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const firstName = user?.fullName?.split(' ')?.[0] || 'Student';
  const latestCheckin = checkins[0] || null;
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const stressLabel = latestCheckin?.conditionLabel || 'No Check-In Yet';
  const stressLevel = Number(latestCheckin?.stress || 0);
  const stressPercent = Math.min(Math.max((stressLevel / 5) * 100, 0), 100);
  const stressMeta = latestCheckin
    ? `Latest Stress Level: ${latestCheckin.stress}/5`
    : 'Start by submitting your first wellbeing check-in';
  const quizAccuracy = quizAnalytics?.overall?.averageCorrectPercent || 0;
  const attemptCount = quizAnalytics?.overall?.attemptsCount || 0;

  const weeklyData = useMemo(() => {
    const values = [...checkins]
      .reverse()
      .map((item) => {
        const normalized = ((Number(item.score || 0) + 7) / 20) * 100;
        return Math.min(Math.max(normalized, 8), 100);
      });

    if (values.length >= 7) {
      return values.slice(-7);
    }

    return [...Array(7 - values.length).fill(12), ...values];
  }, [checkins]);

  const careerSuggestions = useMemo(() => {
    const bySubject = quizAnalytics?.bySubject || [];

    if (!bySubject.length) {
      return [
        { title: 'Career Guidance', match: 100, icon: '🎯', tone: 'career-strong' },
        { title: 'Salary Insights', match: 84, icon: '📈', tone: 'career-medium' },
        { title: 'Course Suggestions', match: 76, icon: '📚', tone: 'career-base' }
      ];
    }

    return bySubject.slice(0, 3).map((item, index) => ({
      title: item.subject,
      match: Number(item.avgCorrectPercent || 0),
      icon: ['📘', '🧠', '🎯'][index] || '📊',
      tone: ['career-strong', 'career-medium', 'career-base'][index] || 'career-base'
    }));
  }, [quizAnalytics]);

  const recentActivity = [
    latestCheckin ? `🌿 Wellbeing check-in marked ${latestCheckin.conditionLabel}` : '🌿 No wellbeing check-in yet',
    flashcardCount ? `🃏 You have ${flashcardCount} flashcard${flashcardCount === 1 ? '' : 's'} saved` : '🃏 Start building your flashcard library',
    attemptCount ? `🤖 ${attemptCount} AI quiz attempt${attemptCount === 1 ? '' : 's'} submitted` : '🤖 Try your first AI quiz',
    careerIndustryCount ? `🎯 ${careerIndustryCount} career industries are ready to explore` : '🎯 Career tools are ready to explore'
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
      <div className="container dashboard-main unified-page-shell">
        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <p className="hero-eyebrow">UniWell Student Management System</p>
            <h1 className="hero-title">
              Good Morning, {firstName}! <span>🌤️</span>
            </h1>
            <p className="hero-subtitle">
              Your real learning activity, wellbeing, and guidance tools are all connected here.
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
            <span className="summary-badge">{stressLabel}</span>
            <div className="summary-progress">
              <span style={{ width: `${stressPercent}%` }} />
            </div>
            <p className="hero-eyebrow" style={{ marginTop: '0.7rem' }}>{stressMeta}</p>
            <button
              className="summary-action"
              style={{ marginTop: '0.7rem' }}
              onClick={() => navigate('/stress-management')}
              type="button"
            >
              Open Stress Page →
            </button>
          </article>

          <article className="summary-card gpa-card">
            <div className="summary-icon">🃏</div>
            <h3>Flashcards</h3>
            <p className="summary-value">{flashcardCount} <small>saved</small></p>
            <button className="summary-action" onClick={() => navigate('/flashcards')} type="button">
              Open Flashcards →
            </button>
          </article>

          <article className="summary-card neuro-card">
            <div className="summary-icon">📊</div>
            <h3>Analysis</h3>
            <p className="summary-value">{quizAccuracy}% <small>accuracy</small></p>
            <button className="summary-action" onClick={() => navigate('/analysis')} type="button">
              View Insights →
            </button>
          </article>

          <article className="summary-card quiz-card">
            <div className="summary-icon">🤖</div>
            <h3>AI Quizzes</h3>
            <p className="summary-value">{attemptCount} <small>attempts</small></p>
            <button
              className="summary-action"
              onClick={() => navigate('/ai-quizzes')}
              type="button"
            >
              Start Quiz →
            </button>
          </article>
        </section>

        <section className="dashboard-insights-grid">
          <article className="dashboard-panel weekly-progress-panel">
            <div className="panel-header">
              <h2>Weekly Wellbeing Trend</h2>
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
              <h2>Learning Focus</h2>
              <button className="panel-link" onClick={() => navigate('/career-guidance')} type="button">See All →</button>
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
            <button className="btn btn-primary btn-block" onClick={() => navigate('/profile')} type="button">
              Edit Profile
            </button>
          </div>

          <div className="dashboard-card">
            <h2>🌱 Wellness Tools</h2>
            <div className="quick-actions">
              <button className="action-btn" onClick={() => navigate('/stress-management')} type="button">💭 Stress Assessment</button>
              <button className="action-btn" onClick={() => navigate('/analysis')} type="button">📈 Wellness Analysis</button>
              <button className="action-btn" onClick={() => navigate('/profile')} type="button">👤 Update Profile</button>
              <button className="action-btn" onClick={() => navigate('/settings')} type="button">⚙️ Reminder Settings</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>📚 Academic Tools</h2>
            <div className="quick-actions">
              <button className="action-btn" onClick={() => navigate('/academic-performance')} type="button">📊 Grade Calculator</button>
              <button className="action-btn" onClick={() => navigate('/flashcards')} type="button">🃏 Flashcard Review</button>
              <button className="action-btn" onClick={() => navigate('/ai-quizzes')} type="button">🤖 Quiz Practice</button>
              <button className="action-btn" onClick={() => navigate('/analysis')} type="button">📅 Progress Analysis</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>🤖 AI Guidance</h2>
            <div className="quick-actions">
              <button className="action-btn" onClick={() => navigate('/career-guidance')} type="button">🎯 Career Recommendations</button>
              <button className="action-btn" onClick={() => navigate('/career-guidance')} type="button">📈 Salary Trends</button>
              <button className="action-btn" onClick={() => navigate('/career-guidance')} type="button">📚 Course Suggestions</button>
              <button className="action-btn" onClick={() => navigate('/analysis')} type="button">📊 Progress Insights</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>⚙️ Quick Actions</h2>
            <div className="quick-actions">
              <button className="action-btn" onClick={() => navigate('/profile')} type="button">📝 Update Profile</button>
              {user?.role === 'admin' && (
                <button className="action-btn" onClick={() => navigate('/admin')} type="button">👥 Manage Users</button>
              )}
              <button className="action-btn" onClick={() => navigate('/analysis')} type="button">📊 Analysis</button>
              <button className="action-btn" onClick={() => navigate('/settings')} type="button">⚙️ Settings</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>📊 Recent Activity</h2>
            <div className="profile-info">
              {recentActivity.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
