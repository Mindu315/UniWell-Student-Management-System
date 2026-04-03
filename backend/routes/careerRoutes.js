const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const careerController = require('../controllers/careerController');

router.get('/industries', protect, careerController.getIndustries);
router.get('/industries/:industryId/skills', protect, careerController.getSkillsByIndustry);
router.get('/industries/:industryId/quiz', protect, careerController.getQuizByIndustry);
router.post('/recommend', protect, careerController.recommendCareer);

module.exports = router;
