/**
 * FlashcardForm
 * Create/update form for a single flashcard.
 */

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2'

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
  onCancel,
  isEmptyForm
}) => {
  const [formData, setFormData] = useState(emptyValues);

  useEffect(() => {
    if(!isEmptyForm){
    setFormData({
      subject: initialData?.subject ?? '',
      question: initialData?.question ?? '',
      answer: initialData?.answer ?? ''
    })}else{
      setFormData(emptyValues);
    };
  }, [initialData,isEmptyForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    if(formData.subject==''){
      Swal.fire({
        title: "Error",
        text: "Enter subject name",
        icon: "error"
      });
    }else if(formData.question==''){
      Swal.fire({
        title: "Error",
        text: "Enter Question",
        icon: "error"
      });
    }else if(formData.answer==''){
      Swal.fire({
        title: "Error",
        text: "Enter Answer",
        icon: "error"
      });
    }
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
            placeholder="e.g. Biology"
          />
        </div>

        <div className="form-group">
          <label>Question</label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleChange}
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

