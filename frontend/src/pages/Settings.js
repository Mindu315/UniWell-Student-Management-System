import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { userAPI } from '../api';

const defaultSettings = {
  theme: 'light',
  dashboardView: 'overview',
  emailNotifications: true,
  wellbeingReminders: true,
  studyReminders: false
};

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await userAPI.getMySettings();
        if (response.data?.success) {
          setSettings({
            ...defaultSettings,
            ...(response.data.data?.settings || {})
          });
        }
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateMySettings(settings);
      if (response.data?.success) {
        setSuccess('Settings updated successfully.');
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container dashboard-main unified-page-shell profile-page-shell">
        <div className="page-header">
          <h1>Settings ⚙️</h1>
          <p>Control your dashboard experience and reminders.</p>
        </div>

        <div className="profile-container">
          <div className="profile-card">
            {loading ? <div className="loading">Loading your settings...</div> : null}
            {!loading && error ? <div className="error-message">{error}</div> : null}
            {!loading && success ? <div className="success-message">{success}</div> : null}

            {!loading ? (
              <form onSubmit={handleSave} className="profile-form">
                <div className="form-group">
                  <label>Theme Mode</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings((prev) => ({ ...prev, theme: e.target.value }))}
                  >
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Dashboard View</label>
                  <select
                    value={settings.dashboardView}
                    onChange={(e) => setSettings((prev) => ({ ...prev, dashboardView: e.target.value }))}
                  >
                    <option value="overview">Overview</option>
                    <option value="focus">Focus</option>
                  </select>
                </div>

                <div className="settings-toggle-list">
                  <button type="button" className={`settings-toggle ${settings.emailNotifications ? 'is-on' : ''}`} onClick={() => handleToggle('emailNotifications')}>
                    <span>Email Notifications</span>
                    <span>{settings.emailNotifications ? 'On' : 'Off'}</span>
                  </button>
                  <button type="button" className={`settings-toggle ${settings.wellbeingReminders ? 'is-on' : ''}`} onClick={() => handleToggle('wellbeingReminders')}>
                    <span>Wellbeing Reminders</span>
                    <span>{settings.wellbeingReminders ? 'On' : 'Off'}</span>
                  </button>
                  <button type="button" className={`settings-toggle ${settings.studyReminders ? 'is-on' : ''}`} onClick={() => handleToggle('studyReminders')}>
                    <span>Study Reminders</span>
                    <span>{settings.studyReminders ? 'On' : 'Off'}</span>
                  </button>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
