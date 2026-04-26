
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import Flashcards from './pages/Flashcards';
import AIQuizzes from './pages/AIQuizzes';
import StressManagementPage from './pages/StressManagementPage';
import AcademicPerformancePage from './pages/CalculatorDashboard';
import CareerGuidance from './pages/CareerGuidance';
import CareerProcess from './pages/CareerProcess';
import IndustryQuiz from './pages/IndustryQuiz';
import Results from './pages/Results';
import SalaryTrends from './pages/SalaryTrends';
import CourseSuggestions from './pages/CourseSuggestions';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/stress-management"
            element={
              <ProtectedRoute>
                <StressManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic-performance"
            element={
              <ProtectedRoute>
                <AcademicPerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic-performance/:specialization/:syllabusType"
            element={
              <ProtectedRoute>
                <AcademicPerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-guidance"
            element={
              <ProtectedRoute>
                <CareerGuidance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-process"
            element={
              <ProtectedRoute>
                <CareerProcess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/industry-quiz"
            element={
              <ProtectedRoute>
                <IndustryQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salary-trends"
            element={
              <ProtectedRoute>
                <SalaryTrends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-suggestions"
            element={
              <ProtectedRoute>
                <CourseSuggestions />
              </ProtectedRoute>
            }
          />
          


          {/* Admin Only Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <Flashcards />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-quizzes"
            element={
              <ProtectedRoute>
                <AIQuizzes />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
