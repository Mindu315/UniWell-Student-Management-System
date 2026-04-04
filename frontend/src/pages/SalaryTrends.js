import React, { useState, useEffect } from 'react';
import '../css/SalaryTrends.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalaryTrends = () => {
  const [industry, setIndustry] = useState('');
  const [career, setCareer] = useState('');
  const [chartData, setChartData] = useState(null);
  const [errors, setErrors] = useState({});

  // Mock Data Structure
  const dataBank = {
    "Information Technology": {
      "Software Engineer": [60000, 95000, 140000],
      "Web Developer": [50000, 85000, 120000],
      "Data Analyst": [55000, 90000, 130000],
      "System Administrator": [52000, 88000, 115000]
    },
    "Business": {
      "Project Manager": [65000, 100000, 150000],
      "Business Analyst": [58000, 92000, 135000],
      "Marketing Manager": [50000, 80000, 125000]
    },
    
    "Education": {
      "High School Teacher": [45000, 65000, 90000],
      "University Lecturer": [60000, 90000, 145000],
      "Education Consultant": [55000, 85000, 110000]
    },
    "Health Care": {
      "Registered Nurse": [55000, 78000, 110000],
      "Medical technologist": [48000, 70000, 95000],
      "Health Administrator": [65000, 110000, 180000]
    },
    "Banking and Financial": {
      "Investment Banker": [75000, 125000, 250000],
      "Financial Analyst": [60000, 95000, 145000],
      "Accountant": [50000, 75000, 120000]
    },
    "Engineering": {
      "Civil Engineer": [60000, 90000, 135000],
      "Mechanical Engineer": [62000, 95000, 140000],
      "Electrical Engineer": [65000, 100000, 150000]
    }
  };

  const industries = ["Information Technology", "Business", "Education", "Health Care", "Banking and Financial", "Engineering"];

  const handleCalculate = () => {
    let newErrors = {};
    if (!industry) newErrors.industry = "Please select an industry";
    if (!career) newErrors.career = "Please select a career";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setChartData(null);
      return;
    }

    setErrors({});
    const salaries = dataBank[industry][career];

    setChartData({
      labels: ['Entry Level', 'Mid Level', 'Professional'],
      datasets: [
        {
          label: `Salary Range for ${career} ($)`,
          data: salaries,
          backgroundColor: ['#52b788', '#40916c', '#2d6a4f'],
          borderRadius: 8,
        },
      ],
    });
  };

  return (
    <div className="analysis-card-container">
      <div className="white-analysis-card">
        <h2>Market Salary Trends</h2>
        <p className="subtitle">Select your path to view current market compensation.</p>

        <div className="selection-section">
          <label>Select Industry</label>
          <div className="options-grid">
            {industries.map(ind => (
              <button 
                key={ind}
                className={`option-btn ${industry === ind ? 'active' : ''}`}
                onClick={() => { setIndustry(ind); setCareer(''); }}
              >
                {ind}
              </button>
            ))}
          </div>
          {errors.industry && <span className="error-text">{errors.industry}</span>}
        </div>

        {industry && (
          <div className="selection-section">
            <label>Select Career</label>
            <div className="options-grid">
              {Object.keys(dataBank[industry] || {}).map(job => (
                <button 
                  key={job}
                  className={`option-btn ${career === job ? 'active' : ''}`}
                  onClick={() => setCareer(job)}
                >
                  {job}
                </button>
              ))}
            </div>
            {errors.career && <span className="error-text">{errors.career}</span>}
          </div>
        )}

        <button className="next-step-btn" onClick={handleCalculate}>
          View Salary Insights
        </button>

        {chartData && (
          <div className="chart-container" style={{ marginTop: '40px' }}>
            <Bar 
              data={chartData} 
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryTrends;