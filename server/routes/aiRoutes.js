const express = require('express');
const { askAboutDash, createTaskFromText } = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// --- Apply Authentication Middleware ---
// All routes defined below this line will require a valid JWT token.
router.use(authMiddleware);

// --- Define AI Routes ---

// @route   POST /api/ai/ask
// @desc    Ask the AI assistant a question about the DASH application
// @access  Private (Requires Login)
router.post('/ask', askAboutDash);

// @route   POST /api/ai/create-task-text
// @desc    Create a new task from natural language text input
// @access  Private (Requires Login)
router.post('/create-task-text', createTaskFromText);


module.exports = router;