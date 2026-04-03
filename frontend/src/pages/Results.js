import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Results.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { careers, score, industryName } = location.state || { careers: [] };

  return (
    <div className="results-container">
      <div className="results-card">
        <h2 className="score-badge">Your Score: {score}</h2>
        <p>Based on your educational level, skills and quiz score <strong>{industryName}</strong>, we recommend:</p>

        <div className="career-list">
          {careers.length > 0 ? (
            careers.map((career, index) => (
              <div key={index} className="career-item">
                <h3>{career.title}</h3>
                <p>{career.description}</p>
                <span className="match-tag">Top Match</span>
              </div>
            ))
          ) : (
            <p>Sorry! We don not have specific match found for this score level yet.</p>
          )}
        </div>

        <button className="restart-btn" onClick={() => navigate('/')}>
          Back To Hub
        </button>
      </div>
    </div>
  );
};

export default Results;