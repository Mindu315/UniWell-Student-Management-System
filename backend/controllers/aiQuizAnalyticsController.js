/**
 * AI Quiz Analytics Controller
 * Computes strengths/improvements based on correct-answer rate.
 */

const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

const groupAverage = (rows) => {
  const count = rows.length;
  const avg = count > 0 ? rows.reduce((s, r) => s + r.correctRate, 0) / count : 0;
  return { count, avgRate: avg };
};

const buildRecommendations = ({ overallAvgRate, bySubject, byDifficulty }) => {
  const strengths = [];
  const improvements = [];

  const subjectSorted = [...bySubject].sort((a, b) => b.avgRate - a.avgRate);
  const difficultySorted = [...byDifficulty].sort((a, b) => b.avgRate - a.avgRate);

  if (subjectSorted[0] && subjectSorted[0].avgRate > 0) {
    strengths.push({
      label: subjectSorted[0].label,
      detail: `Best accuracy: ${(subjectSorted[0].avgRate * 100).toFixed(0)}% across ${subjectSorted[0].count} attempt(s).`
    });
  }

  if (difficultySorted[0] && difficultySorted[0].avgRate > 0) {
    strengths.push({
      label: `Difficulty: ${difficultySorted[0].label}`,
      detail: `Strongest difficulty: ${(difficultySorted[0].avgRate * 100).toFixed(0)}% average.`
    });
  }

  const subjectWorst = subjectSorted.slice(-1)[0];
  const difficultyWorst = difficultySorted.slice(-1)[0];

  if (subjectWorst && subjectWorst.count > 0 && subjectWorst.avgRate < 0.65) {
    improvements.push({
      label: `Improve in ${subjectWorst.label}`,
      detail: `Accuracy is ${(subjectWorst.avgRate * 100).toFixed(0)}%. Try reviewing the PDF topic and answering similar MCQs.`
    });
  }

  if (difficultyWorst && difficultyWorst.count > 0 && difficultyWorst.avgRate < 0.65) {
    improvements.push({
      label: `Improve at ${difficultyWorst.label} difficulty`,
      detail: `Accuracy is ${(difficultyWorst.avgRate * 100).toFixed(0)}%. Focus on key concepts and definitions before retaking.`
    });
  }

  if (overallAvgRate >= 0.8) {
    improvements.push({
      label: 'Next step: accuracy consistency',
      detail: 'You are performing very well. To push further, aim for the same accuracy across different subjects and difficulty levels.'
    });
  } else if (overallAvgRate <= 0.6) {
    improvements.push({
      label: 'Start with fundamentals',
      detail: 'Your average accuracy is on the lower side. Re-read the PDF, then practice with smaller quiz sets (e.g., 5-10 questions) before increasing difficulty.'
    });
  }

  const tips = [
    'After each attempt, review the incorrect questions and compare options with the source text.',
    'Generate a new quiz for the same subject but slightly lower difficulty to build confidence.',
    'Try to answer all questions before revealing, so you get a fair score.'
  ];

  // Ensure we always return meaningful arrays.
  return {
    strengths: strengths.slice(0, 2),
    improvements: improvements.slice(0, 3),
    tips
  };
};

const getAnalytics = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(200);

    if (!attempts || attempts.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No quiz attempts yet',
        data: {
          overall: { attemptsCount: 0, averageCorrectRate: 0, averageCorrectPercent: 0 },
          bySubject: [],
          byDifficulty: [],
          recommendations: {
            strengths: [],
            improvements: [
              { label: 'Generate & attempt a quiz', detail: 'Once you submit quiz results, we will show analytics based on your correct-answer rate.' }
            ],
            tips: [
              'Upload a PDF and generate a quiz.',
              'Answer each question, then reveal answers and submit your score.'
            ]
          },
          recentAttempts: []
        }
      });
    }

    const quizIds = [...new Set(attempts.map((a) => String(a.quizId)))];
    const quizzes = await Quiz.find({ _id: { $in: quizIds } }).select('_id quizTitle subject difficulty');
    const quizMap = {};
    for (const q of quizzes) {
      quizMap[String(q._id)] = q;
    }

    const bySubjectMap = {};
    const byDifficultyMap = {};

    let correctRateSum = 0;
    for (const a of attempts) {
      correctRateSum += a.correctRate;
      const quiz = quizMap[String(a.quizId)];
      const subjectLabel = quiz?.subject || 'General';
      const difficultyLabel = quiz?.difficulty || 'medium';

      if (!bySubjectMap[subjectLabel]) bySubjectMap[subjectLabel] = [];
      if (!byDifficultyMap[difficultyLabel]) byDifficultyMap[difficultyLabel] = [];
      bySubjectMap[subjectLabel].push(a);
      byDifficultyMap[difficultyLabel].push(a);
    }

    const bySubject = Object.entries(bySubjectMap).map(([label, rows]) => {
      const g = groupAverage(rows);
      return { label, count: g.count, avgRate: g.avgRate };
    });

    const byDifficulty = Object.entries(byDifficultyMap).map(([label, rows]) => {
      const g = groupAverage(rows);
      return { label, count: g.count, avgRate: g.avgRate };
    });

    const overallAvgRate = correctRateSum / attempts.length;

    // Recent attempts for display.
    const recentAttempts = attempts.slice(0, 8).map((a) => {
      const quiz = quizMap[String(a.quizId)];
      return {
        _id: a._id,
        quizTitle: quiz?.quizTitle || 'Quiz',
        subject: quiz?.subject || 'General',
        difficulty: quiz?.difficulty || 'medium',
        correctCount: a.correctCount,
        totalCount: a.totalCount,
        correctRate: a.correctRate,
        correctPercent: (a.correctRate * 100).toFixed(0),
        createdAt: a.createdAt
      };
    });

    const recommendations = buildRecommendations({
      overallAvgRate,
      bySubject,
      byDifficulty
    });

    return res.status(200).json({
      success: true,
      message: 'Quiz analytics retrieved successfully',
      data: {
        overall: {
          attemptsCount: attempts.length,
          averageCorrectRate: overallAvgRate,
          averageCorrectPercent: (overallAvgRate * 100).toFixed(0)
        },
        bySubject: bySubject.map((x) => ({
          subject: x.label,
          attempts: x.count,
          avgCorrectPercent: (x.avgRate * 100).toFixed(0)
        })),
        byDifficulty: byDifficulty.map((x) => ({
          difficulty: x.label,
          attempts: x.count,
          avgCorrectPercent: (x.avgRate * 100).toFixed(0)
        })),
        recommendations,
        recentAttempts
      }
    });
  } catch (error) {
    console.error('Quiz analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving quiz analytics',
      error: error.message
    });
  }
};

module.exports = { getAnalytics };

