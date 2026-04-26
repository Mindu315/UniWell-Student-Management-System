/**
 * AIQuizUploadForm
 * Upload PDF + choose generation parameters.
 */

import { useRef, useState } from 'react';

const AIQuizUploadForm = ({ onGenerate, saving, errorMessage }) => {
  const fileInputRef = useRef(null);

  const [questionCount, setQuestionCount] = useState(5);
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!file) {
      setLocalError('Please upload a PDF file.');
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setLocalError('Invalid file type. Please upload a PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('questionCount', String(questionCount));
    formData.append('subject', subject);
    formData.append('difficulty', difficulty);

    await onGenerate(formData);
  };

  return (
    <div className="dashboard-card ai-quiz-card">
      <div className="card-gradient-header">
        <h2>AI Quiz Generator</h2>
      </div>

      {errorMessage ? <div className="error-message" style={{ marginTop: '1rem' }}>{errorMessage}</div> : null}
      {localError ? <div className="error-message" style={{ marginTop: '1rem' }}>{localError}</div> : null}

      <form className="ai-quiz-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Upload PDF</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            required
          />
          {file ? <p className="ai-quiz-file-meta">Selected: {file.name}</p> : null}
        </div>

        <div className="form-group">
          <label>Number of Questions</label>
          <select value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="form-group">
          <label>Subject / Topic (optional)</label>
          <input
            type="text"
            value={subject}
            placeholder="e.g. Operating Systems"
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>

        <div className="ai-quiz-helper">
          <p>
            The backend extracts text from your PDF, generates MCQs with AI, and saves the quiz to your account.
          </p>
        </div>
      </form>
    </div>
  );
};

export default AIQuizUploadForm;

