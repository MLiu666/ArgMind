const fetch = require('node-fetch');
require('dotenv').config();

class AIService {
  static API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
  
  static MODELS = {
    MISTRAL: 'mistralai/Mistral-7B-v0.1',
    BART_CNN: 'facebook/bart-large-cnn',
    CODE_LLAMA: 'codellama/CodeLlama-7b-hf',
    STARCODER: 'bigcode/starcoder'
  };

  // Writing skills matrix for CDM
  static WRITING_SKILLS = {
    THESIS_DEVELOPMENT: {
      name: 'Thesis Development',
      aspects: ['clarity', 'specificity', 'arguability']
    },
    EVIDENCE_USAGE: {
      name: 'Evidence Usage',
      aspects: ['relevance', 'credibility', 'integration']
    },
    LOGICAL_REASONING: {
      name: 'Logical Reasoning',
      aspects: ['validity', 'soundness', 'fallacy-avoidance']
    },
    COUNTERARGUMENT_HANDLING: {
      name: 'Counterargument Handling',
      aspects: ['identification', 'response', 'integration']
    },
    ORGANIZATION_STRUCTURE: {
      name: 'Organization & Structure',
      aspects: ['coherence', 'flow', 'transitions']
    },
    ACADEMIC_LANGUAGE: {
      name: 'Academic Language',
      aspects: ['formality', 'precision', 'terminology']
    },
    PERSUASIVE_TECHNIQUES: {
      name: 'Persuasive Techniques',
      aspects: ['ethos', 'pathos', 'logos']
    },
    CITATION_INTEGRATION: {
      name: 'Citation Integration',
      aspects: ['formatting', 'synthesis', 'attribution']
    }
  };

  static getHeaders() {
    return {
      'Authorization': `Bearer ${this.API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  static async analyzeText(text, task) {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({ inputs: text, parameters: { candidate_labels: this.getLabelsByTask(task) } }),
        }
      );

      const result = await response.json();
      return this.processResults(result, task);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return null;
    }
  }

  static getLabelsByTask(task) {
    const taskLabels = {
      thesis: ['clear and specific', 'arguable', 'vague', 'non-argumentative'],
      evidence: ['strong evidence', 'relevant', 'weak evidence', 'irrelevant'],
      reasoning: ['logical connection', 'fallacious reasoning', 'unclear connection'],
      structure: ['well organized', 'coherent', 'disorganized', 'unclear structure']
    };

    return taskLabels[task] || taskLabels.thesis;
  }

  static processResults(result, task) {
    if (!result || !result.scores) return null;

    // Convert scores to percentages and create feedback
    const scores = result.scores.map((score, index) => ({
      label: result.labels[index],
      score: Math.round(score * 100)
    }));

    // Generate feedback based on highest scoring label
    const topScore = scores.reduce((prev, current) => 
      (current.score > prev.score) ? current : prev
    );

    return {
      scores,
      primaryLabel: topScore.label,
      score: this.calculateOverallScore(scores, task),
      feedback: this.generateFeedback(topScore.label, task)
    };
  }

  static calculateOverallScore(scores, task) {
    // Different calculation methods based on task type
    switch (task) {
      case 'thesis':
        return scores.find(s => s.label === 'clear and specific')?.score || 0;
      case 'evidence':
        return scores.find(s => s.label === 'strong evidence')?.score || 0;
      case 'reasoning':
        return scores.find(s => s.label === 'logical connection')?.score || 0;
      case 'structure':
        return scores.find(s => s.label === 'well organized')?.score || 0;
      default:
        return 0;
    }
  }

  static generateFeedback(label, task) {
    const feedbackMap = {
      thesis: {
        'clear and specific': 'Your thesis is well-defined and focused.',
        'arguable': 'Your thesis presents a debatable claim.',
        'vague': 'Consider making your thesis more specific and focused.',
        'non-argumentative': 'Your thesis needs to present a clear argument rather than just a statement.'
      },
      evidence: {
        'strong evidence': 'Your evidence strongly supports your argument.',
        'relevant': 'Your evidence is relevant to your claims.',
        'weak evidence': 'Consider using stronger or more specific evidence.',
        'irrelevant': 'Make sure your evidence directly supports your claims.'
      },
      reasoning: {
        'logical connection': 'Your reasoning effectively connects evidence to claims.',
        'fallacious reasoning': 'Check your reasoning for logical fallacies.',
        'unclear connection': 'Make the connection between evidence and claims more explicit.'
      },
      structure: {
        'well organized': 'Your essay has a clear and effective structure.',
        'coherent': 'Your ideas flow logically from one to the next.',
        'disorganized': 'Consider reorganizing your paragraphs for better flow.',
        'unclear structure': 'Your essay needs a clearer organizational structure.'
      }
    };

    return feedbackMap[task]?.[label] || 'No specific feedback available.';
  }

  static async analyzeParagraph(paragraph) {
    const coherencePrompt = `
      Analyze this paragraph for coherence and logical flow:
      "${paragraph}"
      Evaluate: coherence, transitions, and logical progression of ideas.
    `;

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
        {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({
            inputs: coherencePrompt,
            parameters: {
              candidate_labels: [
                'highly coherent',
                'moderately coherent',
                'needs improvement'
              ]
            }
          })
        }
      );

      const result = await response.json();
      return this.processCoherenceResults(result);
    } catch (error) {
      console.error('Paragraph Analysis Error:', error);
      return null;
    }
  }

  static processCoherenceResults(result) {
    if (!result || !result.scores) return null;

    const coherenceLevel = result.labels[result.scores.indexOf(Math.max(...result.scores))];
    const score = Math.round(Math.max(...result.scores) * 100);

    const feedback = {
      'highly coherent': 'The paragraph demonstrates excellent coherence and logical flow.',
      'moderately coherent': 'The paragraph is generally coherent but could benefit from some improvement in transitions.',
      'needs improvement': 'Consider revising the paragraph to improve coherence and logical flow.'
    };

    return {
      coherenceLevel,
      score,
      feedback: feedback[coherenceLevel] || 'No specific feedback available.'
    };
  }

  static async generateWritingSuggestions(prompt) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.MODELS.MISTRAL}`,
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({
            inputs: `As an expert writing tutor, generate three distinct approaches for writing about this topic: "${prompt}"

                    For each approach:
                    1. Main thesis statement
                    2. Key supporting points
                    3. Potential evidence types
                    4. Unique perspective or angle

                    Make each approach creative and academically sound.`,
            parameters: {
              max_length: 500,
              temperature: 0.7,
              top_p: 0.9,
              repetition_penalty: 1.2
            }
          }),
        }
      );

