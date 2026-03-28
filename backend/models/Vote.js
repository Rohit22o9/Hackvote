const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  prn: {
    type: String,
    required: true,
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  voteType: {
    type: String,
    enum: ['best', 'good', 'moderate'],
    required: true
  }
}, { timestamps: true });

// Ensure a student can only vote once for a specific project
VoteSchema.index({ prn: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
