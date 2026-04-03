/**
 * FlashcardViewer
 * Displays flashcards and lets user flip question/answer.
 */

import { useMemo, useState } from 'react';

const FlashcardViewer = ({
  flashcards = [],
  loading = false,
  error = '',
  onEdit,
  onDelete
}) => {
  const [revealedId, setRevealedId] = useState(null);

  const cardContent = useMemo(() => {
    return flashcards || [];
  }, [flashcards]);

  if (loading) {
    return <div className="loading">Loading flashcards...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (cardContent.length === 0) {
    return <div className="no-data">No flashcards yet. Add one to get started.</div>;
  }

  return (
    <div className="flashcards-list">
      {cardContent.map((card) => {
        const isRevealed = revealedId === card._id;
        return (
          <div key={card._id} className="flashcard-item">
            <div className="flashcard-top">
              <span className="flashcard-subject">{card.subject}</span>
              <div className="flashcard-actions-inline">
                <button
                  type="button"
                  className="btn btn-outline flashcard-action-btn"
                  onClick={() => onEdit(card)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger flashcard-action-btn"
                  onClick={() => onDelete(card._id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <button
              type="button"
              className="flashcard-flip"
              onClick={() => setRevealedId((prev) => (prev === card._id ? null : card._id))}
              aria-expanded={isRevealed}
              aria-label={`Flip flashcard for subject ${card.subject}`}
            >
              <div className={`flashcard-3d ${isRevealed ? 'is-flipped' : ''}`}>
                <div className="flashcard-face flashcard-front">
                  <div className="flashcard-question">
                    <span className="flashcard-question-label">Q</span>
                    <span className="flashcard-question-text">{card.question}</span>
                  </div>
                  <div className="flashcard-hint">Click to flip</div>
                </div>

                <div className="flashcard-face flashcard-back">
                  <div className="flashcard-answer">
                    <span className="flashcard-answer-label">A</span>
                    <span className="flashcard-answer-text">{card.answer}</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FlashcardViewer;

