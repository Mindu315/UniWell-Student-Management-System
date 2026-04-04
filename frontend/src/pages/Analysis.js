import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { aiQuizAPI, authAPI, flashcardAPI, wellbeingAPI } from '../api';

const Analysis = () => {
  const [user, setUser] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const [userResult, checkinResult, flashcardResult, analyticsResult] = await Promise.allSettled([
          authAPI.getMe(),
          wellbeingAPI.getMyCheckins(14),
          flashcardAPI.getFlashcards(),
          aiQuizAPI.getQuizAnalytics()
        ]);

        if (userResult.status === 'fulfilled' && userResult.value.data?.success) {
          setUser(userResult.value.data.data.user);
        }

        if (checkinResult.status === 'fulfilled') {
          setCheckins(checkinResult.value.data?.data?.checkins || []);
        }

        if (flashcardResult.status === 'fulfilled') {
          setFlashcards(flashcardResult.value.data?.data?.flashcards || []);
        }

        if (analyticsResult.status === 'fulfilled') {
          setAnalytics(analyticsResult.value.data?.data || null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  const wellbeingAverage = useMemo(() => {
    if (!checkins.length) return '0.0';
    const avg = checkins.reduce((sum, item) => sum + Number(item.score || 0), 0) / checkins.length;
    return avg.toFixed(1);
  }, [checkins]);

  const topStrengths = analytics?.recommendations?.strengths || [];
  const topImprovements = analytics?.recommendations?.improvements || [];

  return (
    <div>
      <Navbar />
      <div className="container dashboard-main unified-page-shell analysis-page-shell">
        <div className="page-header">
          <h1>Analysis Hub 📊</h1>
          <p>Review your academic, quiz, and wellbeing patterns in one place.</p>
        </div>

        {loading ? <div className="loading">Loading your analysis...</div> : null}

        {!loading ? (
          <>
            <section className="dashboard-summary-grid">
              <article className="summary-card stress-card">
                <div className="summary-icon">🌿</div>
                <h3>Wellbeing Average</h3>
                <p className="summary-value">{wellbeingAverage}</p>
              </article>

              <article className="summary-card gpa-card">
                <div className="summary-icon">🃏</div>
                <h3>Flashcards Created</h3>
                <p className="summary-value">{flashcards.length}</p>
              </article>

              <article className="summary-card quiz-card">
                <div className="summary-icon">🤖</div>
                <h3>Quiz Accuracy</h3>
                <p className="summary-value">{analytics?.overall?.averageCorrectPercent || 0}%</p>
              </article>

              <article className="summary-card neuro-card">
                <div className="summary-icon">👤</div>
                <h3>Current Program</h3>
                <p className="summary-value"><small>{user?.degreeProgram || 'Not set'}</small></p>
              </article>
            </section>

            <section className="dashboard-insights-grid">
              <article className="dashboard-panel">
                <div className="panel-header">
                  <h2>Strengths</h2>
                </div>
                <div className="career-list">
                  {topStrengths.length ? topStrengths.map((item) => (
                    <div key={item.label} className="career-item">
                      <div className="career-item-head">
                        <span className="career-icon">✅</span>
                        <div>
                          <p className="career-title">{item.label}</p>
                          <p className="career-match">{item.detail}</p>
                        </div>
                      </div>
                    </div>
                  )) : <div className="no-data">Submit AI quiz attempts to unlock strengths.</div>}
                </div>
              </article>

              <article className="dashboard-panel">
                <div className="panel-header">
                  <h2>Improvement Areas</h2>
                </div>
                <div className="career-list">
                  {topImprovements.length ? topImprovements.map((item) => (
                    <div key={item.label} className="career-item">
                      <div className="career-item-head">
                        <span className="career-icon">🎯</span>
                        <div>
                          <p className="career-title">{item.label}</p>
                          <p className="career-match">{item.detail}</p>
                        </div>
                      </div>
                    </div>
                  )) : <div className="no-data">Keep using the platform and your next focus areas will appear here.</div>}
                </div>
              </article>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Analysis;
