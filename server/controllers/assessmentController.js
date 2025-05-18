const Essay = require('../models/Essay');
const CognitiveAssessment = require('../models/CognitiveAssessment');
const EssayAnalysisService = require('../services/essayAnalysis');

exports.analyzeEssay = async (req, res) => {
  try {
    const { essayId } = req.params;
    const essay = await Essay.findById(essayId);
    
    if (!essay) {
      return res.status(404).json({ message: 'Essay not found' });
    }

    // Perform essay analysis
    const analysisResults = await EssayAnalysisService.analyzeEssay(essayId);

    // Update cognitive assessment
    let cognitiveAssessment = await CognitiveAssessment.findOne({ student: essay.author });
    
    if (!cognitiveAssessment) {
      // Initialize new cognitive assessment if not exists
      cognitiveAssessment = new CognitiveAssessment({
        student: essay.author,
        skills: [
          { name: 'thesis_construction', level: 0 },
          { name: 'evidence_evaluation', level: 0 },
          { name: 'logical_reasoning', level: 0 },
          { name: 'counter_argument_handling', level: 0 },
          { name: 'conclusion_synthesis', level: 0 },
          { name: 'rhetorical_awareness', level: 0 },
          { name: 'source_integration', level: 0 },
          { name: 'argument_structure', level: 0 }
        ]
      });
    }

    // Update skills based on analysis
    await cognitiveAssessment.updateSkills(analysisResults.analysis);

    // Record assessment history
    cognitiveAssessment.assessmentHistory.push({
      essayId,
      skillsAssessed: Object.entries(analysisResults.analysis).map(([skill, newLevel]) => ({
        skill,
        previousLevel: cognitiveAssessment.skills.find(s => s.name === skill)?.level || 0,
        newLevel,
        improvement: newLevel - (cognitiveAssessment.skills.find(s => s.name === skill)?.level || 0)
      })),
      aiAnalysis: {
        strengths: analysisResults.feedback.strengths,
        weaknesses: analysisResults.feedback.weaknesses,
        recommendations: analysisResults.feedback.specificSuggestions
      }
    });

    await cognitiveAssessment.save();

    // Update essay with feedback
    essay.feedback.push({
      reviewer: null, // AI-generated feedback
      comments: analysisResults.feedback.specificSuggestions.map(suggestion => ({
        section: 'ai-feedback',
        text: suggestion,
        rating: null
      })),
      overallRating: Object.values(analysisResults.analysis).reduce((acc, val) => acc + val, 0) / 
                    Object.keys(analysisResults.analysis).length
    });

    await essay.save();

    res.json({
      analysis: analysisResults,
      cognitiveAssessment: {
        currentLevel: cognitiveAssessment.learningPath.currentLevel,
        overallProgress: cognitiveAssessment.overallProgress,
        recommendedSkills: cognitiveAssessment.learningPath.recommendedSkills,
        nextMilestone: cognitiveAssessment.learningPath.nextMilestone
      }
    });
  } catch (err) {
    console.error('Error in essay analysis:', err);
    res.status(500).json({ message: 'Error analyzing essay', error: err.message });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const assessment = await CognitiveAssessment.findOne({ student: studentId })
      .populate('assessmentHistory.essayId');

    if (!assessment) {
      return res.status(404).json({ message: 'No assessment found for this student' });
    }

    // Calculate progress trends
    const progressTrends = assessment.assessmentHistory.map(history => ({
      date: history.date,
      essayTitle: history.essayId.title,
      skillsProgress: history.skillsAssessed.map(skill => ({
        skill: skill.skill,
        improvement: skill.improvement
      }))
    }));

    // Generate personalized recommendations
    const recommendations = assessment.learningPath.recommendedSkills.map(skill => ({
      skill: skill.skill,
      priority: skill.priority,
      resources: EssayAnalysisService.getResourcesForSkill(skill.skill),
      exercises: EssayAnalysisService.getPracticeExercises(
        skill.skill,
        assessment.skills.find(s => s.name === skill.skill)?.level || 0
      )
    }));

    res.json({
      currentLevel: assessment.learningPath.currentLevel,
      overallProgress: assessment.overallProgress,
      skillLevels: assessment.skills,
      progressTrends,
      recommendations,
      nextMilestone: assessment.learningPath.nextMilestone
    });
  } catch (err) {
    console.error('Error fetching student progress:', err);
    res.status(500).json({ message: 'Error fetching progress', error: err.message });
  }
};

exports.generatePracticeTest = async (req, res) => {
  try {
    const { studentId } = req.params;
    const assessment = await CognitiveAssessment.findOne({ student: studentId });

    if (!assessment) {
      return res.status(404).json({ message: 'No assessment found for this student' });
    }

    // Generate personalized practice test based on student's current level
    const weakestSkills = assessment.learningPath.recommendedSkills;
    const practiceTest = {
      targetSkills: weakestSkills,
      exercises: []
    };

    // Generate exercises for each weak skill
    for (const skill of weakestSkills) {
      const currentLevel = assessment.skills.find(s => s.name === skill.skill)?.level || 0;
      const exercises = EssayAnalysisService.getPracticeExercises(skill.skill, currentLevel);
      practiceTest.exercises.push(...exercises);
    }

    res.json({
      practiceTest,
      estimatedDuration: practiceTest.exercises.length * 20, // minutes
      difficulty: assessment.learningPath.currentLevel,
      focusAreas: weakestSkills.map(skill => skill.skill)
    });
  } catch (err) {
    console.error('Error generating practice test:', err);
    res.status(500).json({ message: 'Error generating test', error: err.message });
  }
};

exports.submitPracticeTest = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { answers } = req.body;

    const assessment = await CognitiveAssessment.findOne({ student: studentId });
    if (!assessment) {
      return res.status(404).json({ message: 'No assessment found for this student' });
    }

    // Analyze practice test answers
    const results = await Promise.all(
      answers.map(async answer => {
        const analysis = await EssayAnalysisService.analyzeEssay(answer.essayId);
        return {
          exerciseId: answer.exerciseId,
          skillAssessed: answer.skill,
          score: analysis.analysis[answer.skill],
          feedback: analysis.feedback
        };
      })
    );

    // Update cognitive assessment with practice test results
    const updatedSkills = {};
    results.forEach(result => {
      if (!updatedSkills[result.skillAssessed]) {
        updatedSkills[result.skillAssessed] = [];
      }
      updatedSkills[result.skillAssessed].push(result.score);
    });

    // Calculate average scores and update skills
    Object.entries(updatedSkills).forEach(([skill, scores]) => {
      const averageScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;
      const skillIndex = assessment.skills.findIndex(s => s.name === skill);
      if (skillIndex !== -1) {
        assessment.skills[skillIndex].level = averageScore;
      }
    });

    // Update learning path
    assessment.updateLearningPath();
    await assessment.save();

    res.json({
      results,
      updatedAssessment: {
        currentLevel: assessment.learningPath.currentLevel,
        overallProgress: assessment.overallProgress,
        nextMilestone: assessment.learningPath.nextMilestone
      }
    });
  } catch (err) {
    console.error('Error submitting practice test:', err);
    res.status(500).json({ message: 'Error submitting test', error: err.message });
  }
}; 