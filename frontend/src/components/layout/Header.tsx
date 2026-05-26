import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useUser } from '../../contexts/UserContext';
import { RealTimeNotifications } from '../RealTimeNotifications';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [searchValue, setSearchValue] = useState('');
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const displayName = currentUser?.display_name || '管理员';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <path d="M60 8 L104 30 L104 70 L60 112 L16 70 L16 30 Z" stroke="#0f62fe" stroke-width="4" fill="none"/>
              <path d="M60 28 L84 48 L84 76 L60 92 L36 76 L36 48 Z" stroke="#0f62fe" stroke-width="2.5" fill="none" opacity="0.4"/>
              <circle cx="60" cy="60" r="9" fill="#0f62fe"/>
              <circle cx="60" cy="8" r="5.5" fill="#0f62fe" opacity="0.7"/>
              <circle cx="104" cy="30" r="5.5" fill="#0f62fe" opacity="0.7"/>
              <circle cx="104" cy="70" r="5.5" fill="#0f62fe" opacity="0.7"/>
              <circle cx="60" cy="112" r="5.5" fill="#0f62fe" opacity="0.7"/>
              <circle cx="16" cy="70" r="5.5" fill="#0f62fe" opacity="0.7"/>
              <circle cx="16" cy="30" r="5.5" fill="#0f62fe" opacity="0.7"/>
              <line x1="60" y1="60" x2="60" y2="8" stroke="#0f62fe" stroke-width="1.5" opacity="0.25"/>
              <line x1="60" y1="60" x2="104" y2="30" stroke="#0f62fe" stroke-width="1.5" opacity="0.25"/>
              <line x1="60" y1="60" x2="104" y2="70" stroke="#0f62fe" stroke-width="1.5" opacity="0.25"/>
              <line x1="60" y1="60" x2="60" y2="112" stroke="#0f62fe" stroke-width="1.5" opacity="0.25"/>
              <line x1="60" y1="60" x2="16" y2="70" stroke="#0f62fe" stroke-width="1.5" opacity="0.25"/>
              <line x1="60" y1="60" x2="16" y2="30" stroke="#0f62fe" stroke-width="1.5" opacity="0.25"/>
              <line x1="60" y1="8" x2="104" y2="30" stroke="#0f62fe" stroke-width="1.2" opacity="0.15"/>
              <line x1="104" y1="30" x2="104" y2="70" stroke="#0f62fe" stroke-width="1.2" opacity="0.15"/>
              <line x1="104" y1="70" x2="60" y2="112" stroke="#0f62fe" stroke-width="1.2" opacity="0.15"/>
              <line x1="60" y1="112" x2="16" y2="70" stroke="#0f62fe" stroke-width="1.2" opacity="0.15"/>
              <line x1="16" y1="70" x2="16" y2="30" stroke="#0f62fe" stroke-width="1.2" opacity="0.15"/>
              <line x1="16" y1="30" x2="60" y2="8" stroke="#0f62fe" stroke-width="1.2" opacity="0.15"/>
            </svg>
          </div>
          <span>项目管理平台</span>
        </div>
        <span className="breadcrumb">{title}</span>
      </div>
      <div className="header-right">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="搜索项目、任务、人员…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="notification-icon">
            <RealTimeNotifications />
          </div>
          <span style={{ fontSize: '14px', color: '#1890ff', fontWeight: 500 }}>{displayName}</span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: 'var(--color-text)' }}
          >
            退出
          </Button>
        </div>
      </div>
    </header>
  );
};
