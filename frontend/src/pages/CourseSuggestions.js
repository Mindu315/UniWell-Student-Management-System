import React, { useState } from 'react';
import '../css/CourseSuggestions.css';

const CourseSuggestions = () => {
  const [selectedCareer, setSelectedCareer] = useState(null);

  // Mock Data - In MERN, this would come from your MongoDB 'courses' collection
  const careerOptions = ["Software Engineer", "Data Scientist", "Project Manager", "Digital Marketer"];

  const courseData = {
    "Software Engineer": [
      { id: 1, title: "Full Stack Web Development", provider: "Udemy", link: "https://udemy.com", level: "Beginner" },
      { id: 2, title: "Data Structures & Algorithms", provider: "Coursera", link: "https://coursera.org", level: "Intermediate" }
    ],
    "Data Scientist": [
      { id: 3, title: "Python for Data Science", provider: "EDX", link: "https://edx.org", level: "Beginner" },
      { id: 4, title: "Machine Learning A-Z", provider: "Udemy", link: "https://udemy.com", level: "Advanced" }
    ],
     "Project Manager": [
      { id: 5, title: "Google Project Management Professional Certificate", provider: "Coursera", link: "https://www.coursera.org/professional-certificates/google-project-management", level: "Beginner" },
      { id: 6, title: "PMP Exam Prep Seminar - Complete Exam Coverage", provider: "Udemy", link: "https://www.udemy.com/course/pmp-pmbok6-35-pdus/", level: "Intermediate" }
    ],
    // Add more mappings here...
  };

  return (
    <div className="course-page-container">
      <div className="course-white-card">
        {!selectedCareer ? (
          /* PHASE 1: SELECT CAREER */
          <div className="selection-phase">
            <h2>What is your dream career?</h2>
            <p>Select a path to view curated learning resources.</p>
            <div className="career-selection-grid">
              {careerOptions.map(career => (
                <button 
                  key={career} 
                  className="career-opt-btn"
                  onClick={() => setSelectedCareer(career)}
                >
                  {career}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* PHASE 2: SHOW COURSES */
          <div className="results-phase">
            <div className="results-header">
              <button className="text-back-btn" onClick={() => setSelectedCareer(null)}>← Change Career</button>
              <h2>Courses for {selectedCareer}</h2>
            </div>

            <div className="course-list-vertical">
              {courseData[selectedCareer]?.map(course => (
                <div key={course.id} className="course-row-item">
                  <div className="course-main-info">
                    <span className="course-level-tag">{course.level}</span>
                    <h3>{course.title}</h3>
                    <p>Platform: <strong>{course.provider}</strong></p>
                  </div>
                  <a href={course.link} target="_blank" rel="noopener noreferrer" className="visit-course-btn">
                    View Course
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSuggestions;