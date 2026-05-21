import { KPICard } from '../../components/common/KPICard';
import { ModuleCard } from '../../components/common/ModuleCard';
import { AlertCard } from '../../components/common/AlertCard';
import { formatDateTime } from '../../utils/formatters';

const modules = [
  { name: '项目管理', icon: '🗂', stat: '48', statLabel: '个活跃项目', status: '正常', color: 'oklch(58% 0.16 145)', path: '/projects' },
  { name: '资源管理', icon: '👥', stat: '156', statLabel: '人', status: '正常', color: 'oklch(55% 0.14 250)', path: '/resources' },
  { name: '计划管理', icon: '📅', stat: '342', statLabel: '项任务', status: '正常', color: 'oklch(60% 0.15 170)', path: '/planning' },
  { name: '风险管理', icon: '⚡', stat: '8', statLabel: '项高风险', status: '预警', color: 'oklch(70% 0.12 80)', path: '/risks' },
  { name: '沟通管理', icon: '💬', stat: '56', statLabel: '条沟通记录', status: '正常', color: 'oklch(55% 0.14 250)', path: '/communication' },
  { name: '需求管理', icon: '📝', stat: '189', statLabel: '项需求', status: '正常', color: 'oklch(58% 0.16 145)', path: '/requirements' },
  { name: '开发管理', icon: '🔧', stat: '1,247', statLabel: '条开发任务', status: '正常', color: 'oklch(55% 0.14 250)', path: '/development' },
  { name: '测试管理', icon: '🧪', stat: '892', statLabel: '条测试用例', status: '正常', color: 'oklch(60% 0.15 170)', path: '/testing' },
  { name: '配置管理', icon: '⚙️', stat: '34', statLabel: '项配置项', status: '正常', color: 'oklch(58% 0.16 145)', path: '/configuration' },
  { name: '演练管理', icon: '🎯', stat: '12', statLabel: '次演练', status: '正常', color: 'oklch(70% 0.12 80)', path: '/drill' },
  { name: '投产管理', icon: '🚀', stat: '6', statLabel: '次投产', status: '预警', color: 'oklch(55% 0.14 250)', path: '/deployment' },
  { name: '工作管理', icon: '📋', stat: '98%', statLabel: '考勤出勤率', status: '正常', color: 'oklch(58% 0.16 145)', path: '/work' },
];

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="kpi-row">
        <KPICard label="项目总数" value={48} trend="12.5% 同比" trendDirection="up" variant="accent" />
        <KPICard label="进行中项目" value={32} trend="3 本周新增" trendDirection="up" variant="success" />
        <KPICard label="本月任务完成率" value="87.3%" trend="5.2% 环比" trendDirection="up" variant="info" />
        <KPICard label="团队成员" value={156} trend="2 人离岗" trendDirection="down" variant="muted" />
        <KPICard label="里程碑按时完成率" value="76.2%" trend="8.1% 环比" trendDirection="up" variant="warning" />
        <KPICard label="待处理预警" value={8} trend="待关注" trendDirection="down" variant="danger" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AlertCard message="今日有 3 个项目进入关键节点，2 个里程碑即将到期" count={3} level="info" />
        <AlertCard message="资源利用率超阈值：开发组 A 负载 94%，建议调配" count={2} level="warn" />
        <AlertCard message="高风险预警：项目「核心系统升级」已延迟 5 天，风险评级上调" count={1} level="crit" />
      </div>

      <section>
        <div className="section-title"><span className="dot"></span>业务模块概览</div>
        <div className="module-grid">
          {modules.map((m) => (
            <ModuleCard key={m.name} {...m} />
          ))}
        </div>
      </section>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">项目状态分布</div>
              <div className="chart-subtitle">当前 48 个项目</div>
            </div>
          </div>
          <div className="donut-chart">
            <div className="donut-wrap">
              <svg viewBox="0 0 140 140" width="160" height="160">
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--color-border)" strokeWidth="12" />
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--color-accent)" strokeWidth="12" strokeDasharray="175 226" strokeLinecap="round" />
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--color-info)" strokeWidth="12" strokeDasharray="52 349" strokeDashoffset="-181" strokeLinecap="round" />
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--color-warning)" strokeWidth="12" strokeDasharray="37 364" strokeDashoffset="-236" strokeLinecap="round" />
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--color-muted)" strokeWidth="12" strokeDasharray="19 382" strokeDashoffset="-274" strokeLinecap="round" />
              </svg>
              <div className="donut-center">
                <div className="dc-val mono-value">48</div>
                <div className="dc-label">项目</div>
              </div>
            </div>
            <div className="donut-legend">
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--color-accent)' }} />进行中 <span className="legend-value mono-value">30</span></div>
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--color-info)' }} />规划中 <span className="legend-value mono-value">9</span></div>
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--color-warning)' }} />延期 <span className="legend-value mono-value">6</span></div>
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--color-muted)' }} />已归档 <span className="legend-value mono-value">3</span></div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">任务优先级分布</div>
              <div className="chart-subtitle">当前周期 1,247 个任务</div>
            </div>
          </div>
          <div className="bar-chart">
            <div className="bar-row">
              <div className="bar-label">紧急</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '18%', background: 'var(--color-danger)' }} /></div>
              <div className="bar-value mono-value">224</div>
            </div>
            <div className="bar-row">
              <div className="bar-label">高</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '42%', background: 'var(--color-warning)' }} /></div>
              <div className="bar-value mono-value">524</div>
            </div>
            <div className="bar-row">
              <div className="bar-label">中</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '28%', background: 'var(--color-info)' }} /></div>
              <div className="bar-value mono-value">349</div>
            </div>
            <div className="bar-row">
              <div className="bar-label">低</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '12%', background: 'var(--color-success)' }} /></div>
              <div className="bar-value mono-value">150</div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="section-title"><span className="dot"></span>系统运行状态</div>
        <div className="ops-row">
          <div className="ops-card">
            <div className="ops-grid">
              <div className="ops-cell">
                <div className="ops-cell-label">系统运行天数</div>
                <div className="ops-cell-value mono-value">1,247 天</div>
                <div className="ops-cell-sub">自 2022-03-15 上线</div>
              </div>
              <div className="ops-cell">
                <div className="ops-cell-label">最后备份</div>
                <div className="ops-cell-value mono-value" style={{ color: 'var(--color-success)' }}>今日 03:00</div>
                <div className="ops-cell-sub">自动备份成功</div>
              </div>
              <div className="ops-cell">
                <div className="ops-cell-label">今日日志量</div>
                <div className="ops-cell-value mono-value">42,891</div>
                <div className="ops-cell-sub">正常水平</div>
              </div>
              <div className="ops-cell">
                <div className="ops-cell-label">在线用户数</div>
                <div className="ops-cell-value mono-value">89 / 156</div>
                <div className="ops-cell-sub">57.1% 在线率</div>
              </div>
            </div>
          </div>
          <div className="ops-card">
            <div className="ops-grid">
              <div className="ops-cell">
                <div className="ops-cell-label">数据库大小</div>
                <div className="ops-cell-value mono-value">128.4 GB</div>
                <div className="ops-cell-sub">上月增长 4.2 GB</div>
              </div>
              <div className="ops-cell">
                <div className="ops-cell-label">API 请求 / 分钟</div>
                <div className="ops-cell-value mono-value">3,421</div>
                <div className="ops-cell-sub">峰值 5,892 (14:32)</div>
              </div>
              <div className="ops-cell">
                <div className="ops-cell-label">错误率</div>
                <div className="ops-cell-value mono-value" style={{ color: 'var(--color-success)' }}>0.02%</div>
                <div className="ops-cell-sub">目标 &lt; 0.05%</div>
              </div>
              <div className="ops-cell">
                <div className="ops-cell-label">平均响应</div>
                <div className="ops-cell-value mono-value" style={{ color: 'var(--color-success)' }}>42 ms</div>
                <div className="ops-cell-sub">P99: 189 ms</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title"><span className="dot"></span>快捷操作</div>
        <div className="quick-row">
          <button className="quick-btn accent">➕ 新建项目</button>
          <button className="quick-btn">📤 导出报表</button>
          <button className="quick-btn">📊 查看统计</button>
          <button className="quick-btn">🔔 预警设置</button>
          <button className="quick-btn">💾 立即备份</button>
          <button className="quick-btn">📋 系统日志</button>
        </div>
      </section>

      <footer className="page-footer">
        <span>© 2025 项目管理平台 · 企业版</span>
        <span className="version mono-value">v1.0.0-alpha · {formatDateTime(new Date())}</span>
      </footer>
    </>
  );
};

export default Dashboard;
