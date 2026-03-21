/**
 * FlashcardForm
 * Create/update form for a single flashcard.
 */

import { useEffect, useState } from 'react';

const emptyValues = {
  subject: '',
  question: '',
  answer: ''
};

const FlashcardForm = ({
  initialData,
  isEditing = false,
  saving = false,
  error = '',
  success = '',
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState(emptyValues);

  useEffect(() => {
    setFormData({
      subject: initialData?.subject ?? '',
      question: initialData?.question ?? '',
      answer: initialData?.answer ?? ''
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="dashboard-card flashcard-form">
      <div className="card-gradient-header">
        <h2>{isEditing ? 'Edit Flashcard' : 'Add Flashcard'}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form flashcard-form-inner">
        <div className="form-group">
          <label>Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="e.g. Biology"
          />
        </div>

        <div className="form-group">
          <label>Question</label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleChange}
            required
            placeholder="Write the question..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Answer</label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            required
            placeholder="Write the answer..."
            rows={4}
          />
        </div>

        <div className="form-actions">
          {isEditing ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          ) : null}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (isEditing ? 'Updating...' : 'Adding...') : isEditing ? 'Update Flashcard' : 'Add Flashcard'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlashcardForm;

