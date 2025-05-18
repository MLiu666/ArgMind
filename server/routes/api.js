const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');

// Essay analysis endpoint
router.post('/analyze-essay', async (req, res) => {
    try {
        const { essay, previousSkillLevels } = req.body;
        
        if (!essay) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Essay text is required' 
            });
        }

        const analysis = await AIService.analyzeCognitiveSkills(essay, previousSkillLevels);
        res.json(analysis);
    } catch (error) {
        console.error('Essay analysis error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to analyze essay' 
        });
    }
});

module.exports = router; 