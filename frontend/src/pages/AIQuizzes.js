/**
 * AIQuizzes Page
 * PDF upload -> extract text -> AI generate MCQs -> save + view.
 */

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AIQuizUploadForm from '../components/AIQuizUploadForm';
import AIQuizViewer from '../components/AIQuizViewer';
import { aiQuizAPI } from '../api';

const AIQuizzes = () => {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');

  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsMessage, setAnalyticsMessage] = useState('');

  const fetchSavedQuizzes = async () => {
    setSavedLoading(true);
    try {
      const response = await aiQuizAPI.getMyQuizzes();
      if (response.data.success) {
        setSavedQuizzes(response.data.data.quizzes || []);
      }
    } catch (err) {
      // Non-blocking: allow generator to still work.
      setSavedQuizzes([]);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedQuizzes();
  }, []);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const response = await aiQuizAPI.getQuizAnalytics();
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      setAnalyticsError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (formData) => {
    setFormError('');
    setSaving(true);
    try {
      const response = await aiQuizAPI.generateQuizFromPdf(formData);
      if (response.data.success) {
        const { quiz } = response.data.data;
        setCurrentQuiz(quiz);
        setQuizError('');
        await fetchSavedQuizzes();
      } else {
        setFormError(response.data.message || 'Failed to generate quiz');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadQuiz = async (quizId) => {
    setQuizError('');
    setQuizLoading(true);
    try {
      const response = await aiQuizAPI.getQuizById(quizId);
      if (response.data.success) {
        setCurrentQuiz(response.data.data.quiz);
      }
    } catch (err) {
      setQuizError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    const ok = window.confirm('Delete this quiz?');
    if (!ok) return;

    setQuizError('');
    try {
      const response = await aiQuizAPI.deleteQuiz(quizId);
      if (response.data.success) {
        if (currentQuiz?._id === quizId) setCurrentQuiz(null);
        await fetchSavedQuizzes();
      }
    } catch (err) {
      setQuizError(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const handleSubmitAttempt = async (selectedOptions) => {
    if (!currentQuiz?._id) {
      throw new Error('No quiz selected');
    }

    setAnalyticsMessage('');
    setAnalyticsError('');

    await aiQuizAPI.submitQuizAttempt(currentQuiz._id, selectedOptions);
    await fetchAnalytics();
    setAnalyticsMessage('Saved! Analytics updated.');
  };

  return (
    <div>
      <Navbar />

      <div className="container">
        <div className="page-header">
          <h1>AI Quizzes 🤖</h1>
          <p>Upload a PDF, generate MCQs with AI, and save to your account.</p>
        </div>

        <div className="ai-quizzes-layout">
          <div className="ai-quizzes-left">
            <AIQuizUploadForm
              onGenerate={handleGenerate}
              saving={saving}
              errorMessage={formError}
            />

            <div className="dashboard-card ai-quizzes-saved">
              <div className="panel-header">
                <h2>Saved Quizzes</h2>
              </div>

              {savedLoading ? (
                <div className="loading">Loading saved quizzes...</div>
              ) : savedQuizzes.length === 0 ? (
                <div className="no-data">No saved quizzes yet. Generate one above.</div>
              ) : (
                <div className="saved-quizzes-list">
                  {savedQuizzes.map((q) => (
                    <button
                      key={q._id}
                      type="button"
                      className="saved-quiz-item"
                      onClick={() => handleLoadQuiz(q._id)}
                    >
                      <div className="saved-quiz-title">{q.quizTitle}</div>
                      <div className="saved-quiz-meta">
                        {q.subject ? `${q.subject} • ` : null}
                        {q.questionCount} Questions
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ai-quizzes-right">
            <div className="dashboard-card ai-quizzes-analytics">
              <div className="panel-header">
                <h2>Quiz Analytics</h2>
              </div>

              {analyticsMessage ? <div className="success-message" style={{ margin: '0 1.5rem 1rem 1.5rem' }}>{analyticsMessage}</div> : null}
              {analyticsLoading ? <div className="loading">Loading analytics...</div> : null}
              {analyticsError ? <div className="error-message">{analyticsError}</div> : null}

              {!analyticsLoading && !analyticsError && analytics ? (
                <div className="ai-analytics-body">
                  <div className="ai-analytics-kpis">
                    <div className="ai-analytics-kpi">
                      <div className="ai-analytics-kpi-value">{analytics.overall?.averageCorrectPercent || 0}%</div>
                      <div className="ai-analytics-kpi-label">Overall Accuracy</div>
                    </div>
                    <div className="ai-analytics-kpi">
                      <div className="ai-analytics-kpi-value">{analytics.overall?.attemptsCount || 0}</div>
                      <div className="ai-analytics-kpi-label">Attempts</div>
                    </div>
                  </div>

                  <div className="ai-analytics-sections">
                    <div className="ai-analytics-section">
                      <h3>What you&apos;re good at</h3>
                      {analytics.recommendations?.strengths?.length ? (
                        <div className="ai-analytics-list">
                          {analytics.recommendations.strengths.map((s, idx) => (
                            <div key={idx} className="ai-analytics-item">
                              <div className="ai-analytics-item-title">{s.label}</div>
                              <div className="ai-analytics-item-detail">{s.detail}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-data">Submit a result to see strengths.</div>
                      )}
                    </div>

                    <div className="ai-analytics-section">
                      <h3>Where to improve</h3>
                      {analytics.recommendations?.improvements?.length ? (
                        <div className="ai-analytics-list">
                          {analytics.recommendations.improvements.map((s, idx) => (
                            <div key={idx} className="ai-analytics-item">
                              <div className="ai-analytics-item-title">{s.label}</div>
                              <div className="ai-analytics-item-detail">{s.detail}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <AIQuizViewer
              quiz={currentQuiz}
              loading={quizLoading}
              error={quizError}
              onDelete={handleDelete}
              onSubmitAttempt={handleSubmitAttempt}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuizzes;

