import React, {useState} from 'react';
import CareerAnalysisForm from '../components/CareerAnalysisForm';
import CareerQuiz from './CareerQuiz';
import '../css/CareerProcess.css';
const CareerProcess = () => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState(null);
  const totalSteps = 3;

  const [selectionData, setSelectionData] = useState({
    industryId: '',
    industryName: '',
    education: '',
    skills: []
  });

  // Calculate percentage
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="analysis-card-container">
      <div className="white-analysis-card">
        {/* Progress Bar */}
        <div className="step-progress-wrapper">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="step-labels">
            <span className={step >= 1 ? 'active' : ''}>Profile</span>
            <span className={step >= 2 ? 'active' : ''}>Quiz</span>
            <span className={step >= 3 ? 'active' : ''}>Result</span>
          </div>
        </div>

        {/* Dynamic Step Rendering */}
        {step === 1 && (
          <CareerAnalysisForm 
            onNext={(data) => {
              setSelectionData(data);
              setStep(2);
            }} 
          />
        )}

        {step === 2 && (
          <CareerQuiz 
            industryId={selectionData.industryId} 
            industryName={selectionData.industryName}
            onComplete={(quizResults) => {
              console.log("Quiz Done:", quizResults);
              setStep(3);
            }}
          />
        )}

        {step === 3 && <div className="results-placeholder">Calculating your match...</div>}
      </div>
    </div>
  );
};

export default CareerProcess;