      const result = await response.json();
      return {
        suggestions: result[0]?.generated_text?.split('\n').filter(s => s.trim()) || [],
        status: 'success'
      };
    } catch (error) {
      console.error('Writing Suggestions Generation Error:', error);
      return { status: 'error', message: 'Failed to generate writing suggestions' };
    }
  }

  static async improveWriting(text) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.MODELS.MISTRAL}`,
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({
            inputs: `As an expert academic writing coach, improve this text to make it more persuasive and scholarly:

                    Original text:
                    "${text}"

                    Please enhance:
                    1. Academic vocabulary and phrasing
                    2. Argument structure and flow
                    3. Transitional phrases
                    4. Persuasive techniques
                    5. Clarity and precision

                    Provide the improved version while maintaining the original argument.`,
            parameters: {
              max_length: 600,
              temperature: 0.6,
              top_p: 0.9,
              repetition_penalty: 1.2
            }
          }),
        }
      );

      const result = await response.json();
      return {
        improvedText: result[0]?.generated_text || '',
        status: 'success'
      };
    } catch (error) {
      console.error('Writing Improvement Error:', error);
      return { status: 'error', message: 'Failed to improve writing' };
    }
  }

  static async generateCounterarguments(argument) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.MODELS.MISTRAL}`,
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({
            inputs: `As a critical thinking expert, analyze this argument and generate strong counterarguments:

                    Original argument:
                    "${argument}"

                    For each counterargument provide:
                    1. Main opposing point
                    2. Supporting evidence
                    3. Logical reasoning
                    4. Potential weaknesses in the original argument

                    Generate three distinct, well-reasoned counterarguments.`,
            parameters: {
              max_length: 500,
              temperature: 0.7,
              top_p: 0.9,
              repetition_penalty: 1.2
            }
          }),
        }
      );

      const result = await response.json();
      return {
        counterarguments: result[0]?.generated_text?.split('\n').filter(s => s.trim()) || [],
        status: 'success'
      };
    } catch (error) {
      console.error('Counterargument Generation Error:', error);
      return { status: 'error', message: 'Failed to generate counterarguments' };
    }
  }

  static async getDetailedFeedback(essay) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.MODELS.MISTRAL}`,
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({
            inputs: `As an experienced writing professor, provide detailed feedback on this argumentative essay:

                    Essay:
                    "${essay}"

                    Analyze and provide specific feedback on:
                    1. Thesis strength and clarity
                    2. Quality and relevance of evidence
                    3. Logical reasoning and connections
                    4. Counter-argument handling
                    5. Overall structure and flow
                    6. Academic language usage
                    7. Specific recommendations for improvement

                    Provide constructive, actionable feedback with examples.`,
            parameters: {
              max_length: 800,
              temperature: 0.6,
              top_p: 0.9,
              repetition_penalty: 1.2
            }
          }),
        }
      );

      const result = await response.json();
      return {
        feedback: result[0]?.generated_text || '',
        status: 'success'
      };
    } catch (error) {
      console.error('Detailed Feedback Error:', error);
      return { status: 'error', message: 'Failed to generate detailed feedback' };
    }
  }

  static async generateArgumentStructure(topic) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.MODELS.MISTRAL}`,
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({
            inputs: `Generate a detailed argumentative essay structure for the topic: "${topic}"
                    Include:
                    1. Thesis statement
                    2. Main arguments (3)
                    3. Supporting evidence types for each argument
                    4. Potential counterarguments
                    5. Conclusion points`,
            parameters: {
              max_length: 500,
              temperature: 0.7,
              top_p: 0.9,
            }
          }),
        }
      );

      const result = await response.json();
      return {
        structure: result[0]?.generated_text || '',
        status: 'success'
      };
    } catch (error) {
      console.error('Essay Structure Generation Error:', error);
      return { status: 'error', message: 'Failed to generate essay structure' };
    }
  }

  static async analyzeArgumentLogic(argument) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.MODELS.CODE_LLAMA}`,
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({
            inputs: `Analyze the logical structure and validity of this argument:
                    "${argument}"
                    
                    Provide:
                    1. Logical structure breakdown
                    2. Validity assessment
                    3. Identification of logical fallacies (if any)
                    4. Suggestions for strengthening the argument`,
            parameters: {
              max_length: 400,
              temperature: 0.3, // Lower temperature for more focused analysis
              top_p: 0.9,
            }
          }),
        }
      );

      const result = await response.json();
      return {
        analysis: result[0]?.generated_text || '',
        status: 'success'
      };
    } catch (error) {
      console.error('Argument Logic Analysis Error:', error);
      return { status: 'error', message: 'Failed to analyze argument logic' };
    }
  }

  static async generateEvidenceExamples(topic, argumentType) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.MODELS.STARCODER}`,
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({
            inputs: `Generate specific evidence examples for an argument about: "${topic}"
                    Argument type: ${argumentType}
                    
                    Provide:
                    1. Statistical evidence
                    2. Expert opinions
                    3. Real-world examples
                    4. Research findings
                    
                    Make the examples specific and detailed.`,
            parameters: {
              max_length: 400,
              temperature: 0.7,
              top_p: 0.9,
            }
          }),
        }
      );

      const result = await response.json();
      return {
        examples: result[0]?.generated_text?.split('\n').filter(s => s.trim()) || [],
        status: 'success'
      };
    } catch (error) {
      console.error('Evidence Generation Error:', error);
      return { status: 'error', message: 'Failed to generate evidence examples' };
    }
  }

  static async improveArgumentStyle(text) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.MODELS.MISTRAL}`,
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({
            inputs: `Improve the following argument by enhancing:
                    1. Academic language
                    2. Persuasive techniques
                    3. Transitional phrases
                    4. Overall flow
                    
                    Original text:
                    "${text}"`,
            parameters: {
              max_length: 400,
              temperature: 0.6,
              top_p: 0.9,
            }
          }),
        }
      );

      const result = await response.json();
      return {
        improvedText: result[0]?.generated_text || '',
        status: 'success'
      };
    } catch (error) {
      console.error('Style Improvement Error:', error);
      return { status: 'error', message: 'Failed to improve argument style' };
    }
  }

  static async analyzeCognitiveSkills(essay, previousSkillLevels = null) {
    try {
      const skillAnalysis = {};
      
      // Analyze each skill component
      for (const [skillKey, skillData] of Object.entries(this.WRITING_SKILLS)) {
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${this.MODELS.MISTRAL}`,
          {
            headers: this.getHeaders(),
            method: 'POST',
            body: JSON.stringify({
              inputs: `As an expert in cognitive diagnostic assessment, analyze this essay specifically for ${skillData.name}:

                      Essay:
                      "${essay}"

                      For each aspect of ${skillData.name}, provide:
                      1. Skill level (0-100)
                      2. Specific examples from the text
                      3. Areas of strength
                      4. Areas for improvement
                      5. Personalized learning recommendations

                      Aspects to analyze: ${skillData.aspects.join(', ')}
                      
                      Previous skill level: ${previousSkillLevels?.[skillKey] || 'Not available'}`,
              parameters: {
                max_length: 500,
                temperature: 0.3,
                top_p: 0.9,
                repetition_penalty: 1.2
              }
            }),
          }
        );

        const result = await response.json();
        skillAnalysis[skillKey] = this.processSkillAnalysis(result[0]?.generated_text || '', skillData);
      }

      return this.generatePersonalizedFeedback(skillAnalysis, previousSkillLevels);
    } catch (error) {
      console.error('Cognitive Skills Analysis Error:', error);
      return { status: 'error', message: 'Failed to analyze cognitive skills' };
    }
  }

  static processSkillAnalysis(analysisText, skillData) {
    // Extract numerical scores and feedback from the analysis text
    const aspects = {};
    let overallScore = 0;

    skillData.aspects.forEach(aspect => {
      // Use regex to find scores and feedback for each aspect
      const scoreMatch = analysisText.match(new RegExp(`${aspect}.*?(\\d+)`, 'i'));
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
      
      aspects[aspect] = {
        score,
        feedback: this.extractFeedback(analysisText, aspect)
      };
      
      overallScore += score;
    });

    return {
      overallScore: Math.round(overallScore / skillData.aspects.length),
      aspects,
      recommendations: this.extractRecommendations(analysisText)
    };
  }

  static extractFeedback(text, aspect) {
    // Extract specific feedback for the aspect from the analysis text
    const feedbackRegex = new RegExp(`${aspect}[^.]*\\.([^\\n]+)`, 'i');
    const match = text.match(feedbackRegex);
    return match ? match[1].trim() : 'No specific feedback available.';
  }

  static extractRecommendations(text) {
    // Extract learning recommendations from the analysis text
    const recommendationsMatch = text.match(/recommendations?:([^\\n]+)/i);
    return recommendationsMatch 
      ? recommendationsMatch[1].trim().split(';').map(r => r.trim())
      : ['Practice more with similar exercises.'];
  }

  static async generatePersonalizedFeedback(skillAnalysis, previousSkillLevels) {
    try {
      // Calculate skill changes and generate targeted feedback
      const skillChanges = {};
      const criticalAreas = [];
      const improvements = [];

      for (const [skillKey, analysis] of Object.entries(skillAnalysis)) {
        const previousLevel = previousSkillLevels?.[skillKey]?.overallScore || 0;
        const change = analysis.overallScore - previousLevel;
        skillChanges[skillKey] = change;

        if (analysis.overallScore < 60) {
          criticalAreas.push(skillKey);
        }
        if (change > 10) {
          improvements.push(skillKey);
        }
      }

      // Generate personalized feedback using Mistral
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.MODELS.MISTRAL}`,
        {
          headers: this.getHeaders(),
          method: 'POST',
          body: JSON.stringify({
            inputs: `As a writing coach, generate personalized feedback based on this skill analysis:

                    Skill Analysis: ${JSON.stringify(skillAnalysis, null, 2)}
                    Critical Areas: ${criticalAreas.join(', ')}
                    Improvements: ${improvements.join(', ')}

                    Provide:
                    1. Overall assessment
                    2. Specific strengths
                    3. Priority areas for improvement
                    4. Personalized learning path
                    5. Specific exercises and resources
                    
                    Make the feedback encouraging and actionable.`,
            parameters: {
              max_length: 800,
              temperature: 0.6,
              top_p: 0.9,
              repetition_penalty: 1.2
            }
          }),
        }
      );

      const result = await response.json();
      
      return {
        status: 'success',
        skillAnalysis,
        skillChanges,
        criticalAreas,
        improvements,
        personalizedFeedback: result[0]?.generated_text || '',
        recommendedNextSteps: this.generateNextSteps(skillAnalysis, criticalAreas)
      };
    } catch (error) {
      console.error('Personalized Feedback Generation Error:', error);
      return { status: 'error', message: 'Failed to generate personalized feedback' };
    }
  }

  static generateNextSteps(skillAnalysis, criticalAreas) {
    // Generate specific next steps based on skill analysis
    const nextSteps = [];
    
    criticalAreas.forEach(area => {
      const skill = this.WRITING_SKILLS[area];
      const analysis = skillAnalysis[area];
      
      // Add targeted exercises based on skill level
      if (analysis.overallScore < 40) {
        nextSteps.push({
          skill: skill.name,
          type: 'fundamental_practice',
          description: `Practice basic ${skill.name.toLowerCase()} exercises`,
          priority: 'high'
        });
      } else if (analysis.overallScore < 70) {
        nextSteps.push({
          skill: skill.name,
          type: 'intermediate_practice',
          description: `Strengthen ${skill.name.toLowerCase()} through targeted exercises`,
          priority: 'medium'
        });
      } else {
        nextSteps.push({
          skill: skill.name,
          type: 'advanced_practice',
          description: `Refine advanced aspects of ${skill.name.toLowerCase()}`,
          priority: 'low'
        });
      }
    });

    return nextSteps;
  }
}

module.exports = AIService; 