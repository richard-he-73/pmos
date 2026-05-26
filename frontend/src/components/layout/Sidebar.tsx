import { useNavigate, useLocation } from 'react-router-dom';

const navModules = [
  { section: '', items: [
    { name: '概览面板', icon: '◈', path: '/' },
    { name: '项目管理', icon: '🗂', path: '/projects' },
    { name: '资源管理', icon: '👥', path: '/resources' },
    { name: '计划管理', icon: '📅', path: '/planning' },
    { name: '风险管理', icon: '⚡', path: '/risks' },
    { name: '沟通管理', icon: '💬', path: '/communication' },
    { name: '需求管理', icon: '📝', path: '/requirements' },
    { name: '开发管理', icon: '🔧', path: '/development' },
    { name: '测试管理', icon: '🧪', path: '/testing' },
    { name: '配置管理', icon: '⚙️', path: '/configuration' },
    { name: '演练管理', icon: '🎯', path: '/drill' },
    { name: '投产管理', icon: '🚀', path: '/deployment' },
    { name: '工作管理', icon: '📋', path: '/work' },
  ]},
  { section: '系统', items: [
    { name: '用户管理', icon: '🔐', path: '/users' },
    { name: '系统设置', icon: '🔧', path: '/settings' },
    { name: '帮助中心', icon: '❓', path: '/help' },
  ]},
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="主导航">
      {navModules.map((module, idx) => (
        <div key={idx}>
          {module.section && (
            <div className="sidebar-section">{module.section}</div>
          )}
          {module.items.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              role="link"
              tabIndex={0}
              onClick={() => navigate(item.path)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
};
