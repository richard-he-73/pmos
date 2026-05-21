import { useState, useEffect } from 'react';
import { Card, Typography, Spin, Empty, Select, Tabs } from 'antd';
import { GanttChart } from '../../components/charts/GanttChart';
import { BarChart } from '../../components/charts/BarChart';
import { getTaskGanttData } from '../../api/stats';
import { getTasks } from '../../api/tasks';
import type { GanttTask } from '../../api/stats';
import type { Task } from '../../types/models';
import { TASK_STATUS, PRIORITY } from '../../utils/constants';

const { Title } = Typography;

const GanttPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<{ _id: string; name: string }[]>([]);

  const fetchProjects = async () => {
    try {
      const { getProjects } = await import('../../api/projects');
      const res = await getProjects();
      if (Array.isArray(res)) {
        setProjects(res.map((p: any) => ({ _id: p._id, name: p.name })));
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchGanttData = async () => {
    setLoading(true);
    try {
      const res = await getTaskGanttData(projectId || undefined);
      setGanttTasks(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Failed to fetch Gantt data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await getTasks(projectId || undefined);
      setTasks(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchGanttData();
    fetchTasks();
  }, [projectId]);

  const taskStatusData = tasks.reduce(
    (acc: Record<string, number>, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const taskPriorityData = tasks.reduce(
    (acc: Record<string, number>, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    },
    {}
  );

  if (loading && !ganttTasks.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>项目甘特图</Title>
        <Select
          style={{ width: 250 }}
          placeholder="选择项目筛选"
          allowClear
          value={projectId || undefined}
          onChange={(val) => setProjectId(val || '')}
          options={projects.map((p) => ({ label: p.name, value: p._id }))}
        />
      </div>

      <Tabs
        defaultActiveKey="gantt"
        items={[
          {
            key: 'gantt',
            label: '时间轴视图',
            children: (
              <Card>
                {ganttTasks.length > 0 ? (
                  <GanttChart tasks={ganttTasks} height={500} />
                ) : (
                  <Empty description="暂无带时间的任务数据" />
                )}
              </Card>
            ),
          },
          {
            key: 'status',
            label: '状态分布',
            children: (
              <Card>
                {Object.keys(taskStatusData).length > 0 ? (
                  <BarChart
                    title="任务状态分布"
                    xAxis={Object.keys(taskStatusData).map((s) => TASK_STATUS[s as keyof typeof TASK_STATUS] || s)}
                    series={[{ name: '任务数', data: Object.values(taskStatusData) }]}
                    colors={['oklch(58% 0.16 145)', 'oklch(55% 0.14 250)', 'oklch(70% 0.12 80)', 'oklch(50% 0.05 250)', 'oklch(50% 0.02 250)']}
                  />
                ) : (
                  <Empty description="暂无任务数据" />
                )}
              </Card>
            ),
          },
          {
            key: 'priority',
            label: '优先级分布',
            children: (
              <Card>
                {Object.keys(taskPriorityData).length > 0 ? (
                  <BarChart
                    title="任务优先级分布"
                    xAxis={Object.keys(taskPriorityData).map((p) => PRIORITY[p as keyof typeof PRIORITY] || p)}
                    series={[{ name: '任务数', data: Object.values(taskPriorityData) }]}
                    colors={['oklch(50% 0.10 145)', 'oklch(55% 0.14 250)', 'oklch(70% 0.12 80)', 'oklch(50% 0.20 30)']}
                    horizontal
                  />
                ) : (
                  <Empty description="暂无任务数据" />
                )}
              </Card>
            ),
          },
        ]}
      />
    </>
  );
};

export default GanttPage;
