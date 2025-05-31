import React from 'react';
import { Layout, Typography, Space } from 'antd';
import PersonalizedExercises from '../components/PersonalizedExercises';
import { useStudent } from '../contexts/StudentContext';

const { Content } = Layout;
const { Title } = Typography;

const HomePage: React.FC = () => {
  const { student } = useStudent();

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Welcome, {student?.name || 'Student'}</Title>
          
          <PersonalizedExercises
            studentId={student?.id || ''}
            componentScores={student?.statistics?.component_scores || {}}
            recommendations={student?.recommendations || []}
          />
        </Space>
      </Content>
    </Layout>
  );
};

export default HomePage; 