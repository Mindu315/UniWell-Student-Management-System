import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerAPI } from '../api';

const CareerQuiz = ({ industryId, industryName, onComplete }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (!industryId) {
      return;
    }

    careerAPI.getQuizByIndustry(industryId)
      .then((res) => setQuestions(res.data?.data || []))
      .catch(err => console.error("Quiz Fetch Error", err));
  }, [industryId]);

  const handleAnswer = (score) => {
    const newAnswers = [...answers, Number(score || 0)];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      if (typeof onComplete === 'function') {
        onComplete(newAnswers);
      } else {
        navigate('/career-guidance');
      }
    }
  };

  if (questions.length === 0) return <div className="loader">Loading {industryName} Quiz...</div>;

  return (
    <div className="quiz-step">
      <h3>Question {currentQ + 1} of {questions.length}</h3>
      <p className="quiz-text">{questions[currentQ].question}</p>
      
      <div className="quiz-options-vertical">
        {questions[currentQ].options.map((opt, index) => (
          <button 
            key={index} 
            className="quiz-opt-btn"
            onClick={() => handleAnswer(questions[currentQ].scores[index])}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CareerQuiz;
