import React from 'react';
import { Card, Typography, List, Tag, Progress, Space, Row, Col, Statistic, Timeline } from 'antd';
import { UserOutlined, BookOutlined, TrophyOutlined, RiseOutlined, FallOutlined, BulbOutlined, LineChartOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';

const { Title, Text, Paragraph } = Typography;

interface StudentProfileProps {
  studentId: string;
  name: string;
  essays: Array<{
    id: string;
    topic: string;
    bandScore: number;
    date: string;
    components: {
      claim: string;
      data: string[];
      warrant: string;
      backing: string;
      rebuttal: string;
      qualifier: string;
    };
  }>;
  statistics: {
    averageBandScore: number;
    strongestComponent: string;
    weakestComponent: string;
    totalEssays: number;
    componentScores: {
      claim: number;
      data: number;
      warrant: number;
      backing: number;
      rebuttal: number;
      qualifier: number;
    };
    progressData: Array<{
      date: string;
      score: number;
    }>;
    writingStyle: {
      vocabularyLevel: string;
      sentenceComplexity: string;
      coherenceScore: number;
      commonPatterns: string[];
    };
    recommendations: Array<{
      component: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
}

const StudentProfile: React.FC<StudentProfileProps> = ({
  studentId,
  name,
  essays,
  statistics,
}) => {
  // Prepare data for the progress chart
  const progressChartData = statistics.progressData.map(item => ({
    date: item.date,
    score: item.score,
  }));

  return (
    <div className="p-6">
      {/* Basic Info Card */}
      <Card className="mb-6">
        <Space align="center" className="mb-4">
          <UserOutlined className="text-2xl" />
          <Title level={2} className="m-0">{name}</Title>
        </Space>
        <Text type="secondary">Student ID: {studentId}</Text>
      </Card>

      {/* Performance Overview */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Band Score"
              value={statistics.averageBandScore}
              precision={1}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Essays"
              value={statistics.totalEssays}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Progress Trend"
              value={statistics.progressData[statistics.progressData.length - 1].score - statistics.progressData[0].score}
              precision={1}
              prefix={statistics.progressData[statistics.progressData.length - 1].score > statistics.progressData[0].score ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ color: statistics.progressData[statistics.progressData.length - 1].score > statistics.progressData[0].score ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Component Analysis */}
      <Card title="Component Analysis" className="mb-6">
        <Row gutter={[16, 16]}>
          {Object.entries(statistics.componentScores).map(([component, score]) => (
            <Col span={8} key={component}>
              <Card size="small">
                <Text strong className="capitalize">{component}</Text>
                <Progress 
                  percent={score * 10} 
                  format={percent => `${(percent / 10).toFixed(1)}`}
                  status={score >= 7 ? "success" : score >= 6 ? "normal" : "exception"}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Progress Chart */}
      <Card title="Progress Over Time" className="mb-6">
        <Line
          data={progressChartData}
          xField="date"
          yField="score"
          point={{
            size: 5,
            shape: 'diamond',
          }}
          smooth
        />
      </Card>

      {/* Writing Style Analysis */}
      <Card title="Writing Style Analysis" className="mb-6">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Vocabulary Level"
                value={statistics.writingStyle.vocabularyLevel}
                prefix={<BulbOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Sentence Complexity"
                value={statistics.writingStyle.sentenceComplexity}
                prefix={<LineChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Coherence Score"
                value={statistics.writingStyle.coherenceScore}
                precision={1}
                suffix="/10"
              />
            </Card>
          </Col>
        </Row>
        <div className="mt-4">
          <Text strong>Common Writing Patterns:</Text>
          <div className="mt-2">
            {statistics.writingStyle.commonPatterns.map((pattern, index) => (
              <Tag key={index} color="blue" className="mr-2 mb-2">
                {pattern}
              </Tag>
            ))}
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card title="Recommendations for Improvement" className="mb-6">
        <Timeline>
          {statistics.recommendations.map((rec, index) => (
            <Timeline.Item 
              key={index}
              color={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'orange' : 'blue'}
            >
              <Text strong className="capitalize">{rec.component}:</Text>
              <Paragraph className="mt-1">{rec.suggestion}</Paragraph>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Recent Essays */}
      <Card 
        title={
          <Space>
            <BookOutlined />
            <span>Recent Essays</span>
          </Space>
        }
      >
        <List
          dataSource={essays}
          renderItem={essay => (
            <List.Item>
              <Card className="w-full">
                <Space direction="vertical" size="small">
                  <Title level={4}>{essay.topic}</Title>
                  <Space>
                    <TrophyOutlined />
                    <Text>Band Score: {essay.bandScore}</Text>
                    <Text type="secondary">Date: {essay.date}</Text>
                  </Space>
                  <div className="mt-2">
                    <Text strong>Key Components:</Text>
                    <div className="mt-1">
                      <Tag color="blue">Claim: {essay.components.claim.substring(0, 50)}...</Tag>
                      <Tag color="green">Data: {essay.components.data.length} points</Tag>
                      <Tag color="purple">Warrant: {essay.components.warrant.substring(0, 50)}...</Tag>
                    </div>
                  </div>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default StudentProfile; 