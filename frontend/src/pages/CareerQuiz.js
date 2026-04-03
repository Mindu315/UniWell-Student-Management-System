import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CareerQuiz = ({ industryId, industryName, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    // Fetch questions filtered by the selected industry
    axios.get(`http://localhost:5003/api/questions/industry/${industryId}`)
      .then(res => setQuestions(res.data))
      .catch(err => console.error("Quiz Fetch Error", err));
  }, [industryId]);

  const handleAnswer = (option) => {
    const newAnswers = [...answers, { questionId: questions[currentQ]._id, answer: option }];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  if (questions.length === 0) return <div className="loader">Loading {industryName} Quiz...</div>;

  return (
    <div className="quiz-step">
      <h3>Question {currentQ + 1} of {questions.length}</h3>
      <p className="quiz-text">{questions[currentQ].questionText}</p>
      
      <div className="quiz-options-vertical">
        {questions[currentQ].options.map((opt, index) => (
          <button 
            key={index} 
            className="quiz-opt-btn"
            onClick={() => handleAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CareerQuiz;