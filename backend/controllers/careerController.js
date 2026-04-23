const mongoose = require('mongoose');
const { Industry, Career, Skill, CareerQuizQuestion } = require('../models/Schema');

const buildIndustryFilters = (industryId) => {
    const filters = [{ industryId: String(industryId) }];

    if (mongoose.Types.ObjectId.isValid(industryId)) {
        filters.push({ industryId: new mongoose.Types.ObjectId(industryId) });
    }

    return filters;
};

const getIndustryRecords = async () => {
    const primaryIndustries = await Industry.find().sort({ industry_name: 1 });

    if (primaryIndustries.length > 0) {
        return primaryIndustries;
    }

    const fallbackCollections = ['industries', 'Industry'];

    for (const collectionName of fallbackCollections) {
        try {
            const docs = await mongoose.connection.db
                .collection(collectionName)
                .find({})
                .sort({ industry_name: 1 })
                .toArray();

            if (docs.length > 0) {
                return docs;
            }
        } catch (error) {
            // Ignore missing fallback collections and continue searching.
        }
    }

    return [];
};

exports.getIndustries = async (req, res) => {
    try {
        const industries = await getIndustryRecords();

        res.status(200).json({
            success: true,
            data: industries
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSkillsByIndustry = async (req, res) => {
    try {
        const { industryId } = req.params;
        const filters = [{ industry_id: String(industryId) }];

        if (mongoose.Types.ObjectId.isValid(industryId)) {
            filters.push({ industry_id: new mongoose.Types.ObjectId(industryId) });
        }

        const skills = await Skill.find({ $or: filters }).sort({ skill_name: 1 });

        res.status(200).json({
            success: true,
            data: skills
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCareersByIndustry = async (req, res) => {
    try {
        const { industryId } = req.params;
        const careers = await Career.find({ $or: buildIndustryFilters(industryId) })
            .sort({ careerName: 1 });

        res.status(200).json({
            success: true,
            data: careers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCareers = async (req, res) => {
    try {
        // Get all careers and group them by industry
        const careers = await Career.find({}).sort({ industryId: 1, careerName: 1 });
        
        // Group careers by industry
        const careersByIndustry = {};
        careers.forEach(career => {
            const industryKey = career.industryId || 'Unknown';
            if (!careersByIndustry[industryKey]) {
                careersByIndustry[industryKey] = [];
            }
            careersByIndustry[industryKey].push({
                careerName: career.careerName,
                title: career.title,
                description: career.description
            });
        });

        res.status(200).json({
            success: true,
            data: careersByIndustry
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getQuizByIndustry = async (req, res) => {
    try {
        const { industryId } = req.params;
        const quizQuestions = await CareerQuizQuestion.find({ $or: buildIndustryFilters(industryId) });

        res.status(200).json({
            success: true,
            data: quizQuestions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.recommendCareer = async (req, res) => {
    try {
        const {
            industryId,
            selectedSkillIds = [],
            educationLevel,
            quizResponses = [],
            quizScore
        } = req.body;

        if (!industryId) {
            return res.status(400).json({
                success: false,
                message: 'industryId is required'
            });
        }

        const skillFilters = [{ industry_id: String(industryId) }];

        if (mongoose.Types.ObjectId.isValid(industryId)) {
            skillFilters.push({ industry_id: new mongoose.Types.ObjectId(industryId) });
        }

        const allIndustrySkills = await Skill.find({ $or: skillFilters });
        const selectedSkillIdSet = new Set(selectedSkillIds.map((id) => String(id)));

        const maxSkillPoints = allIndustrySkills.reduce((sum, skill) => sum + (skill.weight || 0), 0);
        const userSkillPoints = allIndustrySkills.reduce((sum, skill) => {
            return selectedSkillIdSet.has(String(skill._id))
                ? sum + (skill.weight || 0)
                : sum;
        }, 0);

        const skillScoreFinal = maxSkillPoints > 0 ? (userSkillPoints / maxSkillPoints) * 50 : 0;

        const eduWeights = {
            'High School': 10,
            Diploma: 15,
            Bsc: 25,
            Bachelors: 25,
            Masters: 30,
            PhD: 30
        };
        const eduScoreFinal = eduWeights[educationLevel] || 0;

        const normalizedQuizScore = Array.isArray(quizResponses) && quizResponses.length > 0
            ? quizResponses.reduce((sum, val) => sum + Number(val || 0), 0)
            : Number(quizScore || 0);

        const maxPossibleQuizPoints = 50;
        const quizScoreFinal = (normalizedQuizScore / maxPossibleQuizPoints) * 20;
        const totalUserScore = skillScoreFinal + eduScoreFinal + quizScoreFinal;

        const recommendedCareers = await Career.find({
            $or: buildIndustryFilters(industryId),
            minScore: { $lte: Number(totalUserScore) }
        })
            .sort({ minScore: -1 })
            .limit(3);

        res.status(200).json({
            success: true,
            data: {
                totalScore: Number(totalUserScore.toFixed(2)),
                breakdown: {
                    skillScoreFinal: Number(skillScoreFinal.toFixed(2)),
                    eduScoreFinal: Number(eduScoreFinal.toFixed(2)),
                    quizScoreFinal: Number(quizScoreFinal.toFixed(2))
                },
                recommendations: recommendedCareers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
