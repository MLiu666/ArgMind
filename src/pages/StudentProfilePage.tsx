import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import StudentProfile from '../components/StudentProfile';

interface StudentData {
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
  };
}

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/students/${studentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }
        const data = await response.json();
        setStudentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="p-6">
        <Alert
          message="Not Found"
          description="Student profile not found"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Ensure every essay has a date (fallback to today if missing)
  const essaysWithDate = studentData.essays.map(essay => ({
    ...essay,
    date: essay.date || new Date().toISOString().split('T')[0],
  }));

  // Provide default/mock values for missing statistics fields
  const defaultStatistics = {
    averageBandScore: 0,
    strongestComponent: '',
    weakestComponent: '',
    totalEssays: 0,
    componentScores: {
      claim: 0,
      data: 0,
      warrant: 0,
      backing: 0,
      rebuttal: 0,
      qualifier: 0,
    },
    progressData: [],
    writingStyle: {
      vocabularyLevel: '',
      sentenceComplexity: '',
      coherenceScore: 0,
      commonPatterns: [],
    },
    recommendations: [],
  };

  const statistics = { ...defaultStatistics, ...studentData.statistics };

  return <StudentProfile {...studentData} essays={essaysWithDate} statistics={statistics} />;
};

export default StudentProfilePage; 