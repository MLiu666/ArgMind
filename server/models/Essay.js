const mongoose = require('mongoose');

const EssaySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    thesis: {
      type: String,
      required: true
    },
    arguments: [{
      claim: String,
      evidence: String,
      reasoning: String
    }],
    conclusion: String
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'revised'],
    default: 'draft'
  },
  feedback: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comments: [{
      section: String,
      text: String,
      rating: Number
    }],
    overallRating: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
EssaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Essay', EssaySchema); 