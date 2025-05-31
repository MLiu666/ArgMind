import React from 'react';
import { Layout, Typography, Space } from 'antd';
import PersonalizedExercises from '../components/PersonalizedExercises';
import { useStudent } from '../contexts/StudentContext';

const { Content } = Layout;
const { Title } = Typography;

const HomePage: React.FC = () => {
  const { student } = useStudent();

  const defaultComponentScores = {
    claim: 0,
    data: 0,
    warrant: 0,
    backing: 0,
    rebuttal: 0,
    qualifier: 0,
  };

  // Ensure componentScores always has all required keys
  const componentScores = {
    ...defaultComponentScores,
    ...(student?.statistics?.component_scores || {}),
  };

  // Ensure recommendations have the suggestion property
  const recommendations = (student?.recommendations || []).map((rec: any) => ({
    component: rec.component,
    suggestion: rec.suggestion || rec.description || '',
    priority: rec.priority || 'medium',
  }));

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Welcome, {student?.name || 'Student'}</Title>
          
          <PersonalizedExercises
            studentId={student?.id || ''}
            componentScores={componentScores}
            recommendations={recommendations}
          />
        </Space>
      </Content>
    </Layout>
  );
};

export default HomePage; 