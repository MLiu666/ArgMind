const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  progress: {
    completedEssays: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Essay'
    }],
    skillLevels: {
      thesis: { type: Number, default: 1 },
      evidence: { type: Number, default: 1 },
      reasoning: { type: Number, default: 1 },
      organization: { type: Number, default: 1 }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema); 