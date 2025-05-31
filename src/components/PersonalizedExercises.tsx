import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Button, Space, Tag, Progress, Alert, Steps } from 'antd';
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface Exercise {
  id: string;
  type: 'claim' | 'data' | 'warrant' | 'backing' | 'rebuttal' | 'qualifier';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  sampleAnswer: string;
  points: number;
  completed: boolean;
  feedback?: string;
}

interface PersonalizedExercisesProps {
  studentId: string;
  componentScores: {
    claim: number;
    data: number;
    warrant: number;
    backing: number;
    rebuttal: number;
    qualifier: number;
  };
  recommendations: Array<{
    component: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const PersonalizedExercises: React.FC<PersonalizedExercisesProps> = ({
  studentId,
  componentScores,
  recommendations,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Generate personalized exercises based on component scores and recommendations
    const generateExercises = () => {
      const newExercises: Exercise[] = [];
      
      // Sort recommendations by priority
      const sortedRecommendations = [...recommendations].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Generate exercises for each recommended component
      sortedRecommendations.forEach(rec => {
        const score = componentScores[rec.component as keyof typeof componentScores];
        const difficulty = score < 6 ? 'beginner' : score < 7.5 ? 'intermediate' : 'advanced';
        
        newExercises.push({
          id: `ex_${rec.component}_1`,
          type: rec.component as Exercise['type'],
          difficulty,
          content: generateExerciseContent(rec.component, difficulty),
          sampleAnswer: generateSampleAnswer(rec.component, difficulty),
          points: getPointsForDifficulty(difficulty),
          completed: false,
        });
      });

      setExercises(newExercises);
      if (newExercises.length > 0) {
        setCurrentExercise(newExercises[0]);
      }
    };

    generateExercises();
  }, [componentScores, recommendations]);

  const generateExerciseContent = (component: string, difficulty: string): string => {
    const templates = {
      claim: {
        beginner: "Write a clear and concise claim for the topic: 'The impact of social media on society'",
        intermediate: "Develop a nuanced claim that addresses both positive and negative aspects of remote learning",
        advanced: "Craft a sophisticated claim that challenges conventional wisdom about climate change solutions"
      },
      data: {
        beginner: "List three pieces of evidence to support the claim: 'Regular exercise improves mental health'",
        intermediate: "Provide statistical data and research findings about the effectiveness of online education",
        advanced: "Synthesize multiple research studies to support a complex argument about economic inequality"
      },
      // Add templates for other components
    };

    return templates[component as keyof typeof templates]?.[difficulty as keyof typeof templates.claim] || 
           "Write a response that demonstrates your understanding of this component";
  };

  const generateSampleAnswer = (component: string, difficulty: string): string => {
    const samples = {
      claim: {
        beginner: "Social media has significantly transformed how people communicate and interact in modern society.",
        intermediate: "While remote learning offers flexibility and accessibility, it also presents challenges in maintaining student engagement and social development.",
        advanced: "The current approach to climate change mitigation, while well-intentioned, fails to address the fundamental economic incentives that drive carbon emissions."
      },
      data: {
        beginner: "1. A 2020 study found that 30 minutes of daily exercise reduced anxiety symptoms by 40%\n2. Regular physical activity increases serotonin levels\n3. Exercise improves sleep quality, which is linked to better mental health",
        intermediate: "According to a 2023 meta-analysis of 50 studies, online learning shows a 15% improvement in knowledge retention compared to traditional methods, while a separate study indicates a 20% decrease in student engagement.",
        advanced: "A synthesis of economic research reveals that the top 1% of earners have seen their wealth grow by 300% since 1980, while the bottom 50% have experienced a 2% decline, according to the World Inequality Database."
      },
      // Add samples for other components
    };

    return samples[component as keyof typeof samples]?.[difficulty as keyof typeof samples.claim] || 
           "This is a sample answer demonstrating the expected level of response";
  };

  const getPointsForDifficulty = (difficulty: string): number => {
    const points = {
      beginner: 10,
      intermediate: 20,
      advanced: 30
    };
    return points[difficulty as keyof typeof points] || 10;
  };

  const handleSubmit = () => {
    if (currentExercise) {
      // TODO: Implement actual answer evaluation
      const feedback = "Good attempt! Consider strengthening your argument by providing more specific examples.";
      
      setExercises(prev => prev.map(ex => 
        ex.id === currentExercise.id 
          ? { ...ex, completed: true, feedback }
          : ex
      ));
      
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    const currentIndex = exercises.findIndex(ex => ex.id === currentExercise?.id);
    if (currentIndex < exercises.length - 1) {
      setCurrentExercise(exercises[currentIndex + 1]);
      setUserAnswer('');
      setShowFeedback(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <Title level={3}>Personalized Exercises</Title>
        <Text type="secondary">
          Exercises tailored to your needs based on your performance
        </Text>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Progress Overview */}
        <Card title="Progress Overview" className="col-span-1">
          <Steps
            direction="vertical"
            current={exercises.filter(ex => ex.completed).length}
            items={exercises.map(ex => ({
              title: `${ex.type.charAt(0).toUpperCase() + ex.type.slice(1)} Exercise`,
              description: ex.difficulty,
              icon: ex.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />
            }))}
          />
        </Card>

        {/* Current Exercise */}
        <Card title="Current Exercise" className="col-span-2">
          {currentExercise ? (
            <div>
              <Space direction="vertical" size="large" className="w-full">
                <div>
                  <Tag color="blue">{currentExercise.type}</Tag>
                  <Tag color="green">{currentExercise.difficulty}</Tag>
                  <Tag color="purple">{currentExercise.points} points</Tag>
                </div>

                <Paragraph>{currentExercise.content}</Paragraph>

                <textarea
                  className="w-full p-2 border rounded"
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Write your answer here..."
                />

                {showFeedback ? (
                  <Alert
                    message="Feedback"
                    description={currentExercise.feedback}
                    type="info"
                    showIcon
                  />
                ) : null}

                <Space>
                  <Button 
                    type="primary"
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim()}
                  >
                    Submit Answer
                  </Button>
                  {showFeedback && (
                    <Button onClick={handleNext}>
                      Next Exercise
                    </Button>
                  )}
                </Space>
              </Space>
            </div>
          ) : (
            <Alert
              message="No Exercises Available"
              description="You have completed all available exercises. Check back later for more!"
              type="success"
              showIcon
            />
          )}
        </Card>
      </div>

      {/* Sample Answers */}
      {currentExercise && (
        <Card title="Sample Answer" className="mt-6">
          <Paragraph>{currentExercise.sampleAnswer}</Paragraph>
        </Card>
      )}
    </div>
  );
};

export default PersonalizedExercises; 