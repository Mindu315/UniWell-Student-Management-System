const mongoose = require('mongoose');
const { Industry, Career, Skill, Quiz } = require('../models/Schema');

exports.recommendCareer = async (req, res) => {
    console.log("--- REQUEST RECEIVED ---"); // THIS MUST SHOW IN TERMINAL
    try {
        const { industryId, selectedSkillIds, educationLevel, quizResponses } = req.body;
        
       // --- THE FIX: Convert String ID to ObjectId for the search ---
        const convertedIndustryId = new mongoose.Types.ObjectId(industryId);

        // Search using the converted ID
        const allIndustrySkills = await Skill.find({ 
            industry_id: convertedIndustryId 
        });

        console.log(`Diagnostic: Searching for ${industryId}`);
        console.log(`Results: Found ${allIndustrySkills.length} skills`);

        // If it STILL says 0, try searching by String as a fallback
        if (allIndustrySkills.length === 0) {
            const stringSearch = await Skill.find({ industry_id: industryId });
            if (stringSearch.length > 0) {
                allIndustrySkills.push(...stringSearch);
            }
        }
        
        // --- End of Fix ---

        const maxSkillPoints = allIndustrySkills.reduce((sum, s) => sum + (s.weight || 0), 0);
        
        let userSkillPoints = 0;
        allIndustrySkills.forEach(dbSkill => {
            // Ensure we compare strings to strings
            if (selectedSkillIds.includes(dbSkill._id.toString())) {
                userSkillPoints += (dbSkill.weight || 0);
            }
        });

        const skillScoreFinal = maxSkillPoints > 0 ? (userSkillPoints / maxSkillPoints) * 50 : 0;
        
        // --- PHASE 2: Education Calculation (30%) ---
        let eduScoreFinal = 0;
        const eduWeights = {
            "High School": 10,
            "Diploma": 15,
            "Bachelors": 25,
            "Masters": 30,
            "PhD": 30
        };
        eduScoreFinal = eduWeights[educationLevel] || 0;

        // --- PHASE 3: Quiz Calculation (20%) ---
        // Expecting quizResponses as an array of selected option scores: [4, 2, 4, 1, 4]
        const totalQuizPoints = quizResponses.reduce((sum, val) => sum + val, 0);
        const maxPossibleQuizPoints = 50; // 5 questions * max score 4
        const quizScoreFinal = (totalQuizPoints / maxPossibleQuizPoints) * 20;

        // --- TOTAL CALCULATION ---
        const totalUserScore = skillScoreFinal + eduScoreFinal + quizScoreFinal;

        console.log(`Final Score: ${totalUserScore}. Searching for careers...`);

        // --- FETCHING CAREERS ---
        const recommendedCareers = await Career.find({
            // Match the industryId as a string
            industryId: industryId.toString(), 
            // Match careers where requirement is LESS than or equal to 75
            minScore: { $lte: Number(totalUserScore) } 
        })
        .sort({ minScore: -1 }) // Show the highest "minScore" first (the 70 and 65 ones)
        .limit(2);

        console.log(`Querying DB with industryId: ${industryId} and max score: ${totalUserScore}`);
        console.log(`Found ${recommendedCareers.length} matching careers.`);
        

        res.status(200).json({
            success: true,
            totalScore: totalUserScore.toFixed(2),
            breakdown: { skillScoreFinal, eduScoreFinal, quizScoreFinal },
            recommendations: recommendedCareers
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};