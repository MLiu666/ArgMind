import React from 'react';
import { Button, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-md p-4">
      <Space>
        <Button 
          type="primary"
          icon={<UserOutlined />}
          onClick={() => navigate('/student-profile')}
        >
          Student Profile
        </Button>
        {/* Add other navigation buttons here */}
      </Space>
    </div>
  );
};

export default Navigation; 