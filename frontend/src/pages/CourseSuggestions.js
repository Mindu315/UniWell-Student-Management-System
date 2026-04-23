import React, { useState, useEffect } from 'react';
import { careerAPI } from '../api';
import '../css/CourseSuggestions.css';

const CourseSuggestions = () => {
  const [industries, setIndustries] = useState([]);
  const [careers, setCareers] = useState([]);
  const [allCareersData, setAllCareersData] = useState({});
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [loadingCareers, setLoadingCareers] = useState(false);
  const [error, setError] = useState('');

  const difficultyLevels = ['All', 'Easy', 'Medium', 'Hard'];

  // Default courses for common careers (fallback)
  const defaultCourses = {
    'Software Engineer': [
      { id: 1, title: 'Full Stack Web Development', provider: 'Udemy', link: 'https://www.udemy.com/course/the-complete-web-developer-zero-to-mastery/', difficulty: 'Easy' },
      { id: 2, title: 'Data Structures & Algorithms', provider: 'Coursera', link: 'https://www.coursera.org/specializations/data-structures-algorithms', difficulty: 'Medium' },
      { id: 3, title: 'Advanced React Patterns', provider: 'Frontend Masters', link: 'https://frontendmasters.com/courses/advanced-react-patterns/', difficulty: 'Hard' }
    ],
    'Data Scientist': [
      { id: 4, title: 'Python for Data Science', provider: 'edX', link: 'https://www.edx.org/course/python-for-data-science', difficulty: 'Easy' },
      { id: 5, title: 'Machine Learning A-Z', provider: 'Udemy', link: 'https://www.udemy.com/course/machinelearning/', difficulty: 'Medium' },
      { id: 6, title: 'Deep Learning Specialization', provider: 'Coursera', link: 'https://www.coursera.org/specializations/deep-learning', difficulty: 'Hard' }
    ],
    'Cloud Architect': [
      { id: 7, title: 'AWS Cloud Practitioner', provider: 'Coursera', link: 'https://www.coursera.org/professional-certificates/aws-cloud-practitioner', difficulty: 'Easy' },
      { id: 8, title: 'Architecting on AWS', provider: 'AWS Training', link: 'https://www.aws.training/Details/Curriculum?id=20685', difficulty: 'Medium' },
      { id: 9, title: 'Advanced Cloud Architecture', provider: 'Pluralsight', link: 'https://www.pluralsight.com/courses/advanced-cloud-architecture', difficulty: 'Hard' }
    ],
    'Cybersecurity Analyst': [
      { id: 10, title: 'CompTIA Security+', provider: 'CompTIA', link: 'https://www.comptia.org/certifications/security', difficulty: 'Easy' },
      { id: 11, title: 'Ethical Hacking', provider: 'Udemy', link: 'https://www.udemy.com/course/learn-ethical-hacking-from-scratch/', difficulty: 'Medium' },
      { id: 12, title: 'Penetration Testing', provider: 'Offensive Security', link: 'https://www.offensive-security.com/', difficulty: 'Hard' }
    ],
    'Network Administrator': [
      { id: 13, title: 'CCNA', provider: 'Cisco', link: 'https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/ccna.html', difficulty: 'Easy' },
      { id: 14, title: 'Network Security', provider: 'Coursera', link: 'https://www.coursera.org/specializations/cisco-networking-security', difficulty: 'Medium' },
      { id: 15, title: 'Advanced Networking', provider: 'Pluralsight', link: 'https://www.pluralsight.com/paths/advanced-networking', difficulty: 'Hard' }
    ],
    'IT Support Specialist': [
      { id: 16, title: 'IT Support Fundamentals', provider: 'Coursera', link: 'https://www.coursera.org/professional-certificates/google-it-support', difficulty: 'Easy' },
      { id: 17, title: 'Help Desk Certification', provider: 'HDI', link: 'https://www.thinkhdi.com/', difficulty: 'Medium' },
      { id: 18, title: 'ITIL Foundation', provider: 'AXELOS', link: 'https://www.axelos.com/', difficulty: 'Hard' }
    ],
    'Database Administrator': [
      { id: 19, title: 'SQL Fundamentals', provider: 'Khan Academy', link: 'https://www.khanacademy.org/computing/computer-programming/sql', difficulty: 'Easy' },
      { id: 20, title: 'MongoDB Basics', provider: 'MongoDB University', link: 'https://university.mongodb.com/', difficulty: 'Medium' },
      { id: 21, title: 'Advanced Database Systems', provider: 'Coursera', link: 'https://www.coursera.org/learn/advanced-database-systems', difficulty: 'Hard' }
    ],
    'DevOps Engineer': [
      { id: 22, title: 'Docker Fundamentals', provider: 'Docker', link: 'https://www.docker.com/', difficulty: 'Easy' },
      { id: 23, title: 'Kubernetes Basics', provider: 'Kubernetes', link: 'https://kubernetes.io/', difficulty: 'Medium' },
      { id: 24, title: 'CI/CD Pipeline Design', provider: 'Jenkins', link: 'https://www.jenkins.io/', difficulty: 'Hard' }
    ],
    'UI/UX Designer': [
      { id: 25, title: 'Figma Basics', provider: 'Figma', link: 'https://www.figma.com/', difficulty: 'Easy' },
      { id: 26, title: 'UI Design Principles', provider: 'Coursera', link: 'https://www.coursera.org/specializations/ui-ux-design', difficulty: 'Medium' },
      { id: 27, title: 'UX Research Methods', provider: 'Interaction Design Foundation', link: 'https://www.interaction-design.org/', difficulty: 'Hard' }
    ],
    'QA Engineer': [
      { id: 28, title: 'Software Testing Basics', provider: 'Udemy', link: 'https://www.udemy.com/course/software-testing-basics/', difficulty: 'Easy' },
      { id: 29, title: 'Selenium WebDriver', provider: 'Coursera', link: 'https://www.coursera.org/learn/selenium-webdriver', difficulty: 'Medium' },
      { id: 30, title: 'Test Automation Architecture', provider: 'Pluralsight', link: 'https://www.pluralsight.com/paths/test-automation', difficulty: 'Hard' }
    ],
    'Business Analyst': [
      { id: 31, title: 'Business Analysis Fundamentals', provider: 'IIBA', link: 'https://www.iiba.org/', difficulty: 'Easy' },
      { id: 32, title: 'Data Analysis with Excel', provider: 'Coursera', link: 'https://www.coursera.org/learn/excel-data-analysis', difficulty: 'Medium' },
      { id: 33, title: 'Advanced Business Analysis', provider: 'Udemy', link: 'https://www.udemy.com/course/advanced-business-analysis/', difficulty: 'Hard' }
    ],
    'Project Manager': [
      { id: 34, title: 'PMP Exam Prep', provider: 'PMI', link: 'https://www.pmi.org/', difficulty: 'Easy' },
      { id: 35, title: 'Agile Project Management', provider: 'Coursera', link: 'https://www.coursera.org/learn/agile-project-management', difficulty: 'Medium' },
      { id: 36, title: 'Program Management', provider: 'edX', link: 'https://www.edx.org/professional-certificate/program-management', difficulty: 'Hard' }
    ],
    'Product Manager': [
      { id: 37, title: 'Product Management Basics', provider: 'Udacity', link: 'https://www.udacity.com/course/product-manager-nanodegree--nd036', difficulty: 'Easy' },
      { id: 38, title: 'Product Strategy', provider: 'Coursera', link: 'https://www.coursera.org/learn/product-strategy', difficulty: 'Medium' },
      { id: 39, title: 'Advanced Product Leadership', provider: 'SVPG', link: 'https://svpg.com/', difficulty: 'Hard' }
    ],
    'Data Analyst': [
      { id: 40, title: 'Excel for Data Analysis', provider: 'Coursera', link: 'https://www.coursera.org/learn/excel-data-analysis', difficulty: 'Easy' },
      { id: 41, title: 'Power BI Complete', provider: 'Udemy', link: 'https://www.udemy.com/course/microsoft-power-bi/', difficulty: 'Medium' },
      { id: 42, title: 'Advanced Analytics', provider: 'edX', link: 'https://www.edx.org/course/advanced-analytics', difficulty: 'Hard' }
    ],
    'Machine Learning Engineer': [
      { id: 43, title: 'ML Fundamentals', provider: 'Coursera', link: 'https://www.coursera.org/learn/machine-learning', difficulty: 'Easy' },
      { id: 44, title: 'TensorFlow Developer', provider: 'DeepLearning.AI', link: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice', difficulty: 'Medium' },
      { id: 45, title: 'MLOps Specialization', provider: 'Coursera', link: 'https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops', difficulty: 'Hard' }
    ],
    'Full Stack Developer': [
      { id: 46, title: 'Web Development Bootcamp', provider: 'Udemy', link: 'https://www.udemy.com/course/the-complete-web-developer-zero-to-mastery/', difficulty: 'Easy' },
      { id: 47, title: 'Node.js Backend', provider: 'Coursera', link: 'https://www.coursera.org/learn/server-side-nodejs', difficulty: 'Medium' },
      { id: 48, title: 'Full Stack Architecture', provider: 'Frontend Masters', link: 'https://frontendmasters.com/', difficulty: 'Hard' }
    ],
    'Systems Analyst': [
      { id: 49, title: 'Systems Analysis Basics', provider: 'Coursera', link: 'https://www.coursera.org/learn/systems-analysis', difficulty: 'Easy' },
      { id: 50, title: 'Requirements Engineering', provider: 'edX', link: 'https://www.edx.org/course/requirements-engineering', difficulty: 'Medium' },
      { id: 51, title: 'Enterprise Architecture', provider: 'TOGAF', link: 'https://www.opengroup.org/', difficulty: 'Hard' }
    ],
    'Technical Writer': [
      { id: 52, title: 'Technical Writing Basics', provider: 'Coursera', link: 'https://www.coursera.org/learn/technical-writing-intro', difficulty: 'Easy' },
      { id: 53, title: 'API Documentation', provider: 'Swagger', link: 'https://swagger.io/', difficulty: 'Medium' },
      { id: 54, title: 'Advanced Documentation', provider: 'Write the Docs', link: 'https://www.writethedocs.org/', difficulty: 'Hard' }
    ],
    'AI Engineer': [
      { id: 55, title: 'AI for Everyone', provider: 'Coursera', link: 'https://www.coursera.org/learn/ai-for-everyone', difficulty: 'Easy' },
      { id: 56, title: 'AI Engineering with Python', provider: 'Udemy', link: 'https://www.udemy.com/course/ai-engineering/', difficulty: 'Medium' },
      { id: 57, title: 'Advanced AI Systems', provider: 'DeepLearning.AI', link: 'https://www.deeplearning.ai/', difficulty: 'Hard' }
    ],
    'Blockchain Developer': [
      { id: 58, title: 'Blockchain Basics', provider: 'Coursera', link: 'https://www.coursera.org/learn/blockchain-basics', difficulty: 'Easy' },
      { id: 59, title: 'Solidity Development', provider: 'Ethereum', link: 'https://soliditylang.org/', difficulty: 'Medium' },
      { id: 60, title: 'Web3 Development', provider: 'Alchemy', link: 'https://www.alchemy.com/', difficulty: 'Hard' }
    ],
    'UX Designer': [
      { id: 61, title: 'UX Design Fundamentals', provider: 'Coursera', link: 'https://www.coursera.org/specializations/google-ux-design', difficulty: 'Easy' },
      { id: 62, title: 'Interaction Design', provider: 'Udemy', link: 'https://www.udemy.com/course/interaction-design-course/', difficulty: 'Medium' },
      { id: 63, title: 'Design Systems Deep Dive', provider: 'Frontend Masters', link: 'https://frontendmasters.com/courses/design-systems/', difficulty: 'Hard' }
    ],
    'Graphic Designer': [
      { id: 64, title: 'Graphic Design Basics', provider: 'Canva Design School', link: 'https://www.canva.com/learn/graphic-design-basics/', difficulty: 'Easy' },
      { id: 65, title: 'Adobe Illustrator Masterclass', provider: 'Udemy', link: 'https://www.udemy.com/course/adobe-illustrator-cc-masterclass/', difficulty: 'Medium' },
      { id: 66, title: 'Advanced Visual Design', provider: 'Skillshare', link: 'https://www.skillshare.com/browse/visual-design', difficulty: 'Hard' }
    ],
    'Product Designer': [
      { id: 67, title: 'Product Design Basics', provider: 'Coursera', link: 'https://www.coursera.org/learn/introduction-product-design', difficulty: 'Easy' },
      { id: 68, title: 'Design Thinking', provider: 'edX', link: 'https://www.edx.org/professional-certificate/ux-design', difficulty: 'Medium' },
      { id: 69, title: 'Advanced UX Research', provider: 'Interaction Design Foundation', link: 'https://www.interaction-design.org/courses/ux-research', difficulty: 'Hard' }
    ],
    'Web Developer': [
      { id: 70, title: 'HTML & CSS Basics', provider: 'freeCodeCamp', link: 'https://www.freecodecamp.org/', difficulty: 'Easy' },
      { id: 71, title: 'JavaScript Fundamentals', provider: 'Udemy', link: 'https://www.udemy.com/course/javascript-the-complete-guide-2023/', difficulty: 'Medium' },
      { id: 72, title: 'Advanced Web Development', provider: 'Frontend Masters', link: 'https://frontendmasters.com/', difficulty: 'Hard' }
    ],
    'Mobile App Developer': [
      { id: 73, title: 'Flutter Basics', provider: 'Google', link: 'https://flutter.dev/', difficulty: 'Easy' },
      { id: 74, title: 'React Native Development', provider: 'Udemy', link: 'https://www.udemy.com/course/react-native-the-practical-guide/', difficulty: 'Medium' },
      { id: 75, title: 'Advanced Mobile Architecture', provider: 'Pluralsight', link: 'https://www.pluralsight.com/', difficulty: 'Hard' }
    ],
    'Game Developer': [
      { id: 76, title: 'Unity Basics', provider: 'Unity', link: 'https://unity.com/', difficulty: 'Easy' },
      { id: 77, title: 'Unreal Engine', provider: 'Epic Games', link: 'https://www.unrealengine.com/', difficulty: 'Medium' },
      { id: 78, title: 'Advanced Game Design', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Data Engineer': [
      { id: 79, title: 'ETL Fundamentals', provider: 'Talend', link: 'https://www.talend.com/', difficulty: 'Easy' },
      { id: 80, title: 'Apache Spark', provider: 'Databricks', link: 'https://databricks.com/', difficulty: 'Medium' },
      { id: 81, title: 'Data Pipeline Architecture', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Cloud Engineer': [
      { id: 82, title: 'Cloud Computing Basics', provider: 'AWS', link: 'https://aws.amazon.com/', difficulty: 'Easy' },
      { id: 83, title: 'Azure Fundamentals', provider: 'Microsoft', link: 'https://learn.microsoft.com/', difficulty: 'Medium' },
      { id: 84, title: 'Multi-Cloud Architecture', provider: 'Google Cloud', link: 'https://cloud.google.com/', difficulty: 'Hard' }
    ],
    'Security Engineer': [
      { id: 85, title: 'Security Fundamentals', provider: 'CompTIA', link: 'https://www.comptia.org/', difficulty: 'Easy' },
      { id: 86, title: 'Security Operations', provider: 'SANS', link: 'https://www.sans.org/', difficulty: 'Medium' },
      { id: 87, title: 'Advanced Threat Modeling', provider: 'OWASP', link: 'https://owasp.org/', difficulty: 'Hard' }
    ],
    'Solutions Architect': [
      { id: 88, title: 'AWS Solutions Architect', provider: 'AWS', link: 'https://aws.amazon.com/certification/', difficulty: 'Easy' },
      { id: 89, title: 'System Design', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 90, title: 'Enterprise Architecture', provider: 'TOGAF', link: 'https://www.opengroup.org/', difficulty: 'Hard' }
    ],
    'Technical Lead': [
      { id: 91, title: 'Leadership Fundamentals', provider: 'LinkedIn Learning', link: 'https://www.linkedin.com/learning/', difficulty: 'Easy' },
      { id: 92, title: 'Technical Leadership', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 93, title: 'Engineering Management', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Scrum Master': [
      { id: 94, title: 'Scrum Fundamentals', provider: 'Scrum.org', link: 'https://www.scrum.org/', difficulty: 'Easy' },
      { id: 95, title: 'Agile Coaching', provider: 'ICAgile', link: 'https://www.icagile.com/', difficulty: 'Medium' },
      { id: 96, title: 'Advanced Agile', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'IT Manager': [
      { id: 97, title: 'IT Management Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 98, title: 'IT Service Management', provider: 'ITIL', link: 'https://www.axelos.com/', difficulty: 'Medium' },
      { id: 99, title: 'Strategic IT Leadership', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Consultant': [
      { id: 100, title: 'Consulting Basics', provider: 'McKinsey', link: 'https://www.mckinsey.com/', difficulty: 'Easy' },
      { id: 101, title: 'Business Consulting', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 102, title: 'Strategy Consulting', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Entrepreneur': [
      { id: 103, title: 'Startup Basics', provider: 'Y Combinator', link: 'https://www.ycombinator.com/', difficulty: 'Easy' },
      { id: 104, title: 'Business Development', provider: 'Udemy', link: 'https://www.udemy.com/', difficulty: 'Medium' },
      { id: 105, title: 'Venture Capital', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Digital Marketer': [
      { id: 106, title: 'Digital Marketing Basics', provider: 'Google', link: 'https://skillshop.google.com/', difficulty: 'Easy' },
      { id: 107, title: 'SEO & Content Marketing', provider: 'Moz', link: 'https://www.moz.com/', difficulty: 'Medium' },
      { id: 108, title: 'Advanced Digital Strategy', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'HR Manager': [
      { id: 109, title: 'HR Fundamentals', provider: 'SHRM', link: 'https://www.shrm.org/', difficulty: 'Easy' },
      { id: 110, title: 'Talent Management', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 111, title: 'Strategic HR', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Financial Analyst': [
      { id: 112, title: 'Finance Basics', provider: 'Khan Academy', link: 'https://www.khanacademy.org/', difficulty: 'Easy' },
      { id: 113, title: 'Financial Modeling', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 114, title: 'Advanced Valuation', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Accountant': [
      { id: 115, title: 'Accounting Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 116, title: 'CPA Exam Prep', provider: 'Wiley', link: 'https://www.wiley.com/', difficulty: 'Medium' },
      { id: 117, title: 'Advanced Accounting', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Marketing Manager': [
      { id: 118, title: 'Marketing Fundamentals', provider: 'HubSpot', link: 'https://academy.hubspot.com/', difficulty: 'Easy' },
      { id: 119, title: 'Brand Management', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 120, title: 'Strategic Marketing', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Sales Manager': [
      { id: 121, title: 'Sales Fundamentals', provider: 'HubSpot', link: 'https://academy.hubspot.com/', difficulty: 'Easy' },
      { id: 122, title: 'Account Management', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 123, title: 'Enterprise Sales', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Operations Manager': [
      { id: 124, title: 'Operations Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 125, title: 'Supply Chain Management', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 126, title: 'Advanced Operations', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Civil Engineer': [
      { id: 127, title: 'Civil Engineering Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 128, title: 'Structural Engineering', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 129, title: 'Advanced Design', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Mechanical Engineer': [
      { id: 130, title: 'Mechanical Engineering Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 131, title: 'CAD Design', provider: 'Autodesk', link: 'https://www.autodesk.com/', difficulty: 'Medium' },
      { id: 132, title: 'Advanced Mechanics', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Electrical Engineer': [
      { id: 133, title: 'Electrical Engineering Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 134, title: 'Circuit Design', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 135, title: 'Power Systems', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Chemical Engineer': [
      { id: 136, title: 'Chemical Engineering Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 137, title: 'Process Engineering', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 138, title: 'Advanced Chemistry', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Aerospace Engineer': [
      { id: 139, title: 'Aerospace Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 140, title: 'Aerodynamics', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 141, title: 'Advanced Aerospace', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Biomedical Engineer': [
      { id: 142, title: 'Biomedical Engineering Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 143, title: 'Medical Devices', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 144, title: 'Advanced Biomedical', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Environmental Engineer': [
      { id: 145, title: 'Environmental Engineering Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 146, title: 'Sustainability', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 147, title: 'Advanced Environmental', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Architect': [
      { id: 148, title: 'Architecture Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 149, title: 'Building Design', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 150, title: 'Advanced Architecture', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Interior Designer': [
      { id: 151, title: 'Interior Design Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 152, title: 'Space Planning', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 153, title: 'Advanced Interiors', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Video Editor': [
      { id: 154, title: 'Video Editing Basics', provider: 'Adobe', link: 'https://www.adobe.com/', difficulty: 'Easy' },
      { id: 155, title: 'Premiere Pro', provider: 'Udemy', link: 'https://www.udemy.com/', difficulty: 'Medium' },
      { id: 156, title: 'Advanced Editing', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Content Creator': [
      { id: 157, title: 'Content Creation Basics', provider: 'YouTube', link: 'https://www.youtube.com/', difficulty: 'Easy' },
      { id: 158, title: 'Video Production', provider: 'Udemy', link: 'https://www.udemy.com/', difficulty: 'Medium' },
      { id: 159, title: 'Advanced Content', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Social Media Manager': [
      { id: 160, title: 'Social Media Basics', provider: 'Hootsuite', link: 'https://www.hootsuite.com/', difficulty: 'Easy' },
      { id: 161, title: 'Content Strategy', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 162, title: 'Advanced Social', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Journalist': [
      { id: 163, title: 'Journalism Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 164, title: 'News Writing', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 165, title: 'Investigative Journalism', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Writer': [
      { id: 166, title: 'Writing Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 167, title: 'Creative Writing', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 168, title: 'Advanced Writing', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Teacher': [
      { id: 169, title: 'Teaching Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 170, title: 'Curriculum Design', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 171, title: 'Advanced Pedagogy', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Researcher': [
      { id: 172, title: 'Research Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 173, title: 'Research Methods', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 174, title: 'Advanced Research', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Scientist': [
      { id: 175, title: 'Science Basics', provider: 'Khan Academy', link: 'https://www.khanacademy.org/', difficulty: 'Easy' },
      { id: 176, title: 'Lab Techniques', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 177, title: 'Advanced Science', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Doctor': [
      { id: 178, title: 'Medical Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 179, title: 'Clinical Skills', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 180, title: 'Advanced Medicine', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Nurse': [
      { id: 181, title: 'Nursing Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 182, title: 'Patient Care', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 183, title: 'Advanced Nursing', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Pharmacist': [
      { id: 184, title: 'Pharmacy Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 185, title: 'Clinical Pharmacy', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 186, title: 'Advanced Pharmacy', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Lawyer': [
      { id: 187, title: 'Law Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 188, title: 'Legal Research', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 189, title: 'Advanced Law', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Police Officer': [
      { id: 190, title: 'Criminal Justice Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 191, title: 'Law Enforcement', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 192, title: 'Advanced Policing', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Chef': [
      { id: 193, title: 'Cooking Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 194, title: 'Culinary Arts', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 195, title: 'Advanced Cooking', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Pilot': [
      { id: 196, title: 'Aviation Basics', provider: 'FAA', link: 'https://www.faa.gov/', difficulty: 'Easy' },
      { id: 197, title: 'Flight Training', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Medium' },
      { id: 198, title: 'Advanced Aviation', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Hard' }
    ],
    'Real Estate Agent': [
      { id: 199, title: 'Real Estate Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 200, title: 'Property Management', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 201, title: 'Advanced Real Estate', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Stockbroker': [
      { id: 202, title: 'Stock Market Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 203, title: 'Trading Strategies', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 204, title: 'Advanced Trading', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Insurance Agent': [
      { id: 205, title: 'Insurance Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 206, title: 'Risk Management', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 207, title: 'Advanced Insurance', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Event Planner': [
      { id: 208, title: 'Event Planning Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 209, title: 'Corporate Events', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 210, title: 'Advanced Events', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Travel Agent': [
      { id: 211, title: 'Travel Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 212, title: 'Tourism Management', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 213, title: 'Advanced Travel', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Photographer': [
      { id: 214, title: 'Photography Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 215, title: 'Photo Editing', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 216, title: 'Advanced Photography', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Musician': [
      { id: 217, title: 'Music Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 218, title: 'Music Theory', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 219, title: 'Advanced Music', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Actor': [
      { id: 220, title: 'Acting Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 221, title: 'Performance', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 222, title: 'Advanced Acting', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Athlete': [
      { id: 223, title: 'Fitness Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 224, title: 'Sports Training', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 225, title: 'Advanced Sports', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Fitness Trainer': [
      { id: 226, title: 'Fitness Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 227, title: 'Personal Training', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 228, title: 'Advanced Training', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Nutritionist': [
      { id: 229, title: 'Nutrition Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 230, title: 'Diet Planning', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 231, title: 'Advanced Nutrition', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Psychologist': [
      { id: 232, title: 'Psychology Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 233, title: 'Counseling', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 234, title: 'Advanced Psychology', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Therapist': [
      { id: 235, title: 'Therapy Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 236, title: 'Rehabilitation', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 237, title: 'Advanced Therapy', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Social Worker': [
      { id: 238, title: 'Social Work Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 239, title: 'Community Work', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 240, title: 'Advanced Social Work', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ],
    'Counsellor': [
      { id: 241, title: 'Counselling Basics', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 242, title: 'Mental Health', provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 243, title: 'Advanced Counselling', provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ]
  };

  // Fetch all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingIndustries(true);
        setError('');
        
        // Fetch industries
        const industriesRes = await careerAPI.getIndustries();
        setIndustries(industriesRes.data?.data || []);
        
        // Fetch all careers to build course mapping
        const careersRes = await careerAPI.getAllCareers();
        if (careersRes.data?.success) {
          setAllCareersData(careersRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data.');
      } finally {
        setLoadingIndustries(false);
      }
    };

    loadData();
  }, []);

  const handleIndustrySelect = async (industry) => {
    setSelectedIndustry(industry);
    setSelectedCareer(null);
    setSelectedDifficulty('All');
    setCareers([]);
    setLoadingCareers(true);
    setError('');

    try {
      const res = await careerAPI.getCareersByIndustry(industry._id || industry.id);
      const careerDocs = res.data?.data || [];
      const names = [...new Set(careerDocs.map((career) => career.careerName || career.title || career.career_name).filter(Boolean))];
      setCareers(names);
      if (names.length === 0) {
        setError('No careers were found for this industry.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load careers for this industry.');
    } finally {
      setLoadingCareers(false);
    }
  };

  // Get courses for selected career - use default courses as fallback
  const getCoursesForCareer = (careerName) => {
    if (!careerName) return [];
    
    // First check if we have courses in default list
    if (defaultCourses[careerName]) {
      return defaultCourses[careerName];
    }
    
    // Try case-insensitive match
    const lowerName = careerName.toLowerCase();
    for (const [key, courses] of Object.entries(defaultCourses)) {
      if (key.toLowerCase() === lowerName) {
        return courses;
      }
    }
    
    // Return generic courses for unknown careers
    return [
      { id: 1, title: `Introduction to ${careerName}`, provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Easy' },
      { id: 2, title: `${careerName} Fundamentals`, provider: 'edX', link: 'https://www.edx.org/', difficulty: 'Medium' },
      { id: 3, title: `Advanced ${careerName}`, provider: 'Coursera', link: 'https://www.coursera.org/', difficulty: 'Hard' }
    ];
  };

  const selectedCourses = selectedCareer ? getCoursesForCareer(selectedCareer) : [];

  const filteredCourses = selectedDifficulty === 'All'
    ? selectedCourses
    : selectedCourses.filter((course) => course.difficulty === selectedDifficulty);

  const resetToCareer = () => {
    setSelectedCareer(null);
    setSelectedDifficulty('All');
  };

  const resetAll = () => {
    setSelectedIndustry(null);
    setSelectedCareer(null);
    setSelectedDifficulty('All');
  };

  return (
    <div className="course-page-container">
      <div className="course-white-card">
        {!selectedIndustry ? (
          <div className="selection-phase">
            <h2>Choose an industry</h2>
            <p>Select an industry first, then choose a career to see course recommendations by difficulty.</p>
            {loadingIndustries ? (
              <p className="no-results">Loading industries…</p>
            ) : (
              <div className="career-selection-grid">
                {industries.map((industry) => (
                  <button
                    key={industry._id || industry.id}
                    className="career-opt-btn"
                    onClick={() => handleIndustrySelect(industry)}
                  >
                    {industry.industry_name || industry.name}
                  </button>
                ))}
              </div>
            )}
            {error && <p className="no-results">{error}</p>}
          </div>
        ) : !selectedCareer ? (
          <div className="selection-phase">
            <div className="results-header">
              <button className="text-back-btn" onClick={resetAll}>← Change Industry</button>
            </div>
            <h2>{selectedIndustry.industry_name || selectedIndustry.name} career paths</h2>
            <p>Pick the career you want to prepare for.</p>
            {loadingCareers ? (
              <p className="no-results">Loading careers…</p>
            ) : careers.length > 0 ? (
              <div className="career-selection-grid">
                {careers.map((career) => (
                  <button
                    key={career}
                    className="career-opt-btn"
                    onClick={() => setSelectedCareer(career)}
                  >
                    {career}
                  </button>
                ))}
              </div>
            ) : (
              <p className="no-results">{error || 'No careers available for this industry.'}</p>
            )}
          </div>
        ) : (
          <div className="results-phase">
            <div className="results-header results-header-stack">
              <div className="results-header-actions">
                <button className="text-back-btn" onClick={resetToCareer}>← Change Career</button>
                <button className="text-back-btn secondary" onClick={resetAll}>← Change Industry</button>
              </div>
              <div>
                <h2>Courses for {selectedCareer}</h2>
                <p>Showing {filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'} for {selectedCareer} in {selectedIndustry.industry_name || selectedIndustry.name}.</p>
              </div>
            </div>

            <div className="filter-bar">
              {difficultyLevels.map((level) => (
                <button
                  key={level}
                  className={`filter-btn ${selectedDifficulty === level ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(level)}
                >
                  {level}
                </button>
              ))}
            </div>

            {filteredCourses.length === 0 ? (
              <p className="no-results">No {selectedDifficulty.toLowerCase()} courses found for this career.</p>
            ) : (
              <div className="course-list-vertical">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="course-row-item">
                    <div className="course-main-info">
                      <span className={`course-level-tag ${course.difficulty.toLowerCase()}`}>{course.difficulty}</span>
                      <h3>{course.title}</h3>
                      <p>Platform: <strong>{course.provider}</strong></p>
                    </div>
                    <a href={course.link} target="_blank" rel="noopener noreferrer" className="visit-course-btn">
                      View Course
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSuggestions;