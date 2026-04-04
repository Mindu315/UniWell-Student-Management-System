import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CareerAnalysisForm from '../components/CareerAnalysisForm';
import '../css/CareerGuidance.css';
import SalaryTrends from './SalaryTrends';
import CourseSuggestions from './CourseSuggestions';


const CareerGuidance = () => {
  const [view, setView] = useState('hub'); // hub or form
  

  return (
    <div>
      <Navbar />
      <div className="container dashboard-main unified-page-shell career-workspace-shell">
        {view === 'hub' && (
          <div className="hub-view">
            <header className="career-page-header">
              <p className="career-page-eyebrow">UniWell Career Lab</p>
              <h1 className="career-page-title">Design Your Future</h1>
              <p>Discover your perfect career, explore market salaries, and bridge your skill gaps with our guidance tools.</p>
            </header>

            <div className="hub-grid">
              <div className="hub-card"
              data-tone="career"
              style={{ backgroundImage: "url('/images/career.jpg')" }}
              onClick={() => setView('form')}>
                <div className="hub-card-preview">
                  <span className="hub-preview-chip">AI Match</span>
                  <h3>Career Recommendation</h3>
                </div>
                <div className='card-content'>
                <span className="hub-icon" aria-hidden="true">🎯</span>
                <h3>Career Recommendation</h3>
                <p>Unlock your ideal career path with AI-driven insights. Match your unique skills, education, and interests against real-world industry requirements to find the perfect professional fit.</p>
                <button className="hub-btn">Open Tool</button>
              </div>
              </div>

              <div className="hub-card"
              data-tone="salary"
              style={{ backgroundImage: "url('/images/salary.jpg')" }}
              onClick={() => setView('salary')}>
                <div className="hub-card-preview">
                  <span className="hub-preview-chip">Market Data</span>
                  <h3>Salary Trends</h3>
                </div>
                <div className='card-content'>
                <span className="hub-icon" aria-hidden="true">📈</span>
                <h3>Salary Trends</h3>
                <p>Explore your earning potential. View real-time market data for entry-level, mid-level, and professional roles across your target industries to plan your financial future.</p>
                <button className="hub-btn">Open Tool</button>
              </div>
              </div>

              <div className="hub-card"
              data-tone="courses"
              style={{ backgroundImage: "url('/images/welcome.jpg')" }}
              onClick={() => setView('courses')}>
                <div className="hub-card-preview">
                  <span className="hub-preview-chip">Skill Growth</span>
                  <h3>Course Suggestions</h3>
                </div>
                <div className='card-content'>
                <span className="hub-icon" aria-hidden="true">📚</span>
                <h3>Course Suggestions</h3>
                <p>Bridge your skill gaps with curated learning paths. Get personalized course suggestions from top platforms to master the specific technologies and tools required for your dream career.</p>
                <button className="hub-btn">Open Tool</button>
              </div>
              </div>
            </div>
          </div>
        ) } 
         {view === 'form' && (
          <div className="career-panel">
            <button className="back-btn" onClick={() => setView('hub')}>
              ← Back to Hub
            </button>
            <CareerAnalysisForm />
          </div>
        )}

        {view === 'salary' && (
          <div className="career-panel">
            <button className="back-btn" onClick={() => setView('hub')}>← Back to Hub</button>
            <SalaryTrends />
          </div>
        )}

        {view === 'courses' && (
          <div className="career-panel">
            <button className="back-btn" onClick={() => setView('hub')}>← Back to Hub</button>
            <CourseSuggestions />
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerGuidance;
