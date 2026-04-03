import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'; // Path to your sidebar
import CareerAnalysisForm from '../components/CareerAnalysisForm';
import '../css/CareerGuidance.css';
import SalaryTrends from './SalaryTrends';
import CourseSuggestions from './CourseSuggestions';


const CareerGuidance = () => {
  const [view, setView] = useState('hub'); // hub or form
  

  return (
    <div className="uniwell-container">
      <Sidebar isAdmin={false} />
      
      <main className="uniwell-main">
        {view === 'hub' && (
          <div className="hub-view">
            
            <header className="page-header">
              <h1>Design Your Future</h1>
              <p>Discover your perfect career, explore market salaries, and bridge your skill gaps with our guidance tools.</p>
            </header>
            

            <div className="hub-grid">
              <div className="hub-card"
              style={{ backgroundImage: `url('/images/career.jpg')`, backgroundSize : 'Cover' }}
              onClick={() => setView('form')}>
                <div className='card-content'>
                <h3>Career Recommendation</h3>
                <p>Unlock your ideal career path with AI-driven insights. Match your unique skills, education, and interests against real-world industry requirements to find the perfect professional fit.</p>
                <button className="hub-btn">Open Tool</button>
              </div>
              </div>

              <div className="hub-card"
              style={{ backgroundImage: `url('/images/salary.jpg')`, backgroundSize : 'Cover' }}
              onClick={() => setView('salary')}>
                
                <div className='card-content'>
                <h3>Salary Trends</h3>
                <p>Explore your earning potential. View real-time market data for entry-level, mid-level, and professional roles across your target industries to plan your financial future.</p>
                <button className="hub-btn">Open Tool</button>
              </div>
              </div>

              <div className="hub-card"
              style={{ backgroundImage: `url('/images/welcome.jpg')`, backgroundSize : 'Cover' }}
              onClick={() => setView('courses')}>
                
                <div className='card-content'>
                <h3>Course Suggestions</h3>
                <p>Bridge your skill gaps with curated learning paths. Get personalized course suggestions from top platforms to master the specific technologies and tools required for your dream career.</p>
                <button className="hub-btn">Open Tool</button>
              </div>
              </div>
            </div>
          </div>
        ) } 
         {view === 'form' && (
          <div className="view-container">
            <button className="back-btn" onClick={() => setView('hub')}>
              ← Back to Hub
            </button>
            <CareerAnalysisForm />
          </div>
        )}

        {view === 'salary' && (
          <div className="view-container">
            <button className="back-btn" onClick={() => setView('hub')}>← Back to Hub</button>
            <SalaryTrends />
          </div>
        )}

        {view === 'courses' && (
          <div className="view-container">
            <button className="back-btn" onClick={() => setView('hub')}>← Back to Hub</button>
            <CourseSuggestions />
          </div>
        )}
      </main>
    </div>
  );
};

export default CareerGuidance;