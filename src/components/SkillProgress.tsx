import React, { useEffect, useState } from 'react';
import { Progress } from 'antd';

interface SkillMastery {
  [key: string]: number;
}

interface SkillProgressProps {
  userId: number;
}

const SkillProgress: React.FC<SkillProgressProps> = ({ userId }) => {
  const [mastery, setMastery] = useState<SkillMastery>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMastery = async () => {
      try {
        const response = await fetch(`/api/get_mastery/${userId}`);
        const data = await response.json();
        setMastery(data.skills as SkillMastery);
      } catch (error) {
        console.error('Error fetching mastery scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMastery();
  }, [userId]);

  const getProgressColor = (score: number) => {
    if (score >= 0.8) return '#52c41a';  // Green
    if (score >= 0.5) return '#faad14';  // Yellow
    return '#f5222d';  // Red
  };

  const getRecommendation = (skill: string, score: number) => {
    if (score < 0.5) {
      return `Focus on improving your ${skill.toLowerCase()} skills`;
    }
    return null;
  };

  if (loading) {
    return <div>Loading skill progress...</div>;
  }

  return (
    <div className="skill-progress-container">
      <h2>Your Toulmin Model Skills Progress</h2>
      <div className="skills-grid">
        {Object.entries(mastery).map(([skill, score]) => (
          <div key={skill} className="skill-item">
            <h3>{skill}</h3>
            <Progress
              percent={Math.round(score * 100)}
              strokeColor={getProgressColor(score)}
              format={(percent) => `${percent}%`}
            />
            {getRecommendation(skill, score) && (
              <p className="recommendation">{getRecommendation(skill, score)}</p>
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        .skill-progress-container {
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .skill-item {
          padding: 15px;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
        }
        .skill-item h3 {
          margin-bottom: 10px;
          color: #333;
        }
        .recommendation {
          margin-top: 10px;
          color: #f5222d;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
};

export default SkillProgress; 