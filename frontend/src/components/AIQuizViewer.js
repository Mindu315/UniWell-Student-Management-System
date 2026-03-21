/**
 * AIQuizViewer
 * Renders AI-generated MCQs and lets the user reveal answers.
 */

import { useEffect, useMemo, useState } from 'react';

const AIQuizViewer = ({ quiz, loading, error, onDelete, onSubmitAttempt }) => {
  const [answers, setAnswers] = useState({});
  const [reveal, setReveal] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(() => quiz?.questions || [], [quiz]);

  useEffect(() => {
    setAnswers({});
    setReveal(false);
    setSubmitError('');
    setSubmitting(false);
    setSubmitted(false);
  }, [quiz?._id]);

  useEffect(() => {
    if (!reveal) {
      // Allow resubmission after the student changes selections.
      setSubmitted(false);
      setSubmitError('');
    }
  }, [reveal]);

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!quiz) return <div className="no-data">Upload a PDF to generate your quiz.</div>;
  if (questions.length === 0) return <div className="no-data">No questions found in this quiz.</div>;

  const handleSelect = (qIndex, optionIndex) => {
    if (reveal) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const score = questions.reduce((acc, q, i) => {
    const selected = answers[i];
    if (typeof selected === 'number' && selected === q.correctOptionIndex) return acc + 1;
    return acc;
  }, 0);

  const handleSubmit = async () => {
    if (!reveal || submitted) return;
    if (typeof onSubmitAttempt !== 'function') return;

    setSubmitError('');

    const selectedOptions = questions.map((_, idx) => answers[idx]);
    const allAnswered = selectedOptions.every((v) => typeof v === 'number' && Number.isInteger(v));
    if (!allAnswered) {
      setSubmitError('Please select an option for every question before saving.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitAttempt(selectedOptions);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-card ai-quiz-viewer">
      <div className="page-header" style={{ marginBottom: '1rem', padding: '1.25rem 1.5rem' }}>
        <h1 style={{ marginBottom: '0.4rem' }}>{quiz.quizTitle}</h1>
        <p style={{ marginBottom: 0 }}>
          {quiz.subject ? <strong>{quiz.subject}</strong> : null}
          {quiz.subject ? ' • ' : null}
          Difficulty: <strong>{quiz.difficulty}</strong> • Questions: <strong>{quiz.questionCount}</strong>
        </p>
      </div>

      <div className="ai-quiz-controls">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setReveal(false)}
          disabled={!reveal}
        >
          Hide Answers
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setReveal(true)}
          disabled={reveal}
        >
          Reveal Answers
        </button>
        {typeof onDelete === 'function' ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onDelete(quiz._id)}
          >
            Delete
          </button>
        ) : null}
      </div>

      {reveal ? (
        <div className="ai-quiz-score">
          Score: <strong>{score}</strong> / <strong>{questions.length}</strong>
        </div>
      ) : (
        <div className="ai-quiz-score" style={{ color: '#6B7280' }}>
          Select an option for each question, then click “Reveal Answers”.
        </div>
      )}

      {reveal ? (
        <div className="ai-quiz-submit-row">
          {submitError ? <div className="error-message ai-quiz-submit-error">{submitError}</div> : null}
          {typeof onSubmitAttempt === 'function' ? (
            <button
              type="button"
              className="btn btn-lotus"
              onClick={handleSubmit}
              disabled={submitted || submitting}
            >
              {submitting ? 'Saving...' : submitted ? 'Result Saved' : 'Save Result & View Analytics'}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="ai-quiz-questions">
        {questions.map((q, qIndex) => {
          const selected = answers[qIndex];
          return (
            <div key={qIndex} className="ai-quiz-question">
              <div className="ai-quiz-question-title">
                <span className="ai-quiz-qnum">{qIndex + 1}</span>
                <span>{q.question}</span>
              </div>

              <div className="ai-quiz-options">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selected === optIndex;
                  const isCorrect = reveal && optIndex === q.correctOptionIndex;
                  const isWrong = reveal && isSelected && optIndex !== q.correctOptionIndex;
                  const optionClass = isCorrect ? 'is-correct' : isWrong ? 'is-wrong' : isSelected ? 'is-selected' : '';

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      className={`ai-quiz-option ${optionClass}`}
                      onClick={() => handleSelect(qIndex, optIndex)}
                    >
                      <span className="ai-quiz-option-letter">{String.fromCharCode(65 + optIndex)}</span>
                      <span className="ai-quiz-option-text">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {reveal ? (
                <div className="ai-quiz-explanation">
                  <strong>Explanation:</strong> {q.explanation || '—'}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIQuizViewer;

