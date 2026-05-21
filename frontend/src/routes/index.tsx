import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import Dashboard from '../features/dashboard/Dashboard';
import Projects from '../features/projects/Projects';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      { path: 'resources', element: <div className="page-placeholder">资源管理</div> },
      { path: 'planning', element: <div className="page-placeholder">计划管理</div> },
      { path: 'risks', element: <div className="page-placeholder">风险管理</div> },
      { path: 'communication', element: <div className="page-placeholder">沟通管理</div> },
      { path: 'requirements', element: <div className="page-placeholder">需求管理</div> },
      { path: 'development', element: <div className="page-placeholder">开发管理</div> },
      { path: 'testing', element: <div className="page-placeholder">测试管理</div> },
      { path: 'configuration', element: <div className="page-placeholder">配置管理</div> },
      { path: 'drill', element: <div className="page-placeholder">演练管理</div> },
      { path: 'deployment', element: <div className="page-placeholder">投产管理</div> },
      { path: 'work', element: <div className="page-placeholder">工作管理</div> },
      { path: 'users', element: <div className="page-placeholder">用户管理</div> },
      { path: 'settings', element: <div className="page-placeholder">系统设置</div> },
      { path: 'help', element: <div className="page-placeholder">帮助中心</div> },
    ],
  },
]);
