import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface ComponentScores {
  [key: string]: number;
}

interface Recommendation {
  component: string;
  priority: number;
  description: string;
}

interface Student {
  id: string;
  name: string;
  statistics?: {
    component_scores: ComponentScores;
  };
  recommendations?: Recommendation[];
}

interface StudentContextType {
  student: Student | null;
  loading: boolean;
  error: string | null;
  refreshStudent: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType>({
  student: null,
  loading: false,
  error: null,
  refreshStudent: async () => {},
});

export const useStudent = () => useContext(StudentContext);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/student/profile');
      setStudent(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch student data');
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  const refreshStudent = async () => {
    await fetchStudent();
  };

  return (
    <StudentContext.Provider value={{ student, loading, error, refreshStudent }}>
      {children}
    </StudentContext.Provider>
  );
}; 