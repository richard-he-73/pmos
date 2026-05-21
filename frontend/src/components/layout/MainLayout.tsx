import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const titleMap: Record<string, string> = {
  '/': '概览面板',
  '/projects': '项目管理',
  '/resources': '资源管理',
  '/planning': '计划管理',
  '/risks': '风险管理',
  '/communication': '沟通管理',
  '/requirements': '需求管理',
  '/development': '开发管理',
  '/testing': '测试管理',
  '/configuration': '配置管理',
  '/drill': '演练管理',
  '/deployment': '投产管理',
  '/work': '工作管理',
  '/users': '用户管理',
  '/settings': '系统设置',
  '/help': '帮助中心',
};

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const title = titleMap[location.pathname] || '项目管理平台';

  return (
    <div className="app">
      <Header title={title} />
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
};
