import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SpecializationSelection from './components/SpecializationSelection';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SpecializationSelection />} />
        <Route path="/calculator/:specialization/:syllabusType" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
