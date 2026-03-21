import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { wellbeingAPI } from '../api';
import '../css/StressManagementPage.css';

const scaleLabels = {
  positive: {
    1: 'Very Low',
    2: 'Low',
    3: 'Average',
    4: 'Good',
    5: 'Excellent'
  },
  stress: {
    1: 'Very Low',
    2: 'Mild',
    3: 'Moderate',
    4: 'High',
    5: 'Very High'
  }
};

const conditionConfig = {
  stable: {
    label: 'Stable',
    badgeClass: 'condition-stable',
    message: 'Your current wellbeing pattern looks balanced. Keep your healthy routine going.',
    suggestions: [
      'Maintain a consistent sleep schedule this week.',
      'Continue taking short study breaks every 45-60 minutes.',
      'Keep hydration and light movement in your daily routine.'
    ]
  },
  moderate: {
    label: 'Moderate Pressure',
    badgeClass: 'condition-moderate',
    message: 'You are under manageable pressure. Small adjustments can help prevent overload.',
    suggestions: [
      'Block 10 minutes for breathing or mindfulness today.',
      'Prioritize your top 3 tasks and reduce multitasking.',
      'Take one short recovery walk between study sessions.'
    ]
  },
  overwhelmed: {
    label: 'Overwhelmed',
    badgeClass: 'condition-overwhelmed',
    message: 'Your stress indicators are elevated. This is a good time to pause and reset.',
    suggestions: [
      'Break tasks into smaller steps and finish one at a time.',
      'Reach out to a friend, mentor, or classmate for support.',
      'Use grounding techniques like deep breathing for 5 minutes.'
    ]
  },
  critical: {
    label: 'Critical Stress',
    badgeClass: 'condition-critical',
    message: 'Your wellbeing needs immediate care. Please reduce pressure and seek support now.',
    suggestions: [
      'Pause non-urgent tasks and focus on rest and safety.',
      'Talk to someone you trust or contact student wellbeing support.',
      'If distress is severe, reach out to professional help immediately.'
    ]
  }
};

const getConditionMeta = (conditionKey) => {
  return conditionConfig[conditionKey] || conditionConfig.moderate;
};

const conditionCards = [
  {
    key: 'stable',
    title: 'Stable',
    description: 'Balanced energy, sleep, and focus with manageable stress. You are coping well and staying steady.'
  },
  {
    key: 'moderate',
    title: 'Moderate Pressure',
    description: 'Signs of pressure are present, but still manageable. Early recovery actions can help you stay in control.'
  },
  {
    key: 'overwhelmed',
    title: 'Overwhelmed',
    description: 'Stress is affecting your energy and concentration. Slow down and use support strategies consistently.'
  },
  {
    key: 'critical',
    title: 'Critical Stress',
    description: 'High stress is strongly impacting wellbeing. Prioritize immediate support and reduce demands.'
  }
];

const awarenessTips = [
  'Keep a consistent sleep routine, even on weekends.',
  'Take regular breaks while studying to reduce mental fatigue.',
  'Stay hydrated and eat balanced meals during busy days.',
  'Watch for burnout signs like exhaustion, irritability, and poor focus.',
  'Speak to trusted people or student support when you feel overwhelmed.'
];

const noteTemplates = [
  'Deadline pressure from multiple assignments this week.',
  'Slept late after exam prep and felt low energy in lectures.',
  'Group project conflict increased stress today.',
  'Felt better after a short evening walk and proper dinner.'
];

const realWorldSamples = [
  {
    title: 'Exam Week Pressure',
    context: 'You are preparing for two exams and sleeping less than usual.',
    suggestion: 'Use a 45-minute focus block + 10-minute recovery cycle and protect sleep time.'
  },
  {
    title: 'Group Project Tension',
    context: 'Team communication is unclear and deadlines feel rushed.',
    suggestion: 'Set a short team sync, split tasks clearly, and confirm one realistic timeline.'
  },
  {
    title: 'Burnout Warning Signs',
    context: 'You feel tired, irritable, and less motivated for classes.',
    suggestion: 'Reduce low-priority tasks for 24 hours and focus on sleep, hydration, and support.'
  }
];

