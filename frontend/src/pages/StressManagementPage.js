import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import { wellbeingAPI } from '../api';
import lotusImage from '../assets/Lotus.png';
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

const metricFields = [
  {
    key: 'energy',
    title: 'Energy Level'
  },
  {
    key: 'sleep',
    title: 'Sleep Quality'
  },
  {
    key: 'focus',
    title: 'Focus Level'
  },
  {
    key: 'stress',
    title: 'Stress Level'
  }
];

const defaultForm = {
  energy: 3,
  sleep: 3,
  focus: 3,
  stress: 3,
  note: ''
};

const SCORE_MIN = -7;
const SCORE_MAX = 13;

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

const getLocalDayKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const [activeInterface, setActiveInterface] = useState('daily');
  const trendChartRef = useRef(null);
  const [showTrendChart, setShowTrendChart] = useState(false);

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

  useEffect(() => {
    if (activeInterface !== 'insights') {
      setShowTrendChart(false);
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
        trendChartRef.current = null;
      }
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      setShowTrendChart(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      setShowTrendChart(false);
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
        trendChartRef.current = null;
      }
    };
  }, [activeInterface]);

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
    now.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const lastWeekEntries = history.filter((entry) => {
      const entryDate = new Date(entry.submittedAt);
      return entryDate >= sevenDaysAgo && entryDate <= now;
    });

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

    const scoreBuckets = lastWeekEntries.reduce((acc, entry) => {
      const date = new Date(entry.submittedAt);
      const key = getLocalDayKey(date);
      const score = Number(entry.score);

      if (!Number.isFinite(score)) {
        return acc;
      }

      if (!acc[key]) {
        acc[key] = { total: 0, count: 0 };
      }

      acc[key].total += score;
      acc[key].count += 1;

      return acc;
    }, {});

    const scoreTrend = Array.from({ length: 7 }, (_, offset) => {
      const dayDate = new Date(sevenDaysAgo);
      dayDate.setDate(sevenDaysAgo.getDate() + offset);

      const key = getLocalDayKey(dayDate);
      const bucket = scoreBuckets[key];
      const score = bucket ? Number((bucket.total / bucket.count).toFixed(1)) : null;

      return {
        key,
        label: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dateLabel: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score,
        hasData: score !== null
      };
    });

    return {
      avgEnergy: lastWeekEntries.length ? (sum.energy / lastWeekEntries.length).toFixed(1) : '--',
      avgSleep: lastWeekEntries.length ? (sum.sleep / lastWeekEntries.length).toFixed(1) : '--',
      avgFocus: lastWeekEntries.length ? (sum.focus / lastWeekEntries.length).toFixed(1) : '--',
      avgStress: lastWeekEntries.length ? (sum.stress / lastWeekEntries.length).toFixed(1) : '--',
      scoreTrend
    };
  }, [history]);

  const weeklyTrendChart = useMemo(() => {
    const points = weeklyInsights.scoreTrend;
    const hasAnyData = points.some((point) => point.hasData);

    return {
      hasAnyData,
      data: {
        labels: points.map((point) => point.label),
        datasets: [
          {
            label: 'Wellbeing Score',
            data: points.map((point) => (point.hasData ? point.score : null)),
            spanGaps: false,
            tension: 0.35,
            borderWidth: 3,
            borderColor: '#2f6db2',
            pointRadius: (context) => (Number.isFinite(context.raw) ? 7 : 0),
            pointHoverRadius: (context) => (Number.isFinite(context.raw) ? 9 : 0),
            pointBackgroundColor: (context) => (
              Number(context.raw) >= 4 ? '#1faa59' : '#d93025'
            ),
            pointHoverBackgroundColor: (context) => (
              Number(context.raw) >= 4 ? '#159347' : '#b3261e'
            ),
            pointBorderColor: '#ffffff',
            pointHoverBorderColor: '#ffffff',
            pointBorderWidth: 2.6,
            fill: true,
            backgroundColor: (context) => {
              const { chart } = context;
              const { ctx, chartArea } = chart;

              if (!chartArea) {
                return 'rgba(47, 109, 178, 0.24)';
              }

              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, 'rgba(47, 109, 178, 0.3)');
              gradient.addColorStop(1, 'rgba(47, 109, 178, 0.04)');
              return gradient;
            }
          }
        ]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: {
          duration: 550,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#143860',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 10,
            displayColors: false,
            callbacks: {
              title: (items) => {
                const idx = items?.[0]?.dataIndex ?? 0;
                return weeklyInsights.scoreTrend[idx]?.dateLabel || '';
              },
              label: (context) => (
                Number.isFinite(context.parsed.y) ? `Score: ${context.parsed.y}` : 'No check-in'
              )
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              color: '#2f4f7b',
              font: {
                size: 11,
                weight: 700
              }
            }
          },
          y: {
            min: SCORE_MIN,
            max: SCORE_MAX,
            ticks: {
              stepSize: 5,
              color: '#6984ad',
              font: {
                size: 10,
                weight: 700
              }
            },
            grid: {
              color: 'rgba(125, 153, 190, 0.25)',
              drawBorder: false
            }
          }
        }
      }
    };
  }, [weeklyInsights.scoreTrend]);

  const latestScore = latestResult?.score ?? '--';
  const currentCondition = latestResult?.conditionLabel || 'No data yet';
  const todaysStatus = latestResult && isSameDay(latestResult.submittedAt, new Date())
    ? 'Checked In'
    : 'Pending Check-In';

  const feedbackData = latestResult ? getConditionMeta(latestResult.conditionKey) : null;

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
            <p className="stress-breadcrumb">UniWell</p>
            <h1>Stress Management &amp; Wellbeing Awareness</h1>
            <p>
              Track your daily wellbeing, understand your stress status, and receive supportive
              recommendations to stay healthy and focused.
            </p>
          </div>
          <div className="stress-header-visual" aria-hidden="true">
            <img src={lotusImage} alt="" className="stress-header-visual-image" />
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
            <p className="card-meta">Your latest wellbeing score reflects your recent energy, sleep, focus, and stress levels</p>
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
          <article className="stress-block-card stress-checkin-card">
            <div className="stress-block-head">
              <h2>Daily Wellbeing Check-In</h2>
            </div>

            <form onSubmit={handleSubmit} className="stress-checkin-form">
              {metricFields.map((field) => (
                <div key={field.key} className="stress-rating-group">
                  <div className="stress-rating-label-row">
                    <label>{field.title}</label>
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

        <section className="stress-condition-grid">
          {conditionCards.map((card) => (
            <article key={card.key} className={`stress-condition-card condition-card-${card.key}`}>
              <p className={`stress-condition-pill ${conditionConfig[card.key].badgeClass}`}>{card.title}</p>
              <p>{card.description}</p>
            </article>
          ))}
        </section>

        <section className="stress-interface-switch" aria-label="Stress Management Interfaces">
          <button
            type="button"
            className={activeInterface === 'daily' ? 'stress-interface-btn is-active' : 'stress-interface-btn'}
            onClick={() => setActiveInterface('daily')}
          >
            Daily Check-In Interface
          </button>
          <button
            type="button"
            className={activeInterface === 'insights' ? 'stress-interface-btn is-active' : 'stress-interface-btn'}
            onClick={() => setActiveInterface('insights')}
          >
            Insights &amp; Tips Interface
          </button>
        </section>

        {activeInterface === 'insights' && (
          <div className="stress-secondary-stack">
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
                <div className="stress-line-chart">
                  {showTrendChart ? (
                    <Line
                      ref={trendChartRef}
                      data={weeklyTrendChart.data}
                      options={weeklyTrendChart.options}
                      width={640}
                      height={220}
                      redraw
                      aria-label="Seven day wellbeing score trend"
                    />
                  ) : null}

                  {!weeklyTrendChart.hasAnyData && (
                    <p className="trend-no-data">No check-ins available for this 7-day window yet.</p>
                  )}
                </div>
              </div>
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
        )}
      </div>
    </div>
  );
};

export default StressManagementPage;
