const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Publicly viewable routes for student dashboard
router.get('/', auth(['student', 'admin']), projectController.getAllProjects);
router.get('/leaderboard', auth(['admin']), projectController.getLeaderboard);
router.get('/:id', auth(['student', 'admin']), projectController.getProjectById);

// Admin only routes for project management
router.post('/', auth(['admin']), projectController.addProject);
router.put('/:id', auth(['admin']), projectController.updateProject);
router.delete('/:id', auth(['admin']), projectController.deleteProject);

module.exports = router;
