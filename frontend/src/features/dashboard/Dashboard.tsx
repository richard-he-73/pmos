import { Card, Spin, Empty } from 'antd';
import { KPICard } from '../../components/common/KPICard';
import { ModuleCard } from '../../components/common/ModuleCard';
import { AlertCard } from '../../components/common/AlertCard';
import { DonutChart } from '../../components/charts/DonutChart';
import { BarChart } from '../../components/charts/BarChart';
import { LineChart } from '../../components/charts/LineChart';
import { GanttChart } from '../../components/charts/GanttChart';
import { useGetStatsQuery, useGetAlertsQuery, useGetProjectStatusChartQuery, useGetTaskPriorityChartQuery, useGetProjectPriorityChartQuery, useGetTaskTrendChartQuery, useGetBudgetUsageChartQuery, useGetResourceUtilizationChartQuery, useGetTaskGanttDataQuery, useGetProjectsQuery, useGetDefaultProjectQuery } from '../../store/api';
import { formatDateTime } from '../../utils/formatters';
import { TASK_STATUS, PRIORITY, PROJECT_STATUS } from '../../utils/constants';
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: defaultProject } = useGetDefaultProjectQuery(undefined, { refetchOnMountOrArgChange: true });
  const defaultProjectId = defaultProject?._id;
  
  const { data: statsData, isLoading: statsLoading } = useGetStatsQuery(defaultProjectId);
  const { data: alertsData, isLoading: alertsLoading } = useGetAlertsQuery(undefined);
  const { data: projectStatusData, isLoading: projectStatusLoading } = useGetProjectStatusChartQuery(defaultProjectId);
  const { data: taskPriorityData, isLoading: taskPriorityLoading } = useGetTaskPriorityChartQuery(defaultProjectId);
  const { data: projectPriorityData, isLoading: projectPriorityLoading } = useGetProjectPriorityChartQuery(defaultProjectId);
  const { data: taskTrendData, isLoading: taskTrendLoading } = useGetTaskTrendChartQuery({ limit: 30, projectId: defaultProjectId });
  const { data: projects = [] } = useGetProjectsQuery(undefined);
  const { data: budgetData, isLoading: budgetLoading } = useGetBudgetUsageChartQuery(defaultProjectId);
  const { data: resourceData, isLoading: resourceLoading } = useGetResourceUtilizationChartQuery(undefined);
  const { data: ganttTasks, isLoading: ganttLoading } = useGetTaskGanttDataQuery({ project_id: defaultProjectId });

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

  // 调试日志
  console.log('Dashboard - defaultProject:', defaultProject);
  console.log('Dashboard - defaultProjectId:', defaultProjectId);
  console.log('Dashboard - projects length:', projects.length);
  console.log('Dashboard - projects[0]?._id:', projects[0]?._id);
  
  // 获取默认项目的ID，如果没有则使用第一个项目的ID
  const targetProjectId = defaultProjectId || (projects.length > 0 ? projects[0]._id : null);

  // 业务模块概览数据（链接到实际存在的路由）
  const modules = [
    { name: '项目管理', icon: '🗂', stat: statsData?.modules?.projects?.count ?? 0, statLabel: '个活跃项目', status: statsData?.modules?.projects?.status || '正常', color: 'oklch(58% 0.16 145)', path: '/projects' },
    { name: '资源管理', icon: '👥', stat: statsData?.modules?.resources?.count ?? 0, statLabel: '人', status: statsData?.modules?.resources?.status || '正常', color: 'oklch(55% 0.14 250)', path: targetProjectId ? `/projects/${targetProjectId}/resources` : '/projects' },
    { name: '计划管理', icon: '📅', stat: statsData?.modules?.planning?.count ?? 0, statLabel: '项任务', status: statsData?.modules?.planning?.status || '正常', color: 'oklch(60% 0.15 170)', path: targetProjectId ? `/projects/${targetProjectId}/planning` : '/projects' },
    { name: '风险管理', icon: '⚡', stat: statsData?.modules?.risks?.count ?? 0, statLabel: '项高风险', status: statsData?.modules?.risks?.status || '正常', color: 'oklch(70% 0.12 80)', path: targetProjectId ? `/projects/${targetProjectId}/risks` : '/projects' },
    { name: '沟通管理', icon: '💬', stat: statsData?.modules?.communication?.count ?? 0, statLabel: '条沟通记录', status: statsData?.modules?.communication?.status || '正常', color: 'oklch(55% 0.14 250)', path: targetProjectId ? `/projects/${targetProjectId}/communication` : '/projects' },
    { name: '需求管理', icon: '📝', stat: statsData?.modules?.requirements?.count ?? 0, statLabel: '项需求', status: statsData?.modules?.requirements?.status || '正常', color: 'oklch(58% 0.16 145)', path: targetProjectId ? `/projects/${targetProjectId}/requirements` : '/projects' },
    { name: '开发管理', icon: '🔧', stat: statsData?.modules?.development?.count ?? 0, statLabel: '条开发任务', status: statsData?.modules?.development?.status || '正常', color: 'oklch(55% 0.14 250)', path: targetProjectId ? `/projects/${targetProjectId}/development` : '/projects' },
    { name: '测试管理', icon: '🧪', stat: statsData?.modules?.testing?.count ?? 0, statLabel: '条测试用例', status: statsData?.modules?.testing?.status || '正常', color: 'oklch(60% 0.15 170)', path: targetProjectId ? `/projects/${targetProjectId}/testing` : '/projects' },
    { name: '配置管理', icon: '⚙️', stat: statsData?.modules?.configuration?.count ?? 0, statLabel: '项配置项', status: statsData?.modules?.configuration?.status || '正常', color: 'oklch(58% 0.16 145)', path: targetProjectId ? `/projects/${targetProjectId}/configuration` : '/projects' },
    { name: '演练管理', icon: '🎯', stat: statsData?.modules?.drill?.count ?? 0, statLabel: '次演练', status: statsData?.modules?.drill?.status || '正常', color: 'oklch(70% 0.12 80)', path: targetProjectId ? `/projects/${targetProjectId}/drill` : '/projects' },
    { name: '投产管理', icon: '🚀', stat: statsData?.modules?.deployment?.count ?? 0, statLabel: '次投产', status: statsData?.modules?.deployment?.status || '正常', color: 'oklch(55% 0.14 250)', path: targetProjectId ? `/projects/${targetProjectId}/deployment` : '/projects' },
    { name: '工作管理', icon: '📋', stat: statsData?.modules?.work?.count ?? '-', statLabel: '考勤出勤率', status: statsData?.modules?.work?.status || '正常', color: 'oklch(58% 0.16 145)', path: targetProjectId ? `/projects/${targetProjectId}/work-records` : '/projects' },
  ];

  return (
    <>
      {defaultProject && (
        <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: '#e6f7ff', borderRadius: 4, border: '1px solid #91d5ff' }}>
          <span style={{ color: '#1890ff' }}>📌 当前显示默认项目数据：</span>
          <strong>{defaultProject.name}</strong>
          <span style={{ marginLeft: 16, color: '#8c8c8c' }}>
            (可在项目管理中修改默认项目)
          </span>
        </div>
      )}
      <div className="kpi-row">
        <KPICard label="项目总数" value={statsData?.projects.total ?? 0} trend={`${(Object.values(statsData?.projects.by_status || {}) as number[]).reduce((sum, val) => sum + val, 0)} 累计`} trendDirection="up" variant="accent" />
        <KPICard label="进行中项目" value={statsData?.projects.by_status?.active ?? 0} trend="活跃项目" trendDirection="up" variant="success" />
        <KPICard label="任务总数" value={statsData?.tasks.total ?? 0} trend={`${statsData?.tasks.by_status?.in_progress ?? 0} 进行中`} trendDirection="up" variant="info" />
        <KPICard label="资源总数" value={statsData?.resources.total ?? 0} trend={`${statsData?.resources.by_type?.human ?? 0} 人力资源`} trendDirection="up" variant="muted" />
        <KPICard label="待办任务" value={statsData?.tasks.by_status?.todo ?? 0} trend={`${statsData?.tasks.by_priority?.critical ?? 0} 紧急`} trendDirection="down" variant="warning" />
        <KPICard label="待处理预警" value={alerts.length} trend="待关注" trendDirection="down" variant="danger" />
      </div>

      {alerts.length > 0 && (
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
        </div>
      )}

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
              data={(projectStatusData as ChartData[]).map((d: ChartData) => ({
                ...d,
                name: PROJECT_STATUS[d.name as keyof typeof PROJECT_STATUS] || d.name,
              }))}
              colors={(projectStatusData as ChartData[]).map((d: ChartData) => statusColorMap[d.name] || 'oklch(58% 0.16 145)')}
            />
          ) : (
            <Empty description="暂无数据" />
          )}
        </Card>

        <Card title="项目优先级分布" size="small" style={{ flex: 1 }}>
          {Array.isArray(projectPriorityData) && projectPriorityData.length > 0 ? (
            <BarChart
              xAxis={(projectPriorityData as ChartData[]).map((d: ChartData) => PRIORITY[d.name as keyof typeof PRIORITY] || d.name)}
              series={[{ name: '项目数', data: (projectPriorityData as ChartData[]).map((d: ChartData) => d.value) }]}
              colors={(projectPriorityData as ChartData[]).map((d: ChartData) => priorityColorMap[d.name] || 'oklch(58% 0.16 145)')}
              horizontal
            />
          ) : (
            <Empty description="暂无数据" />
          )}
        </Card>
      </div>

      <div className="charts-row">
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
        <div className="section-title"><span className="dot"></span>快捷操作</div>
        <div className="quick-row">
          <button className="quick-btn accent" onClick={() => navigate('/projects')}>➕ 新建项目</button>
          <button className="quick-btn" onClick={() => navigate('/users')}>👥 管理用户</button>
          <button className="quick-btn" onClick={() => navigate('/settings')}>⚙️ 系统设置</button>
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
