import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { careerAPI } from '../api';
import '../css/IndustryQuiz.css';

const IndustryQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // FIX 1: Extract the skills and education passed from CareerAnalysisForm.js
  const { 
    industryId, 
    industryName, 
    selectedSkillIds = [], 
    education = "" 
  } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    if (!industryId) {
      navigate('/career-guidance');
      return;
    }

    careerAPI.getQuizByIndustry(industryId)
        .then((res) => setQuestions(res.data?.data || []))
        .catch(err => console.error("Error fetching quiz:", err));
  }, [industryId, navigate]);

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
        const response = await careerAPI.recommendCareer({
          industryId,
          selectedSkillIds,
          educationLevel: education,
          quizScore: finalQuizScore
        });

        const resultData = response.data?.data || {};
        navigate('/results', { 
          state: { 
            careers: resultData.recommendations || [], 
            score: resultData.totalScore || finalQuizScore,
            industryName: industryName 
          } 
        });
      } catch (err) {
        console.error("Error calculating results:", err);
        alert("Quiz finished! But we couldn't calculate your recommendations.");
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container dashboard-main unified-page-shell career-workspace-shell">
            <div className="career-panel career-quiz-shell">
              <div className="loading">Loading Questions...</div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container dashboard-main unified-page-shell career-workspace-shell">
        <div className="career-panel career-quiz-shell">
          <h3>{industryName} Assessment</h3>
          <p className="question-count">Question {currentQuestion + 1} of {questions.length}</p>

          <h2 className="question-text">{questions[currentQuestion].question}</h2>

          <div className="quiz-options-grid">
            {questions[currentQuestion]?.options?.length > 0 ? (
              questions[currentQuestion].options.map((optionText, index) => (
                <button
                  key={index}
                  className="quiz-opt-btn"
                  onClick={() => handleAnswer(questions[currentQuestion].scores[index])}
                >
                  {optionText}
                </button>
              ))
            ) : (
              <p>Loading options...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryQuiz;
