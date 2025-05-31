// Local Generative AI using Transformers.js
import Head from 'next/head';
import { useState } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import ProfileModule from '../src/components/ProfileModule';

// Remove unused transformers.js configuration
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Home() {
  const [skillLevels, setSkillLevels] = useState({
    thesisFormulation: 0,
    evidenceIntegration: 0,
    logicalFlow: 0,
    conclusionStrength: 0,
    languageUsage: 0
  });
  
  const [exercises, setExercises] = useState([]);
  const [showExercises, setShowExercises] = useState(false);
  const [essayText, setEssayText] = useState('');
  const [exerciseResponses, setExerciseResponses] = useState({});
  const [exerciseFeedback, setExerciseFeedback] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileData, setProfileData] = useState({
    studentId: 'STU001',
    name: 'John Doe',
    essays: [
      {
        id: 'essay_1',
        topic: 'Parents vs School Teaching Children',
        bandScore: 8.0,
        date: '2024-03-15',
        components: {
          claim: 'Family upbringing plays a more important role in educating children',
          data: [
            'Schools have standardized educational methods',
            'Average class size in Vietnam is 20 students'
          ],
          warrant: 'One-to-one lessons at home allow children to progress faster',
          backing: 'Example of bedtime stories instilling compassion',
          rebuttal: 'Schools can foster cognitive development',
          qualifier: 'School success stories represent only a small fraction'
        }
      },
      {
        id: 'essay_2',
        topic: 'Technology in Education',
        bandScore: 7.5,
        date: '2024-03-10',
        components: {
          claim: 'Technology enhances learning outcomes when properly integrated',
          data: [
            'Interactive learning platforms increase engagement',
            'Digital tools provide immediate feedback'
          ],
          warrant: 'Technology enables personalized learning experiences',
          backing: 'Studies show 30% improvement in retention rates',
          rebuttal: 'Over-reliance on technology may reduce critical thinking',
          qualifier: 'Technology should complement, not replace, traditional methods'
        }
      }
    ],
    statistics: {
      averageScore: 7.75,
      totalEssays: 2,
      improvementRate: 15,
      strongestComponent: 'Evidence Integration',
      weakestComponent: 'Conclusion Strength'
    }
  });

  const radarData = {
    labels: [
      'Thesis Formulation',
      'Evidence Integration',
      'Logical Flow',
      'Conclusion Strength',
      'Language Usage'
    ],
    datasets: [
      {
        label: 'Your Skills',
        data: Object.values(skillLevels),
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgba(147, 51, 234, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(147, 51, 234, 1)',
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        pointLabels: {
          font: {
            size: 12
          }
        },
        ticks: {
          backdropColor: 'transparent',
          color: 'rgb(107, 114, 128)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 14
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const analyzeEssay = async () => {
    if (!essayText.trim()) return;

    try {
      const response = await fetch('/api/rag/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: essayText.trim(),
          component_type: 'all'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze essay');
      }

      const analysis = await response.json();
      
      // Update skill levels based on RAG analysis
      setSkillLevels({
        thesisFormulation: analysis.results[0]?.components?.claim ? 80 : 40,
        evidenceIntegration: analysis.results[0]?.components?.data?.length > 0 ? 85 : 45,
        logicalFlow: analysis.results[0]?.components?.warrant ? 75 : 35,
        conclusionStrength: analysis.results[0]?.components?.backing ? 70 : 30,
        languageUsage: analysis.results[0]?.components?.qualifier ? 65 : 25
      });

      // Generate exercises based on the analysis
      generateExercises({
        thesisFormulation: analysis.results[0]?.components?.claim ? 80 : 40,
        evidenceIntegration: analysis.results[0]?.components?.data?.length > 0 ? 85 : 45,
        logicalFlow: analysis.results[0]?.components?.warrant ? 75 : 35,
        conclusionStrength: analysis.results[0]?.components?.backing ? 70 : 30,
        languageUsage: analysis.results[0]?.components?.qualifier ? 65 : 25
      });

    } catch (error) {
      console.error('Error analyzing essay:', error);
      // Fallback to random scores if analysis fails
      const fallbackAnalysis = await neuralCDMAnalysis(essayText);
      setSkillLevels(fallbackAnalysis.skillLevels);
      generateExercises(fallbackAnalysis.skillLevels);
    }
  };

  const neuralCDMAnalysis = async (text) => {
    // Fallback analysis with random scores
    return {
      skillLevels: {
        thesisFormulation: Math.floor(Math.random() * 100),
        evidenceIntegration: Math.floor(Math.random() * 100),
        logicalFlow: Math.floor(Math.random() * 100),
        conclusionStrength: Math.floor(Math.random() * 100),
        languageUsage: Math.floor(Math.random() * 100)
      }
    };
  };

  const generateExercises = (skills) => {
    const weakestSkills = Object.entries(skills)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .map(([skill]) => skill);

    const exerciseTemplates = {
      thesisFormulation: {
        type: 'Thesis Statement Practice',
        instruction: 'Write a clear and focused thesis statement for the following topic:',
        topic: 'The impact of social media on modern society'
      },
      evidenceIntegration: {
        type: 'Evidence Integration Exercise',
        instruction: 'Integrate the following evidence into a coherent paragraph:',
        evidence: 'According to a recent study, 78% of students reported improved learning outcomes with hybrid education models.'
      },
      logicalFlow: {
        type: 'Logical Flow Practice',
        instruction: 'Arrange the following arguments in a logical sequence:',
        arguments: ['First point', 'Supporting evidence', 'Counter-argument', 'Rebuttal']
      },
      conclusionStrength: {
        type: 'Conclusion Writing Practice',
        instruction: 'Write a strong conclusion that synthesizes the following main points:',
        points: ['Impact on economy', 'Social implications', 'Future prospects']
      },
      languageUsage: {
        type: 'Language Enhancement Exercise',
        instruction: 'Improve the following sentence using more precise language:',
        sentence: 'The thing was very good and made people happy.'
      }
    };

    const generatedExercises = weakestSkills.map(skill => exerciseTemplates[skill]);
    setExercises(generatedExercises);
  };

  const handleExerciseSubmit = async (exerciseIndex, response) => {
    setIsSubmitting(true);
    try {
      // Store the response
      setExerciseResponses(prev => ({
        ...prev,
        [exerciseIndex]: response
      }));

      // Generate feedback based on the exercise type
      const exercise = exercises[exerciseIndex];
      let feedback = '';

      switch (exercise.type) {
        case 'Thesis Statement Practice':
          feedback = response.includes(exercise.topic) 
            ? 'Good job! Your thesis statement directly addresses the topic.'
            : 'Try to make your thesis statement more focused on the given topic.';
          break;
        case 'Evidence Integration Exercise':
          feedback = response.includes(exercise.evidence)
            ? 'Excellent! You successfully integrated the evidence into your paragraph.'
            : 'Make sure to incorporate the provided evidence into your response.';
          break;
        case 'Logical Flow Practice':
          feedback = 'Your logical sequence looks good! Remember to maintain clear transitions between points.';
          break;
        case 'Conclusion Writing Practice':
          feedback = exercise.points.every(point => response.toLowerCase().includes(point.toLowerCase()))
            ? 'Great conclusion! You covered all the main points.'
            : 'Try to include all the main points in your conclusion.';
          break;
        case 'Language Enhancement Exercise':
          feedback = response.length > exercise.sentence.length
            ? 'Good improvement! You expanded the sentence with more precise language.'
            : 'Try to use more specific and descriptive language.';
          break;
        default:
          feedback = 'Thank you for your response!';
      }

      // Store the feedback
      setExerciseFeedback(prev => ({
        ...prev,
        [exerciseIndex]: feedback
      }));

    } catch (error) {
      console.error('Error submitting exercise:', error);
      setExerciseFeedback(prev => ({
        ...prev,
        [exerciseIndex]: 'Sorry, there was an error processing your response. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 relative overflow-hidden">
      {/* Top Purple Bar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        {/* Gradient Bar */}
        <div className="h-24 bg-gradient-to-r from-purple-500 via-indigo-500 to-fuchsia-500 opacity-90"></div>
        
        {/* Inverted Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0 transform rotate-180">
          <svg className="w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" 
              fill="url(#gradient-top)"
              className="opacity-90"
            ></path>
            <defs>
              <linearGradient id="gradient-top" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ArgMind Character */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-50">
          <div className="relative w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden hover:scale-110 transition-transform duration-300">
            <span className="text-3xl animate-float-advanced">🤖</span>
          </div>
        </div>
      </div>

      {/* ArgMind Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 rounded-full blur-xl opacity-50"></div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center nav-logo relative">
            <span className="mr-3 floating-illustration">✍️</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">ArgMind</span>
            <span className="ml-3 floating-illustration">🎯</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 container mx-auto px-4 max-w-7xl pb-24">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Profile Module */}
          <div className="relative">
            {/* Decorative Line Above */}
            <div className="absolute -top-6 left-0 right-0 flex items-center">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-full"></div>
              <div className="absolute left-1/2 -translate-x-1/2 bg-white px-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                <span className="text-purple-600 font-medium">Profile</span>
                <div className="w-2 h-2 rounded-full bg-purple-400 ml-2"></div>
              </div>
            </div>

            <ProfileModule {...profileData} />
          </div>

          {/* Essay Input */}
          <div className="relative">
            {/* Decorative Line Above */}
            <div className="absolute -top-6 left-0 right-0 flex items-center">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-full"></div>
              <div className="absolute left-1/2 -translate-x-1/2 bg-white px-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                <span className="text-purple-600 font-medium">Write</span>
                <div className="w-2 h-2 rounded-full bg-purple-400 ml-2"></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-all duration-300 border border-purple-100 relative overflow-hidden glow-effect">
              <textarea
                className="w-full h-[500px] p-6 border-2 border-purple-100 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ease-in-out resize-none font-sans text-gray-700 shadow-inner"
                placeholder="Paste your argumentative essay here..."
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
              />
              <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                {essayText.length} characters
              </div>
              <button
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group shine-effect"
                onClick={analyzeEssay}
              >
                <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-2">✨</span>
                  Analyze Essay
                  <span className="ml-2">📊</span>
                </div>
              </button>
            </div>
          </div>

          {/* Analysis Dashboard */}
          <div className="relative">
            {/* Decorative Line Above */}
            <div className="absolute -top-6 left-0 right-0 flex items-center">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-full"></div>
              <div className="absolute left-1/2 -translate-x-1/2 bg-white px-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                <span className="text-purple-600 font-medium">Analysis</span>
                <div className="w-2 h-2 rounded-full bg-purple-400 ml-2"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Skill Analysis Card */}
              <div className="relative">
                {/* Card Title Line */}
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <div className="bg-white px-4 text-sm text-purple-500 font-medium">Skills Overview</div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-all duration-300 border border-purple-100 relative overflow-hidden glow-effect">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                      Skill Analysis
                    </h2>
                    <div className="flex space-x-2">
                      {Object.entries(skillLevels).map(([skill, level]) => (
                        level > 0 && (
                          <div key={skill} 
                               className="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-3 py-1 rounded-full font-semibold shadow-sm transform hover:scale-110 transition-all duration-300 shine-effect">
                              {Math.round(level)}%
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                  <div className="relative h-[350px] w-full bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 flex items-center justify-center transform hover:scale-[1.02] transition-all duration-300">
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                </div>
              </div>

              {/* Exercise Card */}
              <div className="relative">
                {/* Card Title Line */}
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <div className="bg-white px-4 text-sm text-purple-500 font-medium">Practice Exercises</div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-all duration-300 border border-purple-100 relative overflow-hidden glow-effect">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                      Practice Exercises
                    </h2>
                    <button
                      className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group shine-effect"
                      onClick={() => setShowExercises(!showExercises)}
                    >
                      <div className="flex items-center group-hover:scale-105 transition-transform duration-300">
                        {showExercises ? '✖ Hide Exercises' : '✨ Show Exercises'}
                      </div>
                    </button>
                  </div>

                  {showExercises && (
                    <div className="space-y-4">
                      {exercises.map((exercise, index) => (
                        <div key={index} 
                             className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100 transform hover:scale-[1.02] glow-effect"
                             style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex items-center mb-4">
                            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full mr-3 pulse-ring-effect"></div>
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                              {exercise.type}
                            </h3>
                          </div>
                          <div className="space-y-4">
                            <p className="text-gray-700 font-medium">{exercise.instruction}</p>
                            {exercise.topic && (
                              <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
                                <p className="text-purple-800 font-medium">Topic: {exercise.topic}</p>
                              </div>
                            )}
                            {exercise.evidence && (
                              <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
                                <p className="text-purple-800 font-medium">Evidence: {exercise.evidence}</p>
                              </div>
                            )}
                            {exercise.arguments && (
                              <ul className="list-none space-y-2">
                                {exercise.arguments.map((arg, i) => (
                                  <li key={i} className="flex items-center text-gray-700 bg-white/50 p-3 rounded-lg">
                                    <span className="text-purple-500 mr-2">•</span>
                                    {arg}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {exercise.points && (
                              <ul className="list-none space-y-2">
                                {exercise.points.map((point, i) => (
                                  <li key={i} className="flex items-center text-gray-700 bg-white/50 p-3 rounded-lg">
                                    <span className="text-purple-500 mr-2">•</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {exercise.sentence && (
                              <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
                                <p className="text-purple-800 font-medium">Sentence: {exercise.sentence}</p>
                              </div>
                            )}
                            <div className="mt-6 space-y-4">
                              <textarea
                                className="w-full h-32 p-4 border-2 border-purple-100 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ease-in-out resize-none bg-white/75"
                                placeholder="Write your response here..."
                                value={exerciseResponses[index] || ''}
                                onChange={(e) => setExerciseResponses(prev => ({
                                  ...prev,
                                  [index]: e.target.value
                                }))}
                              />
                              <button 
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleExerciseSubmit(index, exerciseResponses[index])}
                                disabled={isSubmitting || !exerciseResponses[index]}
                              >
                                <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                  <span className="mr-2">{isSubmitting ? '⏳' : '📝'}</span>
                                  {isSubmitting ? 'Submitting...' : 'Submit Response'}
                                </div>
                              </button>
                              {exerciseFeedback[index] && (
                                <div className="mt-4 p-4 bg-white/70 rounded-lg border border-purple-100">
                                  <h4 className="text-purple-800 font-medium mb-2">Feedback:</h4>
                                  <p className="text-gray-700">{exerciseFeedback[index]}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Side Lines */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-purple-200 to-transparent"></div>
          <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-purple-200 to-transparent"></div>
        </div>
      </div>

      {/* Bottom Purple Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Gradient Bar */}
        <div className="h-24 bg-gradient-to-r from-purple-500 via-indigo-500 to-fuchsia-500 opacity-90"></div>
        
        {/* Decorative Wave */}
        <div className="absolute -top-12 left-0 right-0">
          <svg className="w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" 
              fill="url(#gradient)"
              className="opacity-90"
            ></path>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-16 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl floating-illustration"></div>
        <div className="absolute top-1/2 -right-16 w-32 h-32 bg-indigo-200/30 rounded-full blur-2xl floating-illustration" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 -left-16 w-32 h-32 bg-fuchsia-200/30 rounded-full blur-2xl floating-illustration" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}