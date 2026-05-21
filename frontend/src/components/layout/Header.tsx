import { useState } from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">PM</div>
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
        <div className="user-avatar" title="管理员">管</div>
      </div>
    </header>
  );
};
