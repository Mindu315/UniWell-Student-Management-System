import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';
import './App.css';
import CareerGuidance from './pages/CareerGuidance';
import IndustryQuiz from './pages/IndustryQuiz';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to dashboard or career */}
        <Route path="/" element={<Navigate to="/career" />} />
        
        {/* The Career Guidance Route */}
        <Route path="/career" element={<CareerGuidance />} />
         {/* The Quiz Questions Route */}
        <Route path="/industry-quiz" element={<IndustryQuiz />} />
        {/* The Results Route */}
        <Route path="/results" element={<Results />} />
        
        {/* Add your other routes here */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;