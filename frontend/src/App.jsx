import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import SpecializationSelection from './components/SpecializationSelection';
import CalculatorDashboard from './pages/CalculatorDashboard.jsx';
import './styles.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="gpa-app-shell">
        {/* Mobile sidebar toggle */}
        <button
          className="gpa-mobile-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="gpa-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* UniWell Sidebar — always visible */}
        <div className={`gpa-sidebar-shell ${sidebarOpen ? 'is-open' : ''}`}>
          <Sidebar
            isAcademicActive={true}
            onAcademicClick={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main Content Area */}
        <main className="gpa-main-content">
          <Routes>
            <Route path="/" element={<SpecializationSelection />} />
            <Route path="/calculator/:specialization/:syllabusType" element={<CalculatorDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
