const Vote = require('../models/Vote');
const Project = require('../models/Project');
const User = require('../models/User');

exports.voteProject = async (req, res) => {
  const { projectId, voteType } = req.body;
  const { prn } = req.user;

  if (!projectId || !['best', 'good', 'moderate'].includes(voteType)) {
    return res.status(400).json({ message: 'Invalid vote data provided' });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user has already voted for THIS project
    const existingVote = await Vote.findOne({ prn, projectId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted for this project!' });
    }

    const newVote = new Vote({ prn, projectId, voteType });
    await newVote.save();

    // Increment corresponding vote in the Project Model for easier analytics
    project.votes[voteType] += 1;
    await project.save();

    // Update User's list of voted projects
    await User.findOneAndUpdate({ prn }, {
      $addToSet: { votedProjects: projectId }
    });

    res.status(201).json({ message: 'Vote submitted successfully!', voteType });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate vote detected! You already voted for this project.' });
    }
    res.status(500).json({ message: 'Server error processing vote', error: err.message });
  }
};

exports.getUserVotes = async (req, res) => {
  const { prn } = req.user;
  try {
    const user = await User.findOne({ prn }).select('votedProjects');
    res.json(user ? user.votedProjects : []);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your voting history' });
  }
};
