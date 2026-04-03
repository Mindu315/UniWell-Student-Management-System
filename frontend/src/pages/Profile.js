/**
 * Profile Page
 * View and edit user profile
 * UniWell Student Management System
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authAPI, userAPI } from '../api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    faculty: '',
    degreeProgram: '',
    year: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const faculties = [
    'Computing',
    'Business',
    'Engineering',
    'Humanities and Sciences',
    'Architecture',
    'Graduate Studies and Research'
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        const userData = response.data.data.user;
        setUser(userData);
        setFormData({
          fullName: userData.fullName,
          faculty: userData.faculty,
          degreeProgram: userData.degreeProgram,
          year: userData.year
        });
      }
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await userAPI.updateMyProfile({
        ...formData,
        year: parseInt(formData.year)
      });

      if (response.data.success) {
        setSuccess('Profile updated successfully! 🎉');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container dashboard-main unified-page-shell">
          <div className="loading">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container dashboard-main unified-page-shell profile-page-shell">
        <div className="page-header">
          <h1>My Profile 👤</h1>
          <p>Manage your personal information and academic details</p>
        </div>

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-info-section">
              <h3>Account Information</h3>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Student ID:</strong> {user?.studentId}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p className="info-note">
                * Email, Student ID, and Role cannot be changed. Contact admin if needed.
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Faculty</label>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  required
                >
                  {faculties.map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Degree Program</label>
                <input
                  type="text"
                  name="degreeProgram"
                  value={formData.degreeProgram}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
