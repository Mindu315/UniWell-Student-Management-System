import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CareerAnalysisForm from '../components/CareerAnalysisForm';
import '../css/CareerProcess.css';

const CareerProcess = () => {
  const navigate = useNavigate();
  const progressPercentage = (1 / 3) * 100;

  return (
    <div>
      <Navbar />
      <div className="container dashboard-main unified-page-shell career-workspace-shell">
        <div className="career-panel career-process-panel">
          <div className="step-progress-wrapper">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <div className="step-labels">
              <span className="active">Profile</span>
              <span>Quiz</span>
              <span>Result</span>
            </div>
          </div>

          <CareerAnalysisForm 
            onNext={(data) => {
              navigate('/industry-quiz', { state: data });
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default CareerProcess;
