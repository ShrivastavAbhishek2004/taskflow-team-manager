const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { requireMember, requireAdmin } = require('../middleware/roleGuard');
const {
  getProjectTasks, createTask, getTask, updateTask, deleteTask, getDashboard
} = require('../controllers/taskController');

// Dashboard summary
router.get('/dashboard/summary', auth, getDashboard);

// Project tasks
router.get('/project/:projectId', auth, requireMember, getProjectTasks);

router.post('/project/:projectId', auth, requireMember, [
  body('title').trim().notEmpty().withMessage('Task title is required')
], createTask);

// Individual task operations
router.get('/:id', auth, getTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
