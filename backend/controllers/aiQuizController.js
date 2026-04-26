/**
 * AI Quiz Controller
 * - Upload PDF
 * - Extract text
 * - Generate MCQs via AI (Groq)
 * - Save quiz per authenticated user
 */

const pdfParseLib = require('pdf-parse');
const Groq = require('groq-sdk');

const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

const clampInt = (value, min, max, fallback) => {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};

const truncateText = (text, maxChars) => {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
};

const safeExtractJson = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch {}
    }
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
    try {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }
};

const validateQuizJson = (quizJson) => {
  if (!quizJson || typeof quizJson !== 'object') return null;

  const { quizTitle, questions } = quizJson;
  if (!Array.isArray(questions) || questions.length === 0) return null;

  const normalizedQuestions = [];
  for (const q of questions) {
    if (!q || typeof q !== 'object') continue;
    const question = typeof q.question === 'string' ? q.question.trim() : '';
    const options = Array.isArray(q.options) ? q.options.map((x) => String(x)) : [];
    const correctOptionIndex =
      typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : q.correctIndex;
    const explanation =
      typeof q.explanation === 'string' ? q.explanation.trim() : undefined;

    if (!question) continue;
    if (!options || options.length !== 4) continue;

    const idx =
      typeof correctOptionIndex === 'number'
        ? correctOptionIndex
        : parseInt(correctOptionIndex, 10);
    if (Number.isNaN(idx) || idx < 0 || idx > 3) continue;

    normalizedQuestions.push({
      question,
      options,
      correctOptionIndex: idx,
      explanation: explanation || undefined,
    });
  }

  if (normalizedQuestions.length === 0) return null;

  return {
    quizTitle: typeof quizTitle === 'string' ? quizTitle.trim() : 'Generated Quiz',
    questions: normalizedQuestions,
  };
};

const parsePdfBuffer = async (buffer) => {
  if (typeof pdfParseLib === 'function') {
    return pdfParseLib(buffer);
  }

  if (typeof pdfParseLib?.default === 'function') {
    return pdfParseLib.default(buffer);
  }

  if (typeof pdfParseLib?.PDFParse === 'function') {
    const parser = new pdfParseLib.PDFParse({ data: buffer });
    try {
      return await parser.getText();
    } finally {
      await parser.destroy().catch(() => {});
    }
  }

  throw new Error('Unsupported pdf-parse module shape');
};

const extractTextFromPdfBuffer = async (buffer) => {
  const parsed = await parsePdfBuffer(buffer);
  return parsed?.text || '';
};

/**
 * Generate MCQs using the Groq API.
 */
const generateMcqsWithGroq = async ({
  extractedText,
  questionCount,
  subject,
  difficulty,
  groqApiKey,
  groqModel,
}) => {
  const client = new Groq({ apiKey: groqApiKey });

  const prompt = `You are an expert exam setter.
Generate ${questionCount} multiple-choice questions (MCQs) from the provided text.

Requirements:
- Return ONLY valid JSON (no markdown, no explanations outside JSON).
- The JSON must match this structure exactly:
{
  "quizTitle": string,
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctOptionIndex": 0 | 1 | 2 | 3,
      "explanation": string (1-2 sentences)
    }
  ]
}
- Each correct option must be consistent with the text.
- Difficulty: ${difficulty}. Subject/topic hint: ${subject || 'general'}.

Text:
"""
${extractedText}
"""`;

  const completion = await client.chat.completions.create({
    model: groqModel,
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'Return JSON only. No markdown, no extra text.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices?.[0]?.message?.content || '';
  return safeExtractJson(raw);
};

/**
 * POST /api/ai-quizzes/generate
 * multipart/form-data: pdf, questionCount?, subject?, difficulty?
 */
const generateQuizFromPdf = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file (field name: pdf)',
      });
    }

    const questionCount = clampInt(req.body.questionCount, 1, 25, 5);
    const subject =
      typeof req.body.subject === 'string' ? req.body.subject.trim() : '';
    const difficulty =
      typeof req.body.difficulty === 'string' ? req.body.difficulty.trim() : 'medium';

    const pdfText = await extractTextFromPdfBuffer(req.file.buffer);
    const extractedText = truncateText(pdfText, 12000);

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract enough text from the PDF. Please try a different PDF.',
      });
    }

    const groqApiKey = (process.env.GROQ_API_KEY || '').trim();
    const groqModel = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim();

    if (!groqApiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI generation is not configured. Please set GROQ_API_KEY in your backend environment.',
      });
    }

    const quizJson = await generateMcqsWithGroq({
      extractedText,
      questionCount,
      subject,
      difficulty,
      groqApiKey,
      groqModel,
    });

    const validated = validateQuizJson(quizJson);
    if (!validated) {
      return res.status(500).json({
        success: false,
        message: 'AI did not return valid quiz JSON. Please try again with a different PDF.',
      });
    }

    const quiz = await Quiz.create({
      userId: req.user.id,
      quizTitle: validated.quizTitle,
      subject,
      difficulty,
      sourcePdfFileName: req.file.originalname || '',
      extractedTextPreview: truncateText(pdfText, 2000),
      questionCount,
      questions: validated.questions,
      ai: {
        provider: 'groq',
        model: groqModel,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      data: {
        quizId: quiz._id,
        quiz: {
          _id: quiz._id,
          quizTitle: quiz.quizTitle,
          subject: quiz.subject,
          difficulty: quiz.difficulty,
          questionCount: quiz.questionCount,
          questions: quiz.questions,
        },
      },
    });
  } catch (error) {
    console.error('Generate quiz error:', error);

    if (error?.status === 401) {
      return res.status(502).json({
        success: false,
        message: 'Groq authentication failed. Please verify GROQ_API_KEY in backend/.env and restart the server.',
        error: 'Invalid Groq API key',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error generating quiz',
      error: error.message,
    });
  }
};

// GET /api/ai-quizzes
const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('_id quizTitle subject difficulty questionCount createdAt');

    res.status(200).json({
      success: true,
      message: 'Quizzes retrieved successfully',
      data: { count: quizzes.length, quizzes },
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving quizzes',
      error: error.message,
    });
  }
};

// GET /api/ai-quizzes/:id
const getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findOne({ _id: quizId, userId: req.user.id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz retrieved successfully',
      data: {
        quiz: {
          _id: quiz._id,
          quizTitle: quiz.quizTitle,
          subject: quiz.subject,
          difficulty: quiz.difficulty,
          questionCount: quiz.questionCount,
          questions: quiz.questions,
        },
      },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving quiz',
      error: error.message,
    });
  }
};

// DELETE /api/ai-quizzes/:id
const deleteQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findOneAndDelete({ _id: quizId, userId: req.user.id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await QuizAttempt.deleteMany({ quizId: quiz._id, userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
      error: error.message,
    });
  }
};

module.exports = {
  generateQuizFromPdf,
  getMyQuizzes,
  getQuizById,
  deleteQuizById,
};
