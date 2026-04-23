import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Layout from '../components/Layout';
import GpaCalculator from './GpaCalculator';
import Analyzer from './Analyzer';
import TargetPredictor from './TargetPredictor';
import SpecializationSelection from '../components/SpecializationSelection';

const STORAGE_KEY = 'gpa-suite-grades';

const CalculatorDashboard = () => {
  const { specialization, syllabusType } = useParams();
  const [activeTab, setActiveTab] = useState('calculator');
  const [selectedGrades, setSelectedGrades] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist grades to sessionStorage whenever they change new
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedGrades));
    } catch {
      // ignore storage errors
    }
  }, [selectedGrades]);

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return (
          <GpaCalculator
            selectedGrades={selectedGrades}
            setSelectedGrades={setSelectedGrades}
          />
        );
      case 'analyzer':
        return <Analyzer selectedGrades={selectedGrades} />;
      case 'predictor':
        return <TargetPredictor selectedGrades={selectedGrades} />;
      default:
        return null;
    }
  };
// Check if specialization and syllabusType are present to determine if we can show the main content or need to prompt for selection
  const hasAcademicContext = Boolean(specialization && syllabusType);

  return (
    <>
      <Navbar />
      <div className="container dashboard-main academic-dashboard-page">
        {hasAcademicContext ? (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
          </Layout>
        ) : (
          <SpecializationSelection />
        )}
      </div>
    </>
  );
};

export default CalculatorDashboard;
