const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    best: { type: Number, default: 0 },
    good: { type: Number, default: 0 },
    moderate: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
