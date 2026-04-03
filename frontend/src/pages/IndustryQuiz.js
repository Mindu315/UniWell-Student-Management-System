import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../css/IndustryQuiz.css';

const IndustryQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // FIX 1: Extract the skills and education passed from CareerAnalysisForm.js
  const { 
    industryId, 
    industryName, 
    userSkills = [], 
    education = "" 
  } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    if (industryId) {
      axios.get(`http://localhost:5003/api/quiz/${industryId}`)
        .then(res => setQuestions(res.data))
        .catch(err => console.error("Error fetching quiz:", err));
    }
  }, [industryId]);

  /*const handleAnswer = (score) => {
    setTotalScore(prev => prev + score);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Logic for showing results after last question
      alert(`Quiz Finished! Total Score: ${totalScore + score}`);
    }
  };*/

  const handleAnswer = async (scoreValue) => {
    const points = Number(scoreValue) || 0;
    const finalQuizScore = totalScore + points; 
    setTotalScore(prev => prev + points);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      try {
        // FIX 2: Send EVERYTHING to the new calculation endpoint
        const response = await axios.post('http://localhost:5003/api/calculate-career', {
          industryId,
          userSkills,
          educationLevel: education,
          quizScore: finalQuizScore
        });
        
        // FIX 3: Navigate to results with the NEW totalMarks
        navigate('/results', { 
          state: { 
            careers: response.data.recommendedCareers, 
            score: response.data.totalMarks, // This is the new 4-step total
            industryName: industryName 
          } 
        });
      } catch (err) {
        console.error("Error calculating results:", err);
        alert("Quiz finished! But we couldn't calculate your recommendations.");
      }
    }
  };


  if (questions.length === 0) return <div className="loading">Loading Questions...</div>;
  console.log("FULL QUESTION OBJECT:", questions[currentQuestion]);

  return (

    
    <div className="quiz-container">
      <div className="white-quiz-card">
        <h3>{industryName} Assessment</h3>
        <p className="question-count">Question {currentQuestion + 1} of {questions.length}</p>
        
        <h2 className="question-text">{questions[currentQuestion].question}</h2>
        
        <div className="quiz-options-grid">
          {questions[currentQuestion] && questions[currentQuestion].options && (
  <div className="quiz-options-grid">
  {/* Check if both arrays exist and have data */}
    {questions[currentQuestion]?.options?.length > 0 ? (
        questions[currentQuestion].options.map((optionText, index) => (
        <button 
            key={index} 
            className="quiz-opt-btn"
            // Grab the score from the 'scores' array using the same index
            onClick={() => handleAnswer(questions[currentQuestion].scores[index])}
        >
            {optionText}
        </button>
        ))
    ) : (
        <p>Loading options...</p>
    )}
    </div>
        )}
          
        </div>
      </div>
    </div>
  );
};

export default IndustryQuiz;