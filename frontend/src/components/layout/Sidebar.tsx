import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Menu, Typography } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  UserOutlined,
  FolderOutlined,
  WarningOutlined,
  MessageOutlined,
  FileTextOutlined,
  CodeOutlined,
  BugOutlined,
  SettingOutlined,
  SafetyOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  ToolOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: projectId } = useParams<{ id: string }>();

  const [activeKey, setActiveKey] = useState('/');
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    setActiveKey(location.pathname);
    
    if (location.pathname.startsWith('/projects/')) {
      if (!openKeys.includes('projects')) {
        setOpenKeys(['projects']);
      }
    }
  }, [location.pathname, openKeys]);

  const isProjectPage = location.pathname.startsWith('/projects/') && projectId;

  const projectSubMenuItems = [
    { key: `/projects/${projectId}/tasks`, icon: <DashboardOutlined />, label: '项目概览' },
    { key: `/projects/${projectId}/resources`, icon: <UserOutlined />, label: '资源管理' },
    { key: `/projects/${projectId}/planning`, icon: <FolderOutlined />, label: '计划管理' },
    { key: `/projects/${projectId}/risks`, icon: <WarningOutlined />, label: '风险管理' },
    { key: `/projects/${projectId}/communication`, icon: <MessageOutlined />, label: '沟通管理' },
    { key: `/projects/${projectId}/requirements`, icon: <FileTextOutlined />, label: '需求管理' },
    { key: `/projects/${projectId}/development`, icon: <CodeOutlined />, label: '开发管理' },
    { key: `/projects/${projectId}/testing`, icon: <BugOutlined />, label: '测试管理' },
    { key: `/projects/${projectId}/configuration`, icon: <SettingOutlined />, label: '配置管理' },
    { key: `/projects/${projectId}/drill`, icon: <SafetyOutlined />, label: '演练管理' },
    { key: `/projects/${projectId}/deployment`, icon: <RocketOutlined />, label: '投产管理' },
    { key: `/projects/${projectId}/work-records`, icon: <ClockCircleOutlined />, label: '工作管理' },
  ];

  const mainMenuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '概览面板' },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: '项目管理',
      children: [
        { key: '/projects', icon: <FolderOutlined />, label: '项目列表' },
      ]
    },
    {
      key: 'system',
      icon: <ToolOutlined />,
      label: '系统管理',
      children: [
        { key: '/users', icon: <UserOutlined />, label: '用户管理' },
        { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
      ]
    },
  ];

  const handleClick = (e: { key: string }) => {
    navigate(e.key);
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <div className="sidebar" style={{ width: 240, minHeight: '100vh', background: '#001529', color: '#fff', padding: '24px 0' }}>
      {isProjectPage ? (
        <div>
          <div style={{ padding: '0 16px 8px' }}>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 4,
                color: 'rgba(255, 255, 255, 0.85)',
                marginBottom: 8,
                background: 'rgba(255, 255, 255, 0.08)'
              }}
              onClick={() => navigate('/projects')}
            >
              <ArrowLeftOutlined style={{ marginRight: 8 }} />
              <span>返回项目列表</span>
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activeKey]}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleClick}
            items={projectSubMenuItems}
            style={{ borderRight: 0 }}
          />
        </div>
      ) : (
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleClick}
          items={mainMenuItems}
          style={{ borderRight: 0 }}
        />
      )}
    </div>
  );
};

export default Sidebar;
