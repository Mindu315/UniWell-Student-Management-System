import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/CareerAnalysisForm.css';

const CareerAnalysisForm = ({ onNext }) => {
  const navigate = useNavigate();
  const [industries, setIndustries] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  
  const [selectedIndustry, setSelectedIndustry] = useState({ id: '', name: '' });
  const [selectedEducation, setSelectedEducation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  

  // 1. Load Industries from DB
  useEffect(() => {
    axios.get('http://localhost:5003/api/industry')
      .then(res => setIndustries(res.data))
      .catch(err => console.error("Industry Fetch Error", err));
  }, []);

  // 2. Load Skills ONLY when Industry changes
  useEffect(() => {
    if (selectedIndustry.id) {
      axios.get(`http://localhost:5003/api/skills/${selectedIndustry.id}`)
        .then(res => setAvailableSkills(res.data))
        .catch(err => console.error("Skill Fetch Error", err));
    }
  }, [selectedIndustry.id]);

  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleStartQuiz = () => {

    // 1. Check Industry
  if (!selectedIndustry.id) {
    alert("Please select an industry first!");
    return; // Stop the function here
  }

  // 2. Check Education
  if (!selectedEducation) {
    alert("Please select your highest educational level.");
    return;
  }

  // 3. Check Skills
  if (selectedSkills.length === 0) {
    alert("Please select at least one skill to continue.");
    return;
  }
    // Navigate to the Quiz page and pass the selected data
    navigate('/industry-quiz', { 
      state: { 
        industryId: selectedIndustry.id,
        industryName: selectedIndustry.name,
        userSkills: selectedSkills,
        education: selectedEducation
      } 
    });
  };

  

    // Define these at the top of your file or inside the component
  const educationLevels = [
    "High School",
    "Diploma",
    "Bsc",
    "Masters",
    "PhD"
  ];

  return (
    <div className="form-step">
      <div className="input-section">
        <label>Which industry interests you?</label>
        <div className="options-grid">
          {industries.map(ind => (
            <button 
              key={ind._id}
              className={`option-btn ${selectedIndustry.id === ind._id ? 'active' : ''}`}
              onClick={() => setSelectedIndustry({ id: ind._id, name: ind.name })}
            >
              {ind.industry_name} {/* And here */}
            </button>
          ))}
        </div>
      </div>

      {/* 2. NEW: EDUCATION SECTION */}
      {selectedIndustry.id && (
        <div className="input-section animate-fade-in">
          <label className="form-label">What is your highest educational level?</label>
          <div className="options-grid">
            {educationLevels.map((level) => (
              <button
                key={level}
                className={`option-btn ${selectedEducation === level ? 'active' : ''}`}
                onClick={() => setSelectedEducation(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

          {/* SKILLS SECTION */}
      {availableSkills.length > 0 && (
        <div className="input-section animate-fade-in">
          <label className="form-label">Select your top skills in {selectedIndustry.name}:</label>
          <div className="options-grid">
            {availableSkills.map((skill) => (
              <button 
                key={skill._id} 
                // FIX: Check against the unique ID or the specific name
                className={`option-btn ${selectedSkills.includes(skill.skill_name) ? 'active' : ''}`}
                onClick={() => handleToggleSkill(skill.skill_name)}
              >
                {/* FIX: Use skill_name from your MongoDB Schema */}
                {skill.skill_name} 
              </button>
            ))}
          </div>
        </div>
      )}
  <button 
    className="next-step-btn"
    onClick={handleStartQuiz}
  >
    Start Career Quiz
  </button>
    </div>
  );
};

export default CareerAnalysisForm;