import { Card, Spin, Empty } from 'antd';
import { KPICard } from '../../components/common/KPICard';
import { ModuleCard } from '../../components/common/ModuleCard';
import { AlertCard } from '../../components/common/AlertCard';
import { DonutChart } from '../../components/charts/DonutChart';
import { BarChart } from '../../components/charts/BarChart';
import { LineChart } from '../../components/charts/LineChart';
import { GanttChart } from '../../components/charts/GanttChart';
import { useGetStatsQuery, useGetAlertsQuery, useGetProjectStatusChartQuery, useGetTaskPriorityChartQuery, useGetTaskTrendChartQuery, useGetBudgetUsageChartQuery, useGetResourceUtilizationChartQuery, useGetTaskGanttDataQuery } from '../../store/api';
import { formatDateTime } from '../../utils/formatters';
import { TASK_STATUS, PRIORITY } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

interface ChartData {
  name: string;
  value: number;
}

interface TrendData {
  date: string;
  status: string;
}

interface BudgetUsage {
  name: string;
  used: number;
  total: number;
}

interface ResourceUtilization {
  name: string;
  utilization: number;
}

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
  const navigate = useNavigate();
  
  const { data: statsData, isLoading: statsLoading } = useGetStatsQuery(undefined);
  const { data: alertsData, isLoading: alertsLoading } = useGetAlertsQuery(undefined);
  const { data: projectStatusData, isLoading: projectStatusLoading } = useGetProjectStatusChartQuery(undefined);
  const { data: taskPriorityData, isLoading: taskPriorityLoading } = useGetTaskPriorityChartQuery(undefined);
  const { data: taskTrendData, isLoading: taskTrendLoading } = useGetTaskTrendChartQuery(30);
  const { data: budgetData, isLoading: budgetLoading } = useGetBudgetUsageChartQuery(undefined);
  const { data: resourceData, isLoading: resourceLoading } = useGetResourceUtilizationChartQuery(undefined);
  const { data: ganttTasks, isLoading: ganttLoading } = useGetTaskGanttDataQuery(undefined);

  const loading = statsLoading || alertsLoading || projectStatusLoading || taskPriorityLoading || taskTrendLoading || budgetLoading || resourceLoading || ganttLoading;
  
  const alerts = Array.isArray(alertsData) ? alertsData : [];
  const infoAlerts = alerts.filter((a: any) => a.level === 'info');
  const warnAlerts = alerts.filter((a: any) => a.level === 'warn');
  const critAlerts = alerts.filter((a: any) => a.level === 'crit');

  const statusColorMap: Record<string, string> = {
    planning: 'oklch(60% 0.15 170)',
    active: 'oklch(58% 0.16 145)',
    on_hold: 'oklch(70% 0.12 80)',
    completed: 'oklch(50% 0.05 250)',
    archived: 'oklch(50% 0.02 250)',
  };

  const priorityColorMap: Record<string, string> = {
    low: 'oklch(50% 0.10 145)',
    medium: 'oklch(55% 0.14 250)',
    high: 'oklch(70% 0.12 80)',
    critical: 'oklch(50% 0.20 30)',
  };

  const safeTaskTrendData = Array.isArray(taskTrendData) ? taskTrendData : [];
  const processedTrendData = safeTaskTrendData.reduce(
    (acc: { dates: string[]; byStatus: Record<string, Record<string, number>> }, curr: TrendData) => {
      if (!acc.dates.includes(curr.date)) {
        acc.dates.push(curr.date);
      }
      const statusCount = acc.byStatus[curr.status] || {};
      statusCount[curr.date] = (statusCount[curr.date] || 0) + 1;
      acc.byStatus[curr.status] = statusCount;
      return acc;
    },
    { dates: [], byStatus: {} }
  );

  const trendSeries = Object.entries(processedTrendData.byStatus).map(([status, data]) => ({
    name: TASK_STATUS[status as keyof typeof TASK_STATUS] || status,
    data: processedTrendData.dates.map((date: string) => (data as Record<string, number>)[date] || 0),
  }));

  const safeBudgetData = Array.isArray(budgetData) ? (budgetData as BudgetUsage[]) : [];
  const budgetChartData = {
    xAxis: safeBudgetData.map((b: BudgetUsage) => b.name.substring(0, 10)),
    series: [
      { name: '已使用', data: safeBudgetData.map((b: BudgetUsage) => b.used) },
      { name: '总预算', data: safeBudgetData.map((b: BudgetUsage) => b.total) },
    ],
  };

  const safeResourceData = Array.isArray(resourceData) ? (resourceData as ResourceUtilization[]) : [];
  const resourceChartData = {
    xAxis: safeResourceData.map((r: ResourceUtilization) => r.name.substring(0, 10)),
    series: [{ name: '利用率 (%)', data: safeResourceData.map((r: ResourceUtilization) => r.utilization) }],
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="kpi-row">
        <KPICard label="项目总数" value={statsData?.projects.total ?? 0} trend={`${(Object.values(statsData?.projects.by_status || {}) as number[]).reduce((sum, val) => sum + val, 0)} 累计`} trendDirection="up" variant="accent" />
        <KPICard label="进行中项目" value={statsData?.projects.by_status?.active ?? 0} trend="活跃项目" trendDirection="up" variant="success" />
        <KPICard label="任务总数" value={statsData?.tasks.total ?? 0} trend={`${statsData?.tasks.by_status?.in_progress ?? 0} 进行中`} trendDirection="up" variant="info" />
        <KPICard label="团队成员" value={statsData?.resources.total ?? 0} trend={`${statsData?.resources.by_type?.human ?? 0} 人力资源`} trendDirection="up" variant="muted" />
        <KPICard label="待办任务" value={statsData?.tasks.by_status?.todo ?? 0} trend={`${statsData?.tasks.by_priority?.critical ?? 0} 紧急`} trendDirection="down" variant="warning" />
        <KPICard label="待处理预警" value={alerts.length || 8} trend="待关注" trendDirection="down" variant="danger" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {critAlerts.map((alert: any) => (
          <AlertCard key={alert._id} message={alert.message} count={alert.count || 1} level="crit" />
        ))}
        {warnAlerts.map((alert: any) => (
          <AlertCard key={alert._id} message={alert.message} count={alert.count || 1} level="warn" />
        ))}
        {infoAlerts.map((alert: any) => (
          <AlertCard key={alert._id} message={alert.message} count={alert.count || 1} level="info" />
        ))}
        {alerts.length === 0 && (
          <>
            <AlertCard message="今日有 3 个项目进入关键节点，2 个里程碑即将到期" count={3} level="info" />
            <AlertCard message="资源利用率超阈值：开发组 A 负载 94%，建议调配" count={2} level="warn" />
            <AlertCard message="高风险预警：项目「核心系统升级」已延迟 5 天，风险评级上调" count={1} level="crit" />
          </>
        )}
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
        <Card title="项目状态分布" size="small" style={{ flex: 1 }}>
          {Array.isArray(projectStatusData) && projectStatusData.length > 0 ? (
            <DonutChart
              data={projectStatusData}
              colors={(projectStatusData as ChartData[]).map((d: ChartData) => statusColorMap[d.name] || 'oklch(58% 0.16 145)')}
            />
          ) : (
            <Empty description="暂无数据" />
          )}
        </Card>

        <Card title="任务优先级分布" size="small" style={{ flex: 1 }}>
          {Array.isArray(taskPriorityData) && taskPriorityData.length > 0 ? (
            <BarChart
              xAxis={(taskPriorityData as ChartData[]).map((d: ChartData) => PRIORITY[d.name as keyof typeof PRIORITY] || d.name)}
              series={[{ name: '任务数', data: (taskPriorityData as ChartData[]).map((d: ChartData) => d.value) }]}
              colors={(taskPriorityData as ChartData[]).map((d: ChartData) => priorityColorMap[d.name] || 'oklch(58% 0.16 145)')}
              horizontal
            />
          ) : (
            <Empty description="暂无数据" />
          )}
        </Card>
      </div>

      <Card title="任务趋势" size="small" style={{ marginBottom: 16 }}>
        {processedTrendData.dates.length > 0 ? (
          <LineChart
            xAxis={processedTrendData.dates}
            series={trendSeries}
            fillArea
          />
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>

      <Card title="项目甘特图" size="small" style={{ marginBottom: 16 }}>
        {Array.isArray(ganttTasks) && ganttTasks.length > 0 ? (
          <GanttChart tasks={ganttTasks} height={350} />
        ) : (
          <Empty description="暂无任务数据" />
        )}
      </Card>

      <div className="charts-row">
        <Card title="预算使用情况" size="small" style={{ flex: 1 }}>
          {Array.isArray(budgetData) && budgetData.length > 0 ? (
            <BarChart
              xAxis={budgetChartData.xAxis}
              series={budgetChartData.series}
              colors={['oklch(58% 0.16 145)', 'oklch(50% 0.05 250)']}
            />
          ) : (
            <Empty description="暂无数据" />
          )}
        </Card>

        <Card title="资源利用率" size="small" style={{ flex: 1 }}>
          {Array.isArray(resourceData) && resourceData.length > 0 ? (
            <BarChart
              xAxis={resourceChartData.xAxis}
              series={resourceChartData.series}
              colors={['oklch(70% 0.12 80)']}
            />
          ) : (
            <Empty description="暂无数据" />
          )}
        </Card>
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
          <button className="quick-btn accent" onClick={() => navigate('/projects')}>➕ 新建项目</button>
          <button className="quick-btn" onClick={() => navigate('/export')}>📤 导出报表</button>
          <button className="quick-btn" onClick={() => navigate('/gantt')}>📊 查看统计</button>
          <button className="quick-btn" onClick={() => navigate('/notifications')}>🔔 预警设置</button>
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
