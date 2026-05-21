const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { requireMember, requireAdmin } = require('../middleware/roleGuard');
const {
  getProjects, createProject, getProject, updateProject, deleteProject,
  addMember, removeMember, updateMemberRole
} = require('../controllers/projectController');

router.get('/', auth, getProjects);

router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Project name is required')
], createProject);

router.get('/:id', auth, requireMember, getProject);
router.put('/:id', auth, requireAdmin, updateProject);
router.delete('/:id', auth, requireAdmin, deleteProject);

router.post('/:id/members', auth, requireAdmin, [
  body('email').isEmail().withMessage('Valid email is required')
], addMember);
router.delete('/:id/members/:userId', auth, requireAdmin, removeMember);
router.put('/:id/members/:userId/role', auth, requireAdmin, updateMemberRole);

module.exports = router;
