import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerAPI } from '../api';
import '../css/CareerAnalysisForm.css';

const CareerAnalysisForm = ({ onNext }) => {
  const navigate = useNavigate();
  const [industries, setIndustries] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [industryError, setIndustryError] = useState('');
  const [skillsError, setSkillsError] = useState('');
  
  const [selectedIndustry, setSelectedIndustry] = useState({ id: '', name: '' });
  const [selectedEducation, setSelectedEducation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  

  // 1. Load Industries from DB
  useEffect(() => {
    setLoadingIndustries(true);
    setIndustryError('');

    careerAPI.getIndustries()
      .then((res) => {
        const items = res.data?.data || [];
        setIndustries(items);

        if (items.length === 0) {
          setIndustryError('No industries were returned from the server yet.');
        }
      })
      .catch((err) => {
        console.error('Industry Fetch Error', err);
        setIndustryError(err.response?.data?.message || 'Failed to load industries.');
      })
      .finally(() => setLoadingIndustries(false));
  }, []);

  // 2. Load Skills ONLY when Industry changes
  useEffect(() => {
    if (selectedIndustry.id) {
      setSkillsError('');
      careerAPI.getSkillsByIndustry(selectedIndustry.id)
        .then((res) => {
          const items = res.data?.data || [];
          setAvailableSkills(items);

          if (items.length === 0) {
            setSkillsError(`No skills were found yet for ${selectedIndustry.name}.`);
          }
        })
        .catch((err) => {
          console.error('Skill Fetch Error', err);
          setSkillsError(err.response?.data?.message || 'Failed to load skills for this industry.');
        });
    } else {
      setAvailableSkills([]);
      setSelectedSkills([]);
      setSkillsError('');
    }
  }, [selectedIndustry.id]);

  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill._id) ? prev.filter(s => s !== skill._id) : [...prev, skill._id]
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
    const nextState = {
      industryId: selectedIndustry.id,
      industryName: selectedIndustry.name,
      selectedSkillIds: selectedSkills,
      education: selectedEducation
    };

    if (typeof onNext === 'function') {
      onNext(nextState);
      return;
    }

    navigate('/industry-quiz', { 
      state: nextState
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
          {loadingIndustries && <p className="career-inline-message">Loading industries...</p>}
          {industries.map(ind => (
            <button 
              key={ind._id}
              className={`option-btn ${selectedIndustry.id === ind._id ? 'active' : ''}`}
              onClick={() => setSelectedIndustry({ id: ind._id, name: ind.industry_name })}
            >
              {ind.industry_name}
            </button>
          ))}
        </div>
        {!loadingIndustries && industryError && (
          <p className="career-inline-message career-inline-message-error">{industryError}</p>
        )}
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
                className={`option-btn ${selectedSkills.includes(skill._id) ? 'active' : ''}`}
                onClick={() => handleToggleSkill(skill)}
              >
                {skill.skill_name} 
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedIndustry.id && availableSkills.length === 0 && skillsError && (
        <p className="career-inline-message career-inline-message-error">{skillsError}</p>
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
