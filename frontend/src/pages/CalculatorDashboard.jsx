import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GpaCalculator from './GpaCalculator';
import Analyzer from './Analyzer';
import TargetPredictor from './TargetPredictor';

const STORAGE_KEY = 'gpa-suite-grades';

const CalculatorDashboard = () => {
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

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default CalculatorDashboard;
