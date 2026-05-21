import { useState } from 'react';
import { KPICard } from '../../components/common/KPICard';
import { StatusPill } from '../../components/common/StatusPill';
import { formatDateTime } from '../../utils/formatters';

interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  progress: number;
  status: string;
  manager: string;
  startDate: string;
  endDate: string;
  budget: number;
  used: number;
  tasks: string;
  risks: number;
  color: string;
}

const initialProjects: Project[] = [
  { id: '1', code: 'PRJ-001', name: '核心系统升级', client: '金融事业部', progress: 85, status: '进行中', manager: '张伟', startDate: '2024-01', endDate: '2024-12', budget: 800, used: 680, tasks: '124/146', risks: 2, color: 'var(--color-accent)' },
  { id: '2', code: 'PRJ-002', name: '数据中台建设', client: '运营中心', progress: 62, status: '进行中', manager: '李明', startDate: '2024-03', endDate: '2025-06', budget: 600, used: 372, tasks: '89/143', risks: 1, color: 'var(--color-info)' },
  { id: '3', code: 'PRJ-003', name: '移动端重构', client: '产品部', progress: 45, status: '正常', manager: '王芳', startDate: '2024-06', endDate: '2025-03', budget: 400, used: 180, tasks: '56/124', risks: 0, color: 'var(--color-success)' },
  { id: '4', code: 'PRJ-004', name: '安全合规审计', client: '合规部', progress: 95, status: '即将完成', manager: '赵强', startDate: '2024-02', endDate: '2024-11', budget: 350, used: 332, tasks: '112/118', risks: 0, color: 'var(--color-warning)' },
  { id: '5', code: 'PRJ-005', name: '智能客服平台', client: '客服中心', progress: 30, status: '正常', manager: '孙丽', startDate: '2024-08', endDate: '2025-08', budget: 500, used: 150, tasks: '34/112', risks: 3, color: 'var(--color-accent-hover, var(--color-accent))' },
  { id: '6', code: 'PRJ-006', name: '供应链数字化', client: '供应链部', progress: 78, status: '进行中', manager: '周杰', startDate: '2024-04', endDate: '2025-01', budget: 450, used: 351, tasks: '95/122', risks: 1, color: 'var(--color-accent)' },
];

const Projects: React.FC = () => {
  const [projects] = useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="kpi-row">
        <KPICard label="项目总数" value={projects.length} trend="12.5% 同比" trendDirection="up" variant="accent" />
        <KPICard label="进行中" value={projects.filter((p) => p.status === '进行中').length} trend="3 本周新增" trendDirection="up" variant="success" />
        <KPICard label="已完成" value={14} trend="2 本月" trendDirection="up" variant="info" />
        <KPICard label="延期项目" value={2} trend="需关注" trendDirection="down" variant="warning" />
        <KPICard label="平均进度" value="78%" trend="4.2% 环比" trendDirection="up" variant="muted" />
        <KPICard label="预算使用率" value="82%" trend="12% 剩余" trendDirection="down" variant="danger" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="section-title" style={{ marginBottom: 0 }}><span className="dot"></span>项目列表</div>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="搜索项目 / 客户 / 负责人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="project-grid">
        {filteredProjects.map((project, idx) => (
          <div key={project.id} className="project-card" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="project-card-header">
              <div>
                <div className="project-name">{project.name}</div>
                <div className="project-client">{project.client}</div>
              </div>
              <StatusPill label={project.status} variant={project.status === '进行中' ? 'ok' : project.status === '即将完成' ? 'info' : 'ok'} />
            </div>
            <div className="project-progress">
              <div className="project-progress-label">
                <span>进度</span>
                <span className="mono-value">{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${project.progress}%`, background: project.color }} />
              </div>
            </div>
            <div className="project-meta">
              <span>负责人: {project.manager}</span>
              <span className="mono-value">{project.startDate} ~ {project.endDate}</span>
            </div>
            <div className="project-detail">
              <div className="detail-grid">
                <div className="detail-cell">
                  <div className="detail-label">预算</div>
                  <div className="detail-value mono-value">{project.budget}万</div>
                </div>
                <div className="detail-cell">
                  <div className="detail-label">已用</div>
                  <div className="detail-value mono-value">{project.used}万</div>
                </div>
                <div className="detail-cell">
                  <div className="detail-label">风险</div>
                  <div className="detail-value mono-value" style={{ color: project.risks > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {project.risks}项
                  </div>
                </div>
                <div className="detail-cell">
                  <div className="detail-label">任务</div>
                  <div className="detail-value mono-value">{project.tasks}</div>
                </div>
                <div className="detail-cell">
                  <div className="detail-label">预算率</div>
                  <div className="detail-value mono-value">{Math.round(project.used / project.budget * 100)}%</div>
                </div>
                <div className="detail-cell">
                  <div className="detail-label">更新时间</div>
                  <div className="detail-value" style={{ fontSize: '12px' }}>{formatDateTime(new Date())}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="page-footer">
        <span>© 2025 项目管理平台 · 企业版</span>
        <span className="version mono-value">v1.0.0-alpha · {formatDateTime(new Date())}</span>
      </footer>
    </>
  );
};

export default Projects;
