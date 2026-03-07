/**
 * Login Page
 * User authentication
 * UniWell Student Management System - Modern Split-Screen Design
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, setToken } from '../api';
import '../css/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Save token to localStorage
        setToken(token);

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      {/* Left Side - Branded Visual Area */}
      <div className="login-brand-section">
        <div className="login-brand-content">
          <div className="brand-logo-area">
            <div className="brand-logo-circle">
              <img src="/logo.png" alt="UniWell Logo" className="brand-logo-img" />
            </div>
            <h1 className="brand-title">UniWell</h1>
            <p className="brand-tagline">Student Management System</p>
          </div>
          
          <div className="brand-welcome">
            <h2 className="welcome-title">Balance Your Mind,<br />Boost Your Future</h2>
            <p className="welcome-description">
              Your comprehensive platform for student wellbeing, academic growth, 
              and AI-powered guidance. Join thousands of students on their journey to success.
            </p>
          </div>

          <div className="brand-features">
            <div className="brand-feature-item">
              <span className="feature-icon">🎓</span>
              <span className="feature-text">Academic Excellence</span>
            </div>
            <div className="brand-feature-item">
              <span className="feature-icon">🌸</span>
              <span className="feature-text">Mental Wellness</span>
            </div>
            <div className="brand-feature-item">
              <span className="feature-icon">🤖</span>
              <span className="feature-text">AI Guidance</span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="brand-decoration decoration-1"></div>
          <div className="brand-decoration decoration-2"></div>
          <div className="brand-decoration decoration-3"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-form-card">
            {/* Form Header */}
            <div className="login-header">
              <h2 className="login-title">Welcome Back!</h2>
              <p className="login-subtitle">Sign in to continue your wellness journey</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="login-error-alert">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Field */}
              <div className="form-field">
                <label htmlFor="email" className="field-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@university.edu"
                    className="field-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-field">
                <label htmlFor="password" className="field-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="field-input"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="remember-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-label">Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="login-footer">
              <p className="footer-text">
                Don't have an account? 
                <Link to="/register" className="register-link"> Create one now</Link>
              </p>
            </div>

            {/* Additional Links */}
            <div className="login-help-links">
              <Link to="/" className="help-link">← Back to Home</Link>
              <span className="help-divider">•</span>
              <a href="#help" className="help-link">Need Help?</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
