const mongoose = require('mongoose');
const { getCareerDbConnection } = require('../config/careerDb');

const careerDb = getCareerDbConnection();

// 1. Industry Schema - Map to 'industry'
const IndustrySchema = new mongoose.Schema({
    industry_name: String,
    industry_description: String
});
const Industry = careerDb.model('Industry', IndustrySchema, 'industry');

// Change your CareerInfoSchema to this:
const CareerInfoSchema = new mongoose.Schema({
    careerName: String, // Ensure this matches what you use in Results.js
    title: String,      // Keeping this just in case
    industryId: String, 
    minScore: Number,
    description: String
});
const Career = careerDb.model('Career', CareerInfoSchema, 'careerInfo');

// 3. User Skills Schema - Map to 'userSkills'
const SkillSchema = new mongoose.Schema({
    skill_name: String,
    industry_id: { type: mongoose.Schema.Types.Mixed }, // Use Mixed to handle ObjectId/String issues
    weight: Number
});
const Skill = careerDb.model('Skill', SkillSchema, 'userSkills');

// 4. Quiz Questions Schema - Map to 'quizQuestions'
const QuizSchema = new mongoose.Schema({
    industryId: String,
    question: String,
    options: { type: [String], required: true }, // Array of strings: ["Yes", "No"]
    scores: { type: [Number], required: true }
});
const CareerQuizQuestion = careerDb.model('CareerQuizQuestion', QuizSchema, 'quizQuestions');

module.exports = {
    Industry/*: mongoose.model('Industry', IndustrySchema)*/,
    Career/*: mongoose.model('Career', CareerInfoSchema)*/,
    Skill/*: mongoose.model('Skill', SkillSchema)*/,
    CareerQuizQuestion
};
