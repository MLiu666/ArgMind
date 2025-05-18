const mongoose = require('mongoose');

const CognitiveSkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      'thesis_construction',
      'evidence_evaluation',
      'logical_reasoning',
      'counter_argument_handling',
      'conclusion_synthesis',
      'rhetorical_awareness',
      'source_integration',
      'argument_structure'
    ]
  },
  level: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  subComponents: [{
    name: String,
    proficiency: Number,
    lastAssessed: Date
  }]
});

const CognitiveAssessmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: [CognitiveSkillSchema],
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  learningPath: {
    currentLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    recommendedSkills: [{
      skill: String,
      priority: Number
    }],
    nextMilestone: {
      skill: String,
      targetLevel: Number
    }
  },
  assessmentHistory: [{
    essayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Essay'
    },
    date: {
      type: Date,
      default: Date.now
    },
    skillsAssessed: [{
      skill: String,
      previousLevel: Number,
      newLevel: Number,
      improvement: Number
    }],
    aiAnalysis: {
      strengths: [String],
      weaknesses: [String],
      recommendations: [String]
    }
  }],
  adaptiveLearning: {
    currentFocus: [String],
    completedChallenges: [{
      skillArea: String,
      difficulty: String,
      completionDate: Date,
      score: Number
    }],
    nextChallenges: [{
      skillArea: String,
      difficulty: String,
      rationale: String
    }]
  }
});

// Method to update skill levels based on essay assessment
CognitiveAssessmentSchema.methods.updateSkills = async function(essayAnalysis) {
  const weightedUpdate = (currentLevel, newAssessment, weight = 0.3) => {
    return currentLevel * (1 - weight) + newAssessment * weight;
  };

  this.skills.forEach(skill => {
    if (essayAnalysis[skill.name]) {
      skill.level = weightedUpdate(skill.level, essayAnalysis[skill.name]);
    }
  });

  // Update overall progress
  this.overallProgress = this.skills.reduce((acc, skill) => acc + skill.level, 0) / this.skills.length;

  // Update learning path based on new levels
  this.updateLearningPath();
};

// Method to determine next learning objectives
CognitiveAssessmentSchema.methods.updateLearningPath = function() {
  const weakestSkills = this.skills
    .sort((a, b) => a.level - b.level)
    .slice(0, 3)
    .map(skill => ({
      skill: skill.name,
      priority: 1 - (skill.level / 100)
    }));

  this.learningPath.recommendedSkills = weakestSkills;
  this.learningPath.nextMilestone = {
    skill: weakestSkills[0].skill,
    targetLevel: Math.min(Math.ceil((this.skills.find(s => s.name === weakestSkills[0].skill).level + 20) / 10) * 10, 100)
  };

  // Update current level based on overall progress
  if (this.overallProgress >= 70) {
    this.learningPath.currentLevel = 'advanced';
  } else if (this.overallProgress >= 40) {
    this.learningPath.currentLevel = 'intermediate';
  } else {
    this.learningPath.currentLevel = 'beginner';
  }
};

module.exports = mongoose.model('CognitiveAssessment', CognitiveAssessmentSchema); 