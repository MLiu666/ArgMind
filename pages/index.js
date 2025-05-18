// Local Generative AI using Transformers.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js
env.allowLocalModels = true;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;

// Progress callback
const progressCallback = (progress) => {
  console.log(progress);
};

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState('');

  useEffect(() => {
    async function loadModel() {
      try {
        setLoadingProgress('Initializing model...');
        // Use a much smaller model that's definitely browser-friendly
        const generator = await pipeline(
          'text-generation',
          'Xenova/distilgpt2',
          {
            progress_callback: (progress) => {
              if (progress.status === 'downloading') {
                setLoadingProgress(`Downloading model... ${Math.round(progress.progress * 100)}%`);
              } else if (progress.status === 'loading') {
                setLoadingProgress('Loading model into memory...');
              }
            },
            quantized: true,
          }
        );
        setModel(generator);
        setModelLoading(false);
        setLoadingProgress('');
      } catch (err) {
        console.error('Error loading model:', err);
        setError(`Failed to load the AI model: ${err.message}`);
        setModelLoading(false);
      }
    }
    loadModel();
  }, []);

  const analyzeFeedback = async () => {
    if (!text.trim() || !model) return;
    
    setLoading(true);
    setError(null);
    try {
      const prompt = `Below is an argumentative text that needs analysis. Provide detailed feedback on its structure, logic, and persuasiveness.

Text to analyze:
${text.trim()}

Provide feedback in the following format:

1. Thesis Development:
- Clarity of main argument
- Strength of position

2. Evidence Usage:
- Quality of supporting evidence
- Integration of examples

3. Logical Flow:
- Organization of ideas
- Transitions between paragraphs

4. Language & Style:
- Clarity of expression
- Academic tone
- Grammar and mechanics

5. Overall Persuasiveness:
- Effectiveness of argumentation
- Impact on reader`;

      const result = await model(prompt, {
        max_new_tokens: 1000,
        temperature: 0.7,
        repetition_penalty: 1.1,
        do_sample: true
      });

      setFeedback(result[0].generated_text);
    } catch (error) {
      console.error('Error analyzing text:', error);
      setError(error.message || 'Error analyzing text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>ArgMind - Writing Feedback</title>
        <meta name="description" content="AI-powered writing feedback system using local generative AI" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.0"></script>
      </Head>

      <nav className="navbar navbar-dark">
        <div className="container">
          <span className="navbar-brand">ArgMind</span>
        </div>
      </nav>

      <main className="main-container">
        <div className="feedback-section">
          <h2 className="mb-4">Writing Analysis</h2>
          {modelLoading ? (
            <div className="alert alert-info">
              <div className="loading-status">
                {loadingProgress || 'Loading AI model... This may take a few moments.'}
              </div>
              <div className="progress mt-2">
                <div className="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" 
                     style={{width: '100%'}}></div>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group mb-4">
                <label htmlFor="textInput" className="mb-2">Enter your argumentative text:</label>
                <textarea
                  id="textInput"
                  className="form-control feedback-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your argumentative text here..."
                  disabled={loading}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={analyzeFeedback}
                disabled={loading || !text.trim() || modelLoading}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </>
          )}

          {loading && (
            <div className="loading-spinner mt-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-4">
              <strong>Error: </strong> {error}
              <button 
                className="btn btn-outline-danger btn-sm ms-3"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}

          {feedback && (
            <div className="mt-4">
              <h3>Feedback</h3>
              <div className="recommendation-card">
                <div className="feedback-content">
                  {feedback.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .navbar {
          background-color: #2c3e50;
          padding: 1rem;
        }

        .navbar-brand {
          color: white !important;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .main-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .feedback-section {
          background: white;
          border-radius: 10px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .feedback-textarea {
          min-height: 200px;
          resize: vertical;
        }

        .recommendation-card {
          background: #f8f9fa;
          border-left: 4px solid #3498db;
          padding: 1rem;
          margin: 1rem 0;
        }

        .feedback-content {
          white-space: pre-wrap;
          font-size: 1rem;
          line-height: 1.6;
        }

        .alert {
          border-radius: 8px;
          padding: 1rem;
        }

        .alert-danger {
          background-color: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
        }

        .alert-info {
          background-color: #cce5ff;
          border-color: #b8daff;
          color: #004085;
        }
      `}</style>
    </div>
  );
}