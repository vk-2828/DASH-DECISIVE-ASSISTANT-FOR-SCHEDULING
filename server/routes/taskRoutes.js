const express = require('express');
const {
    createTask,
    getUserTasks,
    updateTask,
    deleteTask,
    getStarredTasks,
    getCompletedTasks,
    getDeletedTasks,
} = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// This line is crucial. It protects all subsequent routes in this file.
// No user can access these endpoints without a valid JWT token.
router.use(authMiddleware);

// --- Primary CRUD Routes ---

// @route   POST /api/tasks
// @desc    Create a new task for the logged-in user
router.post('/', createTask);

// @route   GET /api/tasks
// @desc    Get all active tasks for the logged-in user
router.get('/', getUserTasks);

// @route   PUT /api/tasks/:id
// @desc    Update a specific task by its ID
router.put('/:id', updateTask);

// @route   DELETE /api/tasks/:id
// @desc    "Soft delete" a task by its ID (move to trash)
router.delete('/:id', deleteTask);


// --- Filtered "GET" Routes ---

// @route   GET /api/tasks/starred
// @desc    Get only the user's starred tasks
router.get('/starred', getStarredTasks);

// @route   GET /api/tasks/completed
// @desc    Get only the user's completed tasks
router.get('/completed', getCompletedTasks);

// @route   GET /api/tasks/deleted
// @desc    Get the user's tasks from the trash
router.get('/deleted', getDeletedTasks);


module.exports = router;