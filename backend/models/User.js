const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  prn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  votedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
