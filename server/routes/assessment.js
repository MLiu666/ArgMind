const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const auth = require('../middleware/auth');

// Analyze an essay and update cognitive assessment
router.post('/analyze/:essayId', auth, assessmentController.analyzeEssay);

// Get student's progress and recommendations
router.get('/progress/:studentId', auth, assessmentController.getStudentProgress);

// Generate practice test based on student's level
router.get('/practice-test/:studentId', auth, assessmentController.generatePracticeTest);

// Submit practice test answers
router.post('/practice-test/:studentId', auth, assessmentController.submitPracticeTest);

module.exports = router; 