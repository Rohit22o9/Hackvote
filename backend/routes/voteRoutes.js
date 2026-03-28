const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const auth = require('../middleware/auth');

// Any logged-in student can submit a vote or check their own list of voted projects
router.post('/', auth(['student']), voteController.voteProject);
router.get('/my-votes', auth(['student']), voteController.getUserVotes);

module.exports = router;
