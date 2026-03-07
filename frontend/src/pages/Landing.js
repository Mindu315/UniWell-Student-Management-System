/**
 * Landing Page
 * Modern static homepage for UniWell Student Management System
 */

import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authAPI, getToken, removeToken } from '../api';
import '../css/LandingPage.css';

const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!getToken()) {
        setCurrentUser(null);
        return;
      }

      setAuthLoading(true);
      try {
        const response = await authAPI.getMe();
        if (response.data?.success) {
          setCurrentUser(response.data.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    removeToken();
    setCurrentUser(null);
    closeMenu();
    navigate('/');
  };

  const displayName = currentUser?.fullName?.split(' ')?.[0] || 'Student';

  return (
    <div className="lp-page">
      <header className="lp-navbar-wrap">
        <nav className="lp-navbar">
          <Link to="/" className="lp-brand" onClick={closeMenu}>
            <img src="/logo.png" alt="UniWell Logo" className="lp-brand-logo" />
            <div className="lp-brand-text">
              <span className="lp-brand-title">UniWell</span>
              <span className="lp-brand-subtitle">Student Management System</span>
            </div>
          </Link>

          <button
            type="button"
            className="lp-menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((state) => !state)}
          >
            ☰
          </button>

          <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#about" onClick={closeMenu}>Why UniWell</a>
            <a href="#how-it-works" onClick={closeMenu}>How It Works</a>
            <a href="#preview" onClick={closeMenu}>Preview</a>
            <a href="#testimonials" onClick={closeMenu}>Voices</a>

            <div className="lp-nav-actions">
              {authLoading ? (
                <span className="lp-auth-loading">Checking session...</span>
              ) : currentUser ? (
                <>
                  <div className="lp-user-chip" title={currentUser.fullName || 'Logged in user'}>
                    <span className="lp-user-avatar">{displayName.charAt(0).toUpperCase()}</span>
                    <span className="lp-user-name">Hi, {displayName}</span>
                  </div>
                  <Link to="/dashboard" className="lp-btn lp-btn-primary" onClick={closeMenu}>
                    Dashboard
                  </Link>
                  <button type="button" className="lp-btn lp-btn-outline" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="lp-btn lp-btn-outline" onClick={closeMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="lp-btn lp-btn-primary" onClick={closeMenu}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="lp-main">
        <section className="lp-hero">
          <div className="lp-hero-left">
            <p className="lp-eyebrow">A Modern Student Wellness Platform</p>
            <h1>
              Balance Your Mind, Boost Your Future with <span>UniWell</span>
            </h1>
            <p>
              UniWell helps students harmonize wellbeing, academic performance, neuro insights,
              and AI-powered career guidance in one calm and intuitive experience.
            </p>

            <div className="lp-hero-cta">
              <Link to="/register" className="lp-btn lp-btn-primary lp-btn-large">Get Started</Link>
              <a href="#features" className="lp-btn lp-btn-soft lp-btn-large">Explore Features</a>
            </div>
          </div>

          <div className="lp-hero-right" aria-hidden="true">
            <div className="lp-hero-card lp-card-main">
              <h3>UniWell Smart Dashboard</h3>
              <p>Wellness + GPA + AI insights in one place</p>
              <div className="lp-mini-stats">
                <span>Stress: Moderate</span>
                <span>GPA: 3.72</span>
                <span>Career Match: 85%</span>
              </div>
            </div>
            <div className="lp-hero-card lp-card-float">Neuro Card Ready ✅</div>
          </div>
        </section>

        <section id="features" className="lp-section lp-features">
          <div className="lp-section-head">
            <h2>Everything Students Need in One Platform</h2>
            <p>Designed to support both your academic goals and mental wellbeing journey.</p>
          </div>

          <div className="lp-feature-grid">
            <article className="lp-feature-card">
              <div className="lp-feature-icon">🌸</div>
              <h3>Stress Management & Wellbeing</h3>
              <p>Guided reflection, stress check-ins, and practical techniques to stay calm and focused.</p>
            </article>
            <article className="lp-feature-card">
              <div className="lp-feature-icon">📘</div>
              <h3>Academic Performance & GPA Tracking</h3>
              <p>Track grades, study habits, and progress milestones with a clean academic overview.</p>
            </article>
            <article className="lp-feature-card">
              <div className="lp-feature-icon">🧠</div>
              <h3>Neuro Card</h3>
              <p>Understand your personal learning and wellness profile to improve outcomes.</p>
            </article>
            <article className="lp-feature-card">
              <div className="lp-feature-icon">🤖</div>
              <h3>AI-Powered Quizzes</h3>
              <p>Adaptive quizzes and smart recommendations based on your learning behavior.</p>
            </article>
            <article className="lp-feature-card">
              <div className="lp-feature-icon">🎯</div>
              <h3>Career Recommendation & Guidance</h3>
              <p>Get role suggestions and personalized growth paths from AI-driven insights.</p>
            </article>
            <article className="lp-feature-card">
              <div className="lp-feature-icon">📊</div>
              <h3>Smart Student Dashboard</h3>
              <p>One unified dashboard for wellbeing, academics, habits, and future readiness.</p>
            </article>
          </div>
        </section>

        <section id="about" className="lp-section lp-about">
          <div className="lp-about-content">
            <h2>Why UniWell Matters</h2>
            <p>
              University life is more than grades. UniWell brings wellbeing awareness, academic
              management, and career development together so students can thrive with balance.
            </p>
            <p>
              Instead of switching between disconnected tools, students get one trusted platform
              for monitoring growth and making better daily decisions.
            </p>
          </div>

          <div className="lp-about-card">
            <h3>One Platform. Complete Student Growth.</h3>
            <ul>
              <li>Wellness insights with actionable guidance</li>
              <li>Academic progress and GPA visibility</li>
              <li>Career readiness powered by AI intelligence</li>
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="lp-section lp-steps">
          <div className="lp-section-head">
            <h2>How It Works</h2>
          </div>
          <div className="lp-step-grid">
            <article className="lp-step-card">
              <span>01</span>
              <h3>Sign Up</h3>
              <p>Create your UniWell account in minutes.</p>
            </article>
            <article className="lp-step-card">
              <span>02</span>
              <h3>Complete Profile / Neuro Info</h3>
              <p>Set your academic and personal wellness baseline.</p>
            </article>
            <article className="lp-step-card">
              <span>03</span>
              <h3>Track Wellbeing & Academics</h3>
              <p>Monitor progress with clear dashboards and cards.</p>
            </article>
            <article className="lp-step-card">
              <span>04</span>
              <h3>Get AI Insights & Career Guidance</h3>
              <p>Receive personalized recommendations for growth.</p>
            </article>
          </div>
        </section>

        <section className="lp-section lp-stats">
          <div className="lp-stat-card">
            <h3>1000+</h3>
            <p>Students Supported</p>
          </div>
          <div className="lp-stat-card">
            <h3>95%</h3>
            <p>User Satisfaction</p>
          </div>
          <div className="lp-stat-card">
            <h3>AI-Based</h3>
            <p>Personalized Insights</p>
          </div>
          <div className="lp-stat-card">
            <h3>All-in-One</h3>
            <p>Wellness + Academic Monitoring</p>
          </div>
        </section>

        <section id="preview" className="lp-section lp-preview">
          <div className="lp-section-head">
            <h2>Dashboard Preview</h2>
          </div>
          <div className="lp-preview-grid">
            <article className="lp-preview-card lp-preview-main">
              <h3>Weekly Progress</h3>
              <div className="lp-preview-bars">
                <span style={{ height: '50%' }} />
                <span style={{ height: '65%' }} />
                <span style={{ height: '58%' }} />
                <span style={{ height: '72%' }} />
                <span style={{ height: '84%' }} />
                <span style={{ height: '76%' }} />
                <span style={{ height: '90%' }} />
              </div>
            </article>
            <article className="lp-preview-card">
              <h3>Career Suggestions</h3>
              <p>Data Science • 85% Match</p>
              <p>UX Design • 72% Match</p>
              <p>Project Mgmt • 68% Match</p>
            </article>
            <article className="lp-preview-card">
              <h3>Wellbeing Snapshot</h3>
              <p>Stress Level: Moderate</p>
              <p>Focus Score: 78%</p>
              <p>Sleep Quality: Improving</p>
            </article>
          </div>
        </section>

        <section id="testimonials" className="lp-section lp-testimonials">
          <div className="lp-section-head">
            <h2>Student Voices</h2>
          </div>
          <div className="lp-testimonial-grid">
            <article className="lp-testimonial-card">
              <div className="lp-avatar">R</div>
              <p>“UniWell helped me improve both my stress habits and GPA in one semester.”</p>
              <h4>Rashmika • Computing</h4>
            </article>
            <article className="lp-testimonial-card">
              <div className="lp-avatar">A</div>
              <p>“The AI career guidance gave me confidence in choosing a specialization path.”</p>
              <h4>Ashen • Engineering</h4>
            </article>
            <article className="lp-testimonial-card">
              <div className="lp-avatar">N</div>
              <p>“The dashboard is simple, clean, and truly student-friendly for daily use.”</p>
              <h4>Nethmi • Business</h4>
            </article>
          </div>
        </section>

        <section className="lp-final-cta">
          <h2>Ready to Start Your UniWell Journey?</h2>
          <p>Join students building healthier minds and stronger futures.</p>
          <Link to="/register" className="lp-btn lp-btn-primary lp-btn-large">Create Your Account</Link>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div>
            <div className="lp-brand lp-footer-brand">
              <img src="/logo.png" alt="UniWell Logo" className="lp-brand-logo" />
              <div className="lp-brand-text">
                <span className="lp-brand-title">UniWell</span>
                <span className="lp-brand-subtitle">Student Management System</span>
              </div>
            </div>
            <p className="lp-footer-about">
              Supporting student wellbeing, academics, and career growth through one modern platform.
            </p>
          </div>

          <div className="lp-footer-links">
            <h4>Quick Links</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
          </div>

          <div className="lp-footer-links">
            <h4>Connect</h4>
            <a href="#social">LinkedIn</a>
            <a href="#social">Instagram</a>
            <a href="#social">Email Support</a>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} UniWell Student Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
