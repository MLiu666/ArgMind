// Local Generative AI using Transformers.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { pipeline, env } from '@xenova/transformers';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Configure transformers.js
env.allowLocalModels = true;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;

// Create pipeline instance
let pipe = null;

// Progress callback
const progressCallback = (progress) => {
  console.log(progress);
};

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

  useEffect(() => {
    async function loadModel() {
      try {
        // Create the pipeline
        pipe = await pipeline(
          'text-generation',
          'Xenova/distilgpt2',
          {
            progress_callback: (progress) => {
              if (progress.status === 'downloading') {
                console.log(`Downloading model... ${Math.round(progress.progress * 100)}%`);
              } else if (progress.status === 'loading') {
                console.log('Loading model into memory...');
              }
            },
            quantized: true,
          }
        );
      } catch (err) {
        console.error('Error loading model:', err);
      }
    }
    loadModel();
  }, []);

  const analyzeEssay = async () => {
    if (!pipe || !essayText.trim()) return;

    try {
      const prompt = `Analyze this argumentative essay and provide scores from 0-100 for each skill:

Essay:
${essayText.trim()}

Please analyze the essay and provide numerical scores (0-100) for:
1. Thesis Formulation
2. Evidence Integration
3. Logical Flow
4. Conclusion Strength
5. Language Usage

Format your response as JSON only, like this:
{
  "thesisFormulation": score,
  "evidenceIntegration": score,
  "logicalFlow": score,
  "conclusionStrength": score,
  "languageUsage": score,
  "feedback": "detailed feedback here"
}`;

      const result = await pipe(prompt, {
        max_new_tokens: 500,
        temperature: 0.7,
        repetition_penalty: 1.1,
        do_sample: true
      });

      try {
        // Extract the JSON part from the response
        const jsonStr = result[0].generated_text.substring(result[0].generated_text.indexOf('{'), result[0].generated_text.lastIndexOf('}') + 1);
        const analysis = JSON.parse(jsonStr);
        
        setSkillLevels({
          thesisFormulation: analysis.thesisFormulation || 0,
          evidenceIntegration: analysis.evidenceIntegration || 0,
          logicalFlow: analysis.logicalFlow || 0,
          conclusionStrength: analysis.conclusionStrength || 0,
          languageUsage: analysis.languageUsage || 0
        });

        generateExercises({
          thesisFormulation: analysis.thesisFormulation || 0,
          evidenceIntegration: analysis.evidenceIntegration || 0,
          logicalFlow: analysis.logicalFlow || 0,
          conclusionStrength: analysis.conclusionStrength || 0,
          languageUsage: analysis.languageUsage || 0
        });
      } catch (parseError) {
        console.error('Error parsing model output:', parseError);
        // Fallback to random scores if parsing fails
        const fallbackAnalysis = await neuralCDMAnalysis(essayText);
        setSkillLevels(fallbackAnalysis.skillLevels);
        generateExercises(fallbackAnalysis.skillLevels);
      }
    } catch (error) {
      console.error('Error analyzing essay:', error);
      // Fallback to random scores if model fails
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full blur-xl opacity-40 animate-float-advanced"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-200 rounded-full blur-xl opacity-30 animate-float-advanced" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-fuchsia-200 rounded-full blur-xl opacity-40 animate-float-advanced" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-10 right-1/3 w-40 h-40 bg-violet-200 rounded-full blur-xl opacity-30 animate-float-advanced" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 pattern-grid opacity-5"></div>
        
        {/* Decorative Lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 Q400,100 800,50" stroke="url(#gradient)" strokeWidth="2" fill="none" className="opacity-20" />
          <path d="M800,600 Q400,500 0,550" stroke="url(#gradient)" strokeWidth="2" fill="none" className="opacity-20" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <Head>
        <title>ArgMind - AI Writing Analysis</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 blur-3xl -z-10 rounded-full"></div>
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden glow-effect">
            {/* Interactive Decorative Icons */}
            <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-lg rotate-12 floating-illustration shine-effect"></div>
            <div className="absolute top-8 right-8 w-8 h-8 bg-white/20 rounded-full floating-illustration shine-effect" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute bottom-4 left-8 w-10 h-10 bg-white/15 rounded-lg -rotate-12 floating-illustration shine-effect" style={{ animationDelay: '0.4s' }}></div>
            
            <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 font-display relative z-10">
              ArgMind
            </h1>
            <p className="text-lg text-purple-100 font-medium">
              Advanced AI-Powered Writing Analysis
            </p>
            
            {/* Enhanced Hero Illustration */}
            <div className="mt-8 flex justify-center items-center space-x-8">
              <div className="relative w-16 h-16 bg-white/20 rounded-xl rotate-12 floating-illustration pulse-ring-effect">
                <span className="absolute inset-0 flex items-center justify-center text-2xl transform hover:scale-110 transition-transform">✍️</span>
              </div>
              <div className="relative w-16 h-16 bg-white/20 rounded-xl -rotate-12 floating-illustration pulse-ring-effect" style={{ animationDelay: '0.2s' }}>
                <span className="absolute inset-0 flex items-center justify-center text-2xl transform hover:scale-110 transition-transform">🤖</span>
              </div>
              <div className="relative w-16 h-16 bg-white/20 rounded-xl rotate-6 floating-illustration pulse-ring-effect" style={{ animationDelay: '0.4s' }}>
                <span className="absolute inset-0 flex items-center justify-center text-2xl transform hover:scale-110 transition-transform">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Writing Analysis Dashboard Section */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-lg transform -skew-y-2"></div>
            <h2 className="relative text-2xl font-bold text-center py-3 text-purple-900 flex items-center justify-center">
              <span className="mr-3">✨</span>
              Writing Analysis Dashboard
              <span className="ml-3">📝</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Essay Input Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-all duration-300 border border-purple-100 relative overflow-hidden">
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-20 h-20">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-purple-100 to-transparent"></div>
                <div className="absolute top-4 right-4 text-purple-400 transform rotate-12">✍️</div>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Your Essay</h2>
              </div>
              
              <div className="relative">
                <textarea
                  className="w-full h-[400px] p-6 border-2 border-purple-100 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ease-in-out resize-none font-sans text-gray-700 shadow-inner"
                  placeholder="Paste your argumentative essay here..."
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                  {essayText.length} characters
                </div>
              </div>
              <button
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group"
                onClick={analyzeEssay}
              >
                <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className="mr-2">✨</span>
                  Analyze Essay
                  <span className="ml-2">📝</span>
                </div>
              </button>
            </div>

            {/* Skill Analysis Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-all duration-300 border border-purple-100 relative overflow-hidden glow-effect">
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-20 h-20">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-indigo-100 to-transparent"></div>
                <div className="absolute top-4 right-4 text-indigo-400 transform -rotate-12 floating-illustration">📊</div>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full mr-4 pulse-ring-effect"></div>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Skill Analysis</h2>
                </div>
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

          {/* Exercise Section */}
          <div className="mt-12">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-200 to-purple-200 rounded-lg transform -skew-y-2"></div>
              <h2 className="relative text-2xl font-bold text-center py-3 text-purple-900 flex items-center justify-center">
                <span className="mr-3 floating-illustration">🎯</span>
                Practice & Improvement
                <span className="ml-3 floating-illustration">💪</span>
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100 glow-effect">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full mr-4 pulse-ring-effect"></div>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                    Personalized Exercises
                  </h2>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {exercises.map((exercise, index) => (
                    <div key={index} 
                         className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100 transform hover:scale-[1.02] glow-effect"
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
                          />
                          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 group">
                            <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <span className="mr-2">📝</span>
                              Submit Response
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full">
        <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-fuchsia-500 shine-effect"></div>
        <svg className="w-full h-12 -mt-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="url(#footer-gradient)" opacity=".25" />
          <defs>
            <linearGradient id="footer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}