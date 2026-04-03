//import required packages
const express = require("express");
const mongoose = require('mongoose'); // Add this line
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const careerRoutes = require('./routes/careerRoutes');
const { Industry, Career, Skill, Quiz } = require('./models/Schema');
dotenv.config();

//define port
const PORT = process.env.PORT||5003;


// Import routes

const connection = require("./config/db");

//connection();
const app = express();



//middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/career', careerRoutes);

app.get('/api/industry', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        
        // This is the simplest way to check the count directly in Atlas
        const count = await db.collection('industry').countDocuments();
        /*console.log("Direct Atlas Document Count:", count);*/

        const rawData = await db.collection('industry').find({}).toArray();
        /*console.log("Raw Data Array Length:", rawData.length);*/

        res.json(rawData);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).send(err.message);
    }
});

// Fetch skills by Industry ID
app.get('/api/skills/:industryId', async (req, res) => {
    try {
        const { industryId } = req.params;
        
        // Find skills where industry_id matches the one clicked
        const skills = await Skill.find({ industry_id: industryId });
        
        console.log(`Found ${skills.length} skills for industry: ${industryId}`);
        res.json(skills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch Quiz Questions by Industry ID
app.get('/api/quiz/:industryId', async (req, res) => {
    try {
        const { industryId } = req.params;
        const questions = await Quiz.find({ industryId: industryId });
        
        if (questions.length === 0) {
            return res.status(404).json({ message: "No questions found for this industry." });
        }
        
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/calculate-career', async (req, res) => {
    try {
        const { industryId, userSkills, educationLevel, quizScore } = req.body;

        // --- STEP 1: Education Marks (Max 30) ---
        const eduMap = { 
            "High School": 5, 
            "Diploma": 10, 
            "Bsc": 20, 
            "Masters": 25, 
            "PhD": 30 
        };
        const educationMarks = eduMap[educationLevel] || 0;

        // --- STEP 2: Skills Marks (Max 50) ---
        // Formula: 10 marks per skill, but capped at 50.
        const skillsArray = Array.isArray(userSkills) ? userSkills : [];
        const rawSkillsMarks = skillsArray.length * 10;
        const skillsMarks = Math.min(rawSkillsMarks, 50); // Ensures it never exceeds 50

        // --- STEP 3 & 4: Normalized Quiz Marks (Max 20) ---
        // Formula: (Raw Score / 50) * 20
        const rawQuizScore = Number(quizScore) || 0;
        const normalizedQuizMarks = (rawQuizScore / 50) * 20;

        // --- FINAL TOTAL (Max 100) ---
        const totalMarks = Math.round(educationMarks + skillsMarks + normalizedQuizMarks);

        // Logging for your VS Code Terminal
        console.log(`--- User Evaluation [Industry: ${industryId}] ---`);
        console.log(`Step 1 (Education): ${educationMarks} / 30`);
        console.log(`Step 2 (Skills): ${skillsMarks} / 50`);
        console.log(`Step 3 (Quiz): ${Math.round(normalizedQuizMarks)} / 20`);
        console.log(`Final Result: ${totalMarks} / 100`);

        // --- DATABASE RECOMMENDATION ---
        const recommendedCareers = await Career.find({
            industryId: industryId,
            minScore: { $lte: totalMarks }
        })
        .sort({ minScore: -1 }) 
        .limit(2);

        res.json({
            totalMarks,
            educationMarks,
            skillsMarks,
            quizMarks: Math.round(normalizedQuizMarks),
            recommendedCareers
        });

    } catch (err) {
        console.error("Backend Calculation Error:", err);
        res.status(500).json({ error: "Calculation failed" });
    }
});

app.get('/api/recommendations/:industryId/:score', async (req, res) => {
    try {
        const { industryId, score } = req.params;
        const userScore = parseInt(score);

        // Find careers in this industry where minScore <= userScore
        // Sort by minScore descending to get the 'best' matches first
        const recommendedCareers = await Career.find({
            industryId: industryId,
            minScore: { $lte: userScore }
        }).sort({ minScore: -1 }).limit(2); // Take the top 2 matches

        res.json(recommendedCareers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Add this to the bottom of server.js (before app.listen)
app.use((err, req, res, next) => {
  console.error("--- GLOBAL ERROR CAUGHT ---");
  console.error(err.stack); // This WILL show in your VS Code terminal
  res.status(500).json({ error: err.message });
});

//start server
app.listen(PORT, () => {
    console.log(`Server running on port number: ${PORT}`)
})

