// Google Gemini-powered writing analysis
import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const analyzeFeedback = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP error! status: ${response.status}`);
      }

      setFeedback(data.feedback);
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
        <meta name="description" content="AI-powered writing feedback system using Google's Gemini" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      </Head>

      <nav className="navbar navbar-dark">
        <div className="container">
          <span className="navbar-brand">ArgMind</span>
        </div>
      </nav>

      <main className="main-container">
        <div className="feedback-section">
          <h2 className="mb-4">Writing Analysis</h2>
          <div className="form-group mb-4">
            <label htmlFor="textInput" className="mb-2">Enter your argumentative text:</label>
            <textarea
              id="textInput"
              className="form-control feedback-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your argumentative text here..."
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={analyzeFeedback}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>

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
      `}</style>
    </div>
  );
}