const metricFields = [
  {
    key: 'energy',
    title: 'Energy Level',
    helper: '1 = Very Low, 5 = Excellent'
  },
  {
    key: 'sleep',
    title: 'Sleep Quality',
    helper: '1 = Very Poor, 5 = Excellent'
  },
  {
    key: 'focus',
    title: 'Focus Level',
    helper: '1 = Very Low, 5 = Excellent'
  },
  {
    key: 'stress',
    title: 'Stress Level',
    helper: '1 = Very Low, 5 = Very High'
  }
];

const defaultForm = {
  energy: 3,
  sleep: 3,
  focus: 3,
  stress: 3,
  note: ''
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const isSameDay = (a, b) => {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

const StressManagementPage = () => {
  const [formData, setFormData] = useState(defaultForm);
  const [history, setHistory] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await wellbeingAPI.getMyCheckins(50);
        const records = response.data?.data?.checkins || [];
        setHistory(records);
        if (records[0]) {
          setLatestResult(records[0]);
        }
      } catch (apiError) {
        setError('Failed to load wellbeing history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleMetricChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setShowSuccessPopup(false);
    setSubmitting(true);

    try {
      const payload = {
        energy: Number(formData.energy),
        sleep: Number(formData.sleep),
        focus: Number(formData.focus),
        stress: Number(formData.stress),
        note: formData.note
      };

      const response = await wellbeingAPI.createCheckin(payload);
      const record = response.data?.data?.checkin;

      if (!record) {
        throw new Error('Invalid check-in response');
      }

      const updatedHistory = [record, ...history].sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );

      setHistory(updatedHistory);
      setLatestResult(record);
      setFormData((prev) => ({
        ...prev,
        note: ''
      }));
      setShowSuccessPopup(true);

      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 2200);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const weeklyCheckIns = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);

    return history.filter((entry) => {
      const entryDate = new Date(entry.submittedAt);
      return entryDate >= sevenDaysAgo && entryDate <= now;
    }).length;
  }, [history]);

  const weeklyInsights = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);

    const lastWeekEntries = history.filter((entry) => {
      const entryDate = new Date(entry.submittedAt);
      return entryDate >= sevenDaysAgo && entryDate <= now;
    });

    if (lastWeekEntries.length === 0) {
      return {
        avgEnergy: '--',
        avgSleep: '--',
        avgFocus: '--',
        avgStress: '--',
        scoreTrend: []
      };
    }

    const sum = lastWeekEntries.reduce(
      (acc, entry) => {
        acc.energy += Number(entry.energy || 0);
        acc.sleep += Number(entry.sleep || 0);
        acc.focus += Number(entry.focus || 0);
        acc.stress += Number(entry.stress || 0);
        return acc;
      },
      { energy: 0, sleep: 0, focus: 0, stress: 0 }
    );

    const sortedAsc = [...lastWeekEntries].sort(
      (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
    );

    return {
      avgEnergy: (sum.energy / lastWeekEntries.length).toFixed(1),
      avgSleep: (sum.sleep / lastWeekEntries.length).toFixed(1),
      avgFocus: (sum.focus / lastWeekEntries.length).toFixed(1),
      avgStress: (sum.stress / lastWeekEntries.length).toFixed(1),
      scoreTrend: sortedAsc.slice(-7).map((entry) => ({
        label: new Date(entry.submittedAt).toLocaleDateString('en-US', { weekday: 'short' }),
        score: Number(entry.score)
      }))
    };
  }, [history]);

  const latestScore = latestResult?.score ?? '--';
  const currentCondition = latestResult?.conditionLabel || 'No data yet';
  const todaysStatus = latestResult && isSameDay(latestResult.submittedAt, new Date())
    ? 'Checked In'
    : 'Pending Check-In';

  const feedbackData = latestResult ? getConditionMeta(latestResult.conditionKey) : null;

  const applyNoteTemplate = (text) => {
    setFormData((prev) => ({
      ...prev,
      note: text
    }));
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading wellbeing data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      {showSuccessPopup && (
        <div className="stress-success-overlay" role="status" aria-live="polite">
          <div className="stress-success-popup">
            <h3>Submitted Successfully</h3>
            <p>Your daily wellbeing check-in has been saved.</p>
            <button
              type="button"
              className="stress-success-close"
              onClick={() => setShowSuccessPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="container dashboard-main stress-page">
        <section className="stress-header-card">
          <div>
            <p className="stress-breadcrumb">UniWell / Stress & Wellbeing</p>
            <h1>Stress Management &amp; Wellbeing Awareness</h1>
            <p>
              Track your daily wellbeing, understand your stress status, and receive supportive
              recommendations to stay healthy and focused.
            </p>
          </div>
          <div className="stress-header-visual" aria-hidden="true">
            <span>SM</span>
            <p>Daily Care</p>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}

        <section className="stress-summary-grid">
          <article className="stress-summary-card stress-summary-status">
            <p className="card-kicker">Today&apos;s Status</p>
            <h3>{todaysStatus}</h3>
            <p className="card-meta">Submit one check-in each day for better trend tracking.</p>
          </article>

          <article className="stress-summary-card stress-summary-score">
            <p className="card-kicker">Latest Wellbeing Score</p>
            <h3>{latestScore}</h3>
            <p className="card-meta">Score = (Energy + Sleep + Focus) - (Stress x 2)</p>
          </article>

          <article className="stress-summary-card stress-summary-condition">
            <p className="card-kicker">Current Condition</p>
            <h3>{currentCondition}</h3>
            <p className="card-meta">Condition updates every time you submit a check-in.</p>
          </article>

          <article className="stress-summary-card stress-summary-weekly">
            <p className="card-kicker">Weekly Check-ins</p>
            <h3>{weeklyCheckIns}</h3>
            <p className="card-meta">Check-ins recorded in the past 7 days.</p>
          </article>
        </section>

        <section className="stress-main-grid">
          <article className="stress-block-card">
            <div className="stress-block-head">
              <h2>Daily Wellbeing Check-In</h2>
              <p>Use the 1-5 scale to describe today.</p>
            </div>

            <form onSubmit={handleSubmit} className="stress-checkin-form">
              {metricFields.map((field) => (
                <div key={field.key} className="stress-rating-group">
                  <div className="stress-rating-label-row">
                    <label>{field.title}</label>
                    <span>{field.helper}</span>
                  </div>

                  <div className="stress-rating-options" role="group" aria-label={field.title}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={`${field.key}-${value}`}
                        type="button"
                        className={
                          formData[field.key] === value
                            ? 'stress-rate-btn is-active'
                            : 'stress-rate-btn'
                        }
                        onClick={() => handleMetricChange(field.key, value)}
                        aria-pressed={formData[field.key] === value}
                      >
                        <span className="rate-number">{value}</span>
                        <span className="rate-text">
                          {field.key === 'stress'
                            ? scaleLabels.stress[value]
                            : scaleLabels.positive[value]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="stress-note-group">
                <label htmlFor="wellbeing-note">Would you like to note anything about today?</label>
                <textarea
                  id="wellbeing-note"
                  value={formData.note}
                  onChange={(event) => setFormData((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Optional: share study pressure, mood, or anything important today..."
                  rows={4}
                />
              </div>

              <button className="btn btn-primary stress-submit-btn" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Check-In'}
              </button>
            </form>
          </article>

          <div className="stress-side-stack">
            <article className="stress-block-card stress-result-card">
              <div className="stress-block-head">
                <h2>Wellbeing Result</h2>
                <p>Latest assessment based on your check-in.</p>
              </div>

              {latestResult ? (
                <div className="stress-result-body">
                  <div className="stress-score-bubble">
                    <p>Wellbeing Score</p>
                    <h3>{latestResult.score}</h3>
                  </div>
                  <p className={`stress-condition-badge ${getConditionMeta(latestResult.conditionKey).badgeClass}`}>
                    {latestResult.conditionLabel}
                  </p>
                  <p className="stress-result-text">
                    {getConditionMeta(latestResult.conditionKey).message}
                  </p>
                  <p className="stress-result-date">Last submitted: {formatDate(latestResult.submittedAt)}</p>
                </div>
              ) : (
                <p className="stress-empty-state">
                  Submit your first check-in to view score, condition classification, and explanation.
                </p>
              )}
            </article>

            <article className="stress-block-card stress-feedback-card">
              <div className="stress-block-head">
                <h2>Supportive Feedback</h2>
                <p>Small, practical actions for today.</p>
              </div>

              {feedbackData ? (
                <div className="stress-feedback-body">
                  <p className="stress-feedback-message">{feedbackData.message}</p>
                  <ul>
                    {feedbackData.suggestions.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="stress-empty-state">
                  Feedback and suggested actions will appear after you submit a check-in.
                </p>
              )}
            </article>
          </div>
        </section>

        <section className="stress-block-card stress-insights-card">
          <div className="stress-block-head">
            <h2>Weekly Insight Snapshot</h2>
            <p>Simple analytics to help you spot patterns early.</p>
          </div>

          <div className="stress-insight-metrics">
            <article>
              <p>Avg Energy</p>
              <h4>{weeklyInsights.avgEnergy}</h4>
            </article>
            <article>
              <p>Avg Sleep</p>
              <h4>{weeklyInsights.avgSleep}</h4>
            </article>
            <article>
              <p>Avg Focus</p>
              <h4>{weeklyInsights.avgFocus}</h4>
            </article>
            <article>
              <p>Avg Stress</p>
              <h4>{weeklyInsights.avgStress}</h4>
            </article>
          </div>

          <div className="stress-mini-trend">
            {weeklyInsights.scoreTrend.length === 0 ? (
              <p className="stress-empty-state">Your score trend will appear after a few check-ins.</p>
            ) : (
              weeklyInsights.scoreTrend.map((point, index) => {
                const height = Math.max(18, Math.min(100, ((point.score + 5) / 20) * 100));
                return (
                  <div key={`${point.label}-${index}`} className="trend-item">
                    <span className="trend-bar" style={{ height: `${height}%` }} />
                    <p>{point.label}</p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="stress-condition-grid">
          {conditionCards.map((card) => (
            <article key={card.key} className="stress-condition-card">
              <p className={`stress-condition-pill ${conditionConfig[card.key].badgeClass}`}>{card.title}</p>
              <p>{card.description}</p>
            </article>
          ))}
        </section>

        <section className="stress-block-card stress-history-card">
          <div className="stress-block-head">
            <h2>Wellbeing History / Trend</h2>
            <p>Review your previous records and identify patterns.</p>
          </div>

          <div className="stress-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Energy</th>
                  <th>Sleep</th>
                  <th>Focus</th>
                  <th>Stress</th>
                  <th>Score</th>
                  <th>Condition</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="stress-table-empty">
                      No records yet. Your submitted check-ins will appear here.
                    </td>
                  </tr>
                ) : (
                  history.slice(0, 10).map((entry) => (
                    <tr key={entry._id || entry.id}>
                      <td>{formatDate(entry.submittedAt)}</td>
                      <td>{entry.energy}</td>
                      <td>{entry.sleep}</td>
                      <td>{entry.focus}</td>
                      <td>{entry.stress}</td>
                      <td>{entry.score}</td>
                      <td>
                        <span className={`stress-table-condition ${getConditionMeta(entry.conditionKey).badgeClass}`}>
                          {entry.conditionLabel}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stress-block-card stress-samples-card">
          <div className="stress-block-head">
            <h2>Real-World Student Scenarios</h2>
            <p>Examples based on common university stress situations.</p>
          </div>

          <div className="stress-samples-grid">
            {realWorldSamples.map((sample) => (
              <article key={sample.title} className="stress-sample-item">
                <h4>{sample.title}</h4>
                <p><strong>Situation:</strong> {sample.context}</p>
                <p><strong>Helpful Response:</strong> {sample.suggestion}</p>
              </article>
            ))}
          </div>

          <div className="stress-note-templates">
            <p>Quick note templates (tap to use):</p>
            <div className="template-chip-wrap">
              {noteTemplates.map((template) => (
                <button
                  key={template}
                  type="button"
                  className="template-chip"
                  onClick={() => applyNoteTemplate(template)}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="stress-tips-banner">
          <div className="stress-block-head">
            <h2>Wellbeing Tips &amp; Awareness</h2>
            <p>Healthy routines can protect both mental wellbeing and academic performance.</p>
          </div>
          <ul>
            {awarenessTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default StressManagementPage;
