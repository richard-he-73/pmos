import { useNavigate } from 'react-router-dom';

interface ModuleCardProps {
  name: string;
  icon: string;
  stat: string;
  statLabel: string;
  status: string;
  color: string;
  path: string;
}

const statusClassMap: Record<string, string> = {
  '正常': 'status-ok',
  '预警': 'status-warn',
  '异常': 'status-alert',
};

export const ModuleCard: React.FC<ModuleCardProps> = ({
  name,
  icon,
  stat,
  statLabel,
  status,
  color,
  path,
}) => {
  const navigate = useNavigate();

  return (
    <div className="module-card" onClick={() => navigate(path)}>
      <div className="module-header">
        <div className="module-icon" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <div className="module-name">{name}</div>
      </div>
      <div className="module-stat mono-value">{stat}</div>
      <div className="module-stat-label">{statLabel}</div>
      <div className="module-footer">
        <span className={`status-pill ${statusClassMap[status] || 'status-ok'}`}>{status}</span>
        <span className="module-link">查看详情 →</span>
      </div>
    </div>
  );
};
