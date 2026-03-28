const Project = require('../models/Project');

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project detail' });
  }
};

exports.addProject = async (req, res) => {
  const { title, description, teamName } = req.body;
  if (!title || !description || !teamName) return res.status(400).json({ message: 'All project fields required' });

  try {
    const newProject = new Project({ title, description, teamName });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ message: 'Error adding project' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating project' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    // Leaderboard sorted by "Best" votes
    const stats = await Project.aggregate([
      {
        $project: {
          title: 1,
          teamName: 1,
          votesCount: { $add: ["$votes.best", "$votes.good", "$votes.moderate"] },
          bestCount: "$votes.best",
          goodCount: "$votes.good",
          moderateCount: "$votes.moderate"
        }
      },
      { $sort: { bestCount: -1, goodCount: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error generating leaderboard' });
  }
};
