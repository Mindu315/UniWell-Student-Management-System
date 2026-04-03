import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/Results.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    careers = [],
    score = 0,
    industryName = 'your selected industry'
  } = location.state || {};

  return (
    <div>
      <Navbar />
      <div className="container dashboard-main unified-page-shell career-workspace-shell">
        <div className="career-panel results-shell">
          <h2 className="score-badge">Your Score: {score}</h2>
          <p>Based on your educational level, skills and quiz score <strong>{industryName}</strong>, we recommend:</p>

          <div className="career-list">
            {careers.length > 0 ? (
              careers.map((career, index) => (
                <div key={index} className="career-item">
                  <h3>{career.title || career.careerName}</h3>
                  <p>{career.description}</p>
                  <span className="match-tag">Top Match</span>
                </div>
              ))
            ) : (
              <p>Sorry! We do not have a specific match for this score level yet.</p>
            )}
          </div>

          <button className="restart-btn" onClick={() => navigate('/career-guidance')}>
            Back To Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
