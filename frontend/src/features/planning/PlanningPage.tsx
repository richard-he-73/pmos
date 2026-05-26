import { useState, useEffect } from 'react';
import { Card, Typography, Spin, Empty, Select, Tabs, Progress, Tag, Button, Modal, Form, Input, DatePicker, message, Tooltip, Popconfirm, Upload, InputNumber } from 'antd';
import { CalendarOutlined, UserOutlined, BarsOutlined, RightOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { GanttChart } from '../../components/charts/GanttChart';
import { BarChart } from '../../components/charts/BarChart';
import { getTaskGanttData } from '../../api/stats';
import { getTasks } from '../../api/tasks';
import { getProjects } from '../../api/projects';
import { getResources } from '../../api/resources';
import { 
  getMilestones, getGroupPlans, getDetailTasks,
  createMilestone, updateMilestone, deleteMilestone,
  createGroupPlan, updateGroupPlan, deleteGroupPlan,
  createDetailTask, updateDetailTask, deleteDetailTask,
  type Milestone, type GroupPlan, type DetailTask
} from '../../api/plans';
import type { GanttTask } from '../../api/stats';
import type { Task, Project, Resource } from '../../types/models';
import { TASK_STATUS, PRIORITY } from '../../utils/constants';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const MILESTONE_STATUS_OPTIONS = [
  { label: '未开始', value: '未开始' },
  { label: '进行中', value: '进行中' },
  { label: '延迟', value: '延迟' },
  { label: '挂起', value: '挂起' },
  { label: '已结束', value: '已结束' },
];

const GROUP_STATUS_OPTIONS = [
  { label: '正常', value: '正常' },
  { label: '延期', value: '延期' },
  { label: '危急', value: '危急' },
];

const TASK_STATUS_OPTIONS = [
  { label: '待开始', value: 'todo' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'done' },
  { label: '已阻塞', value: 'blocked' },
];

const PRIORITY_OPTIONS = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'critical' },
];

// 辅助函数：根据用户ID获取显示名称
const getMemberDisplayName = (userId: string, teamMembers: Resource[]): string => {
  if (!userId) return '-';
  const member = teamMembers.find(m => m._id === userId);
  return member?.name || userId;
};

const PlanningPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<Resource[]>([]);
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [groupPlans, setGroupPlans] = useState<GroupPlan[]>([]);
  const [detailTasks, setDetailTasks] = useState<DetailTask[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [isEditingMilestone, setIsEditingMilestone] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [milestoneForm] = Form.useForm();

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<GroupPlan | null>(null);
  const [groupForm] = Form.useForm();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [currentTask, setCurrentTask] = useState<DetailTask | null>(null);
  const [taskForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState<string>('milestone');

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await getProjects();
        if (Array.isArray(res)) {
          const processedProjects = res.map(p => ({
            ...p,
            _id: p._id || p.id
          }));
          setProjects(processedProjects);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p._id === projectId);
      setSelectedProject(project || null);
    } else {
      setSelectedProject(null);
    }
  }, [projectId, projects]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData(selectedProject._id);
      // 获取团队成员
      getResources('human').then(resourcesRes => {
        if (Array.isArray(resourcesRes) && selectedProject?.team_members) {
          const members = resourcesRes.filter(r => 
            selectedProject.team_members.includes(r._id)
          );
          setTeamMembers(members);
        } else {
          setTeamMembers([]);
        }
      }).catch(err => {
        console.error('获取资源失败:', err);
        setTeamMembers([]);
      });
    }
  }, [selectedProject]);

  const loadProjectData = async (pid: string) => {
    setLoadingData(true);
    try {
      const [milestonesRes, groupPlansRes, detailTasksRes, ganttRes, tasksRes] = await Promise.all([
        getMilestones(pid),
        getGroupPlans(pid),
        getDetailTasks(pid),
        getTaskGanttData(pid),
        getTasks(pid)
      ]);
      
      if (Array.isArray(milestonesRes)) {
        const processedMilestones = milestonesRes.map(m => ({
          ...m,
          id: m.id || (m as any)._id
        }));
        setMilestones(processedMilestones);
      }
      if (Array.isArray(groupPlansRes)) {
        const processedGroups = groupPlansRes.map(g => ({
          ...g,
          id: g.id || (g as any)._id
        }));
        setGroupPlans(processedGroups);
      }
      if (Array.isArray(detailTasksRes)) {
        const processedTasks = detailTasksRes.map(t => ({
          ...t,
          id: t.id || (t as any)._id
        }));
        setDetailTasks(processedTasks);
      }
      if (Array.isArray(ganttRes)) setGanttTasks(ganttRes);
      if (Array.isArray(tasksRes)) setTasks(tasksRes);
    } catch (error) {
      console.error('Failed to load project data:', error);
      message.error('加载项目数据失败');
    } finally {
      setLoadingData(false);
      setLoading(false);
    }
  };

  const getMilestoneGanttData = (): any => {
    const today = dayjs();
    return milestones.map(m => {
      let start = dayjs(m.plan_start_date);
      let end = dayjs(m.plan_end_date);
      
      if (!start.isValid()) {
        start = today;
      }
      if (!end.isValid() || end.isBefore(start)) {
        end = start.add(30, 'day');
      }
      
      return {
        id: m.id,
        name: m.name,
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
        progress: m.progress || 0,
      };
    });
  };

  const getGroupGanttData = (): any => {
    const today = dayjs();
    return groupPlans.map(g => {
      let start = dayjs(g.plan_start_date);
      let end = dayjs(g.plan_end_date);
      
      if (!start.isValid()) {
        start = today;
      }
      if (!end.isValid() || end.isBefore(start)) {
        end = start.add(30, 'day');
      }
      
      return {
        id: g.id,
        name: g.name,
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
        progress: g.progress || 0,
      };
    });
  };

  const getDetailTaskGanttData = (): any => {
    const today = dayjs();
    return detailTasks.map(t => {
      let start = dayjs(t.plan_start_date);
      let end = dayjs(t.plan_end_date);
      
      if (!start.isValid()) {
        start = today;
      }
      if (!end.isValid() || end.isBefore(start)) {
        end = start.add(30, 'day');
      }
      
      return {
        id: t.id,
        name: t.name,
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
        progress: t.progress || 0,
      };
    });
  };

  const handleDownloadTemplate = (type: 'milestone' | 'group' | 'detail') => {
    const templates = {
      milestone: {
        name: '里程碑名称',
        description: '描述',
        acceptance_criteria: '验收标准',
        owner: '负责人',
        current_status: '当前状态',
        plan_start_date: '计划开始日期',
        plan_end_date: '计划结束日期',
        actual_start_date: '实际开始日期',
        actual_end_date: '实际结束日期',
      },
      group: {
        name: '小组计划名称',
        description: '描述',
        acceptance_criteria: '验收标准',
        owner: '负责人',
        current_status: '当前状态',
        plan_start_date: '计划开始日期',
        plan_end_date: '计划结束日期',
        actual_start_date: '实际开始日期',
        actual_end_date: '实际结束日期',
      },
      detail: {
        name: '任务名称',
        description: '描述',
        acceptance_criteria: '验收标准',
        owner: '负责人',
        current_status: '当前状态',
        plan_start_date: '计划开始日期',
        plan_end_date: '计划结束日期',
        actual_start_date: '实际开始日期',
        actual_end_date: '实际结束日期',
      },
    };

    const headers = Object.keys(templates[type]).join(',');
    const values = Object.values(templates[type]).join(',');
    const csvContent = headers + '\n' + values;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_template.csv`;
    link.click();
    message.success(`已下载 ${type === 'milestone' ? '里程碑' : type === 'group' ? '小组计划' : '详细任务'} 模板`);
  };

  const handleImportData = async (file: File, type: 'milestone' | 'group' | 'detail') => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          message.error('CSV 文件格式错误');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const data: any = { project_id: selectedProject!._id };
          
          headers.forEach((header, index) => {
            if (values[index]) {
              if (['progress'].includes(header)) {
                data[header] = parseFloat(values[index]) || 0;
              } else {
                data[header] = values[index];
              }
            }
          });

          if (type === 'milestone') {
            data.status = 'pending';
            await createMilestone(data);
          } else if (type === 'group') {
            data.status = 'pending';
            await createGroupPlan(data);
          } else {
            data.status = 'pending';
            await createDetailTask(data);
          }
        }

        message.success('导入成功');
        loadProjectData(selectedProject!._id);
      } catch (error) {
        console.error('导入失败:', error);
        message.error('导入失败');
      }
    };
    reader.readAsText(file);
  };

  const openMilestoneModal = (milestone?: Milestone) => {
    if (milestone) {
      setIsEditingMilestone(true);
      setCurrentMilestone(milestone);
      milestoneForm.setFieldsValue({
        name: milestone.name,
        description: milestone.description,
        acceptance_criteria: milestone.acceptance_criteria,
        owner: milestone.owner,
        current_status: milestone.current_status,
        plan_start_date: milestone.plan_start_date ? dayjs(milestone.plan_start_date) : null,
        actual_start_date: milestone.actual_start_date ? dayjs(milestone.actual_start_date) : null,
        plan_end_date: milestone.plan_end_date ? dayjs(milestone.plan_end_date) : null,
        actual_end_date: milestone.actual_end_date ? dayjs(milestone.actual_end_date) : null,
      });
    } else {
      setIsEditingMilestone(false);
      setCurrentMilestone(null);
      milestoneForm.resetFields();
    }
    setMilestoneModalOpen(true);
  };

  const handleMilestoneSubmit = async () => {
    try {
      const values = await milestoneForm.validateFields();
      const updateData: any = {
        name: values.name,
        description: values.description,
        acceptance_criteria: values.acceptance_criteria,
        owner: values.owner,
        current_status: values.current_status,
        plan_start_date: values.plan_start_date.format('YYYY-MM-DD'),
        plan_end_date: values.plan_end_date.format('YYYY-MM-DD'),
      };
      
      if (values.actual_start_date) {
        updateData.actual_start_date = values.actual_start_date.format('YYYY-MM-DD');
      }
      if (values.actual_end_date) {
        updateData.actual_end_date = values.actual_end_date.format('YYYY-MM-DD');
      }

      if (isEditingMilestone && currentMilestone) {
        await updateMilestone(currentMilestone.id, updateData);
        message.success('里程碑更新成功');
      } else {
        const createData = {
          ...updateData,
          project_id: selectedProject!._id,
          status: 'pending',
          progress: 0
        };
        await createMilestone(createData);
        message.success('里程碑创建成功');
      }
      
      setMilestoneModalOpen(false);
      loadProjectData(selectedProject!._id);
    } catch (error: any) {
      if (error.errorFields) return;
      message.error('操作失败');
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      await deleteMilestone(id);
      message.success('里程碑已删除');
      loadProjectData(selectedProject!._id);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const openGroupModal = (group?: GroupPlan) => {
    if (group) {
      setIsEditingGroup(true);
      setCurrentGroup(group);
      groupForm.setFieldsValue({
        milestone_id: group.milestone_id,
        name: group.name,
        description: group.description,
        acceptance_criteria: group.acceptance_criteria,
        owner: group.owner,
        current_status: group.current_status,
        plan_start_date: group.plan_start_date ? dayjs(group.plan_start_date) : null,
        actual_start_date: group.actual_start_date ? dayjs(group.actual_start_date) : null,
        plan_end_date: group.plan_end_date ? dayjs(group.plan_end_date) : null,
        actual_end_date: group.actual_end_date ? dayjs(group.actual_end_date) : null,
      });
    } else {
      setIsEditingGroup(false);
      setCurrentGroup(null);
      groupForm.resetFields();
    }
    setGroupModalOpen(true);
  };

  const handleGroupSubmit = async () => {
    try {
      const values = await groupForm.validateFields();
      const updateData: any = {
        milestone_id: values.milestone_id,
        name: values.name,
        description: values.description,
        acceptance_criteria: values.acceptance_criteria,
        owner: values.owner,
        current_status: values.current_status,
        plan_start_date: values.plan_start_date.format('YYYY-MM-DD'),
        plan_end_date: values.plan_end_date.format('YYYY-MM-DD'),
      };
      
      if (values.actual_start_date) {
        updateData.actual_start_date = values.actual_start_date.format('YYYY-MM-DD');
      }
      if (values.actual_end_date) {
        updateData.actual_end_date = values.actual_end_date.format('YYYY-MM-DD');
      }

      if (isEditingGroup && currentGroup) {
        await updateGroupPlan(currentGroup.id, updateData);
        message.success('小组计划更新成功');
      } else {
        const createData = {
          ...updateData,
          project_id: selectedProject!._id,
          status: 'pending',
          progress: 0
        };
        await createGroupPlan(createData);
        message.success('小组计划创建成功');
      }
      
      setGroupModalOpen(false);
      loadProjectData(selectedProject!._id);
    } catch (error: any) {
      if (error.errorFields) return;
      message.error('操作失败');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroupPlan(id);
      message.success('小组计划已删除');
      loadProjectData(selectedProject!._id);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const openTaskModal = (task?: DetailTask) => {
    if (task) {
      setIsEditingTask(true);
      setCurrentTask(task);
      taskForm.setFieldsValue({
        group_id: task.group_id,
        name: task.name,
        description: task.description,
        acceptance_criteria: task.acceptance_criteria,
        owner: task.owner,
        current_status: task.current_status,
        plan_start_date: task.plan_start_date ? dayjs(task.plan_start_date) : null,
        actual_start_date: task.actual_start_date ? dayjs(task.actual_start_date) : null,
        plan_end_date: task.plan_end_date ? dayjs(task.plan_end_date) : null,
        actual_end_date: task.actual_end_date ? dayjs(task.actual_end_date) : null,
      });
    } else {
      setIsEditingTask(false);
      setCurrentTask(null);
      taskForm.resetFields();
    }
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = async () => {
    try {
      const values = await taskForm.validateFields();
      
      const groupId = values.group_id;
      const group = groupPlans.find(g => g.id === groupId);
      
      const updateData: any = {
        group_id: groupId,
        milestone_id: group?.milestone_id || '',
        name: values.name,
        description: values.description,
        acceptance_criteria: values.acceptance_criteria,
        owner: values.owner,
        current_status: values.current_status,
        plan_start_date: values.plan_start_date.format('YYYY-MM-DD'),
        plan_end_date: values.plan_end_date.format('YYYY-MM-DD'),
      };
      
      if (values.actual_start_date) {
        updateData.actual_start_date = values.actual_start_date.format('YYYY-MM-DD');
      }
      if (values.actual_end_date) {
        updateData.actual_end_date = values.actual_end_date.format('YYYY-MM-DD');
      }

      if (isEditingTask && currentTask) {
        await updateDetailTask(currentTask.id, updateData);
        message.success('详细任务更新成功');
      } else {
        const createData = {
          ...updateData,
          project_id: selectedProject!._id,
          status: 'pending',
          progress: 0
        };
        await createDetailTask(createData);
        message.success('详细任务创建成功');
      }
      
      setTaskModalOpen(false);
      loadProjectData(selectedProject!._id);
    } catch (error: any) {
      if (error.errorFields) return;
      message.error('操作失败');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDetailTask(id);
      message.success('详细任务已删除');
      loadProjectData(selectedProject!._id);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: 'oklch(40% 0.14 145)' }} />;
      case 'in_progress':
        return <ClockCircleOutlined style={{ color: 'oklch(50% 0.12 40)' }} />;
      default:
        return <InfoCircleOutlined style={{ color: 'oklch(60% 0.14 240)' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'oklch(40% 0.14 145)';
      case 'in_progress':
        return 'oklch(50% 0.12 40)';
      default:
        return 'oklch(60% 0.14 240)';
    }
  };

  const milestoneStats = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'completed').length,
    in_progress: milestones.filter(m => m.status === 'in_progress').length,
    pending: milestones.filter(m => m.status === 'pending').length,
  };

  const groupStats = {
    total: groupPlans.length,
    completed: groupPlans.filter(g => g.status === 'completed').length,
    in_progress: groupPlans.filter(g => g.status === 'in_progress').length,
    pending: groupPlans.filter(g => g.status === 'pending').length,
  };

  const taskStats = {
    total: detailTasks.length,
    completed: detailTasks.filter(t => t.status === 'completed').length,
    in_progress: detailTasks.filter(t => t.status === 'in_progress').length,
    pending: detailTasks.filter(t => t.status === 'pending').length,
  };

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

  if (!selectedProject) {
    return (
      <div className="planning-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Title level={4} style={{ marginBottom: 24 }}>计划管理</Title>
        <Card style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
          <div style={{ marginBottom: 16, fontSize: 16 }}>请先选择要查看的项目</div>
          <Select
            style={{ width: '100%', maxWidth: 400 }}
            placeholder="请选择项目"
            value={projectId || undefined}
            onChange={(val) => setProjectId(val || '')}
            options={projects.map((p) => ({ label: p.name, value: p._id }))}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="planning-page">
      {/* 固定的顶部区域 - 包括项目信息和 Tabs 标签，在 header 下方 */}
      <div style={{ 
        position: 'fixed',
        top: 80,
        left: 284,
        right: 24,
        zIndex: 100,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        {/* 项目信息卡片 */}
        <Card style={{ 
          borderLeft: '4px solid var(--color-accent)',
          marginBottom: 0,
          boxShadow: 'none',
          borderRadius: 0
        }}
        bodyStyle={{ padding: '8px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                {selectedProject.name}
              </Title>
              <Text type="secondary">计划管理</Text>
            </div>
            <Select
              style={{ width: 250 }}
              placeholder="切换项目"
              value={projectId || undefined}
              onChange={(val) => setProjectId(val || '')}
              options={projects.map((p) => ({ label: p.name, value: p._id }))}
            />
          </div>
        </Card>

        {/* Tabs 标签栏 - 只做导航用，不渲染内容 */}
        <div style={{ padding: '0 16px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'milestone',
                label: '项目里程碑计划',
              },
              {
                key: 'group',
                label: '小组计划',
              },
              {
                key: 'detail',
                label: '详细计划',
              },
              {
                key: 'analytics',
                label: '计划统计',
              },
            ]}
          />
        </div>
      </div>

      {/* 下面的内容区域，给固定顶部腾出空间 */}
      <div style={{ paddingTop: 180 }}>
        
        {/* ============ 项目里程碑计划内容 ============ */}
        {activeTab === 'milestone' && (
          <div>
            {/* 固定在下方的统计和甘特图区域 */}
            <div style={{ 
              position: 'sticky',
              top: 130,
              zIndex: 50,
              background: '#fff',
              paddingBottom: 16,
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>总里程碑数</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{milestoneStats.total}</div>
                </Card>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>已完成</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(40% 0.14 145)' }}>{milestoneStats.completed}</div>
                </Card>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>进行中</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(50% 0.12 40)' }}>{milestoneStats.in_progress}</div>
                </Card>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>未开始</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(60% 0.14 240)' }}>{milestoneStats.pending}</div>
                </Card>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <Tooltip title="下载模板">
                    <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('milestone')} style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}>下载模板</Button>
                  </Tooltip>
                  <Upload showUploadList={false} beforeUpload={(file) => { handleImportData(file, 'milestone'); return false; }}>
                    <Tooltip title="导入数据">
                      <Button icon={<UploadOutlined />} style={{ marginLeft: 8, backgroundColor: '#13c2c2', borderColor: '#13c2c2', color: 'white' }}>导入</Button>
                    </Tooltip>
                  </Upload>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openMilestoneModal()}>添加里程碑</Button>
              </div>

              {loadingData ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
              ) : milestones.length === 0 ? (
                <Empty description="暂无里程碑" />
              ) : (
                <Card style={{ marginBottom: 0 }}>
                  <GanttChart 
                    key={`milestone-gantt`} 
                    tasks={getMilestoneGanttData()} 
                    height={300}
                    minDate={selectedProject?.start_date}
                    maxDate={selectedProject?.end_date}
                  />
                </Card>
              )}
            </div>

            {/* 详细列表区域 - 页面整体滚动时会跟随滚动 */}
            {!loadingData && milestones.length > 0 && (
              <div style={{ paddingTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} style={{ display: 'flex', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                        <div 
                          style={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%', 
                            backgroundColor: getStatusColor(milestone.status),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getStatusIcon(milestone.status)}
                        </div>
                        {index < milestones.length - 1 && (
                          <div style={{ width: 2, flex: 1, backgroundColor: 'var(--color-border)', marginTop: 8 }} />
                        )}
                      </div>
                      <Card style={{ flex: 1 }} hoverable>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>{milestone.name}</div>
                          <div>
                            <Tooltip title="编辑">
                              <Button type="text" icon={<EditOutlined />} onClick={() => openMilestoneModal(milestone)} />
                            </Tooltip>
                            <Tooltip title="删除">
                              <Popconfirm title="确定删除此里程碑？" onConfirm={() => handleDeleteMilestone(milestone.id)}>
                                <Button type="text" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Tooltip>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 8 }}>
                          <span>负责人：{getMemberDisplayName(milestone.owner, teamMembers)}</span>
                          {milestone.current_status && <span style={{ marginLeft: 16 }}>当前状态：{milestone.current_status}</span>}
                        </div>
                        {milestone.description && <div style={{ marginBottom: 8 }}>{milestone.description}</div>}
                        {milestone.acceptance_criteria && (
                          <div style={{ marginBottom: 8, padding: 8, backgroundColor: 'rgba(24, 144, 255, 0.05)', borderRadius: 4 }}>
                            <span style={{ fontWeight: 500, color: 'var(--color-accent)' }}>验收标准：</span>
                            {milestone.acceptance_criteria}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 24, marginBottom: 8, fontSize: 13 }}>
                          <div>计划开始：{dayjs(milestone.plan_start_date).format('YYYY-MM-DD')}</div>
                          <div>计划结束：{dayjs(milestone.plan_end_date).format('YYYY-MM-DD')}</div>
                          {milestone.actual_start_date && <div>实际开始：{dayjs(milestone.actual_start_date).format('YYYY-MM-DD')}</div>}
                          {milestone.actual_end_date && <div>实际结束：{dayjs(milestone.actual_end_date).format('YYYY-MM-DD')}</div>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Progress percent={milestone.progress} strokeColor={getStatusColor(milestone.status)} showInfo={false} style={{ flex: 1 }} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{milestone.progress}%</span>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ 小组计划内容 ============ */}
        {activeTab === 'group' && (
          <div>
            {/* 固定在下方的统计和甘特图区域 */}
            <div style={{ 
              position: 'sticky',
              top: 150,
              zIndex: 50,
              background: '#fff',
              paddingBottom: 16,
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>总计划数</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{groupStats.total}</div>
                </Card>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>已完成</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(40% 0.14 145)' }}>{groupStats.completed}</div>
                </Card>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>进行中</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(50% 0.12 40)' }}>{groupStats.in_progress}</div>
                </Card>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>未开始</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(60% 0.14 240)' }}>{groupStats.pending}</div>
                </Card>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <Tooltip title="下载模板">
                    <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('group')} style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}>下载模板</Button>
                  </Tooltip>
                  <Upload showUploadList={false} beforeUpload={(file) => { handleImportData(file, 'group'); return false; }}>
                    <Tooltip title="导入数据">
                      <Button icon={<UploadOutlined />} style={{ marginLeft: 8, backgroundColor: '#13c2c2', borderColor: '#13c2c2', color: 'white' }}>导入</Button>
                    </Tooltip>
                  </Upload>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openGroupModal()}>添加小组计划</Button>
              </div>

              {loadingData ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
              ) : groupPlans.length === 0 ? (
                <Empty description="暂无小组计划" />
              ) : (
                <Card style={{ marginBottom: 0 }}>
                  <GanttChart 
                    key={`group-gantt`} 
                    tasks={getGroupGanttData()} 
                    height={300}
                    minDate={selectedProject?.start_date}
                    maxDate={selectedProject?.end_date}
                  />
                </Card>
              )}
            </div>

            {/* 详细列表区域 */}
            {!loadingData && groupPlans.length > 0 && (
              <div style={{ paddingTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {groupPlans.map((group) => {
                    const milestone = milestones.find(m => m.id === group.milestone_id);
                    return (
                      <div key={group.id} style={{ display: 'flex', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: getStatusColor(group.status), flexShrink: 0 }} />
                          <div style={{ width: 2, flex: 1, background: 'var(--color-border)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Card style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <Title level={4} style={{ margin: 0 }}>{group.name}</Title>
                                  {getStatusIcon(group.status)}
                                </div>
                                {milestone && (
                                  <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: 'rgba(82, 196, 26, 0.1)', borderRadius: 4, display: 'inline-block' }}>
                                    <span style={{ fontSize: 12, color: 'oklch(40% 0.14 145)', fontWeight: 500 }}>
                                      隶属里程碑：{milestone.name}
                                    </span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                  <Text type="secondary">负责人: {getMemberDisplayName(group.owner, teamMembers)}</Text>
                                  <Text type="secondary">计划: {dayjs(group.plan_start_date).format('YYYY-MM-DD')} ~ {dayjs(group.plan_end_date).format('YYYY-MM-DD')}</Text>
                                  {group.actual_start_date && (
                                    <Text type="secondary">实际开始: {dayjs(group.actual_start_date).format('YYYY-MM-DD')}</Text>
                                  )}
                                  {group.actual_end_date && (
                                    <Text type="secondary">实际结束: {dayjs(group.actual_end_date).format('YYYY-MM-DD')}</Text>
                                  )}
                                  <Text type="secondary">状态: {group.current_status}</Text>
                                </div>
                                {group.description && (
                                  <Text style={{ display: 'block', marginBottom: 8 }}>{group.description}</Text>
                                )}
                                {group.acceptance_criteria && (
                                  <div style={{ marginBottom: 8, padding: 8, backgroundColor: 'rgba(24, 144, 255, 0.05)', borderRadius: 4 }}>
                                    <span style={{ fontWeight: 500, color: 'var(--color-accent)' }}>验收标准：</span>
                                    {group.acceptance_criteria}
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: 24, marginBottom: 8, fontSize: 13 }}>
                                  <div>计划开始：{dayjs(group.plan_start_date).format('YYYY-MM-DD')}</div>
                                  <div>计划结束：{dayjs(group.plan_end_date).format('YYYY-MM-DD')}</div>
                                  {group.actual_start_date && <div>实际开始：{dayjs(group.actual_start_date).format('YYYY-MM-DD')}</div>}
                                  {group.actual_end_date && <div>实际结束：{dayjs(group.actual_end_date).format('YYYY-MM-DD')}</div>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <Progress percent={group.progress} strokeColor={getStatusColor(group.status)} showInfo={false} style={{ flex: 1 }} />
                                  <span style={{ fontSize: 14, fontWeight: 600 }}>{group.progress}%</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                                <Tooltip title="编辑">
                                  <Button type="text" icon={<EditOutlined />} onClick={() => openGroupModal(group)} />
                                </Tooltip>
                                <Tooltip title="删除">
                                  <Popconfirm title="确定删除此小组计划吗？" onConfirm={() => handleDeleteGroup(group.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                  </Popconfirm>
                                </Tooltip>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ 详细计划内容 ============ */}
        {activeTab === 'detail' && (
          <div>
            {/* 固定在下方的统计和甘特图区域 */}
            <div style={{ 
              position: 'sticky',
              top: 150,
              zIndex: 50,
              background: '#fff',
              paddingBottom: 16,
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>总任务数</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{taskStats.total}</div>
                </Card>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>已完成</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(40% 0.14 145)' }}>{taskStats.completed}</div>
                </Card>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>进行中</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(50% 0.12 40)' }}>{taskStats.in_progress}</div>
                </Card>
                <Card>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>未开始</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(60% 0.14 240)' }}>{taskStats.pending}</div>
                </Card>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <Tooltip title="下载模板">
                    <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('detail')} style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}>下载模板</Button>
                  </Tooltip>
                  <Upload showUploadList={false} beforeUpload={(file) => { handleImportData(file, 'detail'); return false; }}>
                    <Tooltip title="导入数据">
                      <Button color="cyan" icon={<UploadOutlined />} style={{ marginLeft: 8 }}>导入</Button>
                    </Tooltip>
                  </Upload>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openTaskModal()}>添加任务</Button>
              </div>

              {loadingData ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
              ) : detailTasks.length === 0 ? (
                <Empty description="暂无详细任务" />
              ) : (
                <Card style={{ marginBottom: 0 }}>
                  <GanttChart 
                    key={`detail-gantt`} 
                    tasks={getDetailTaskGanttData()} 
                    height={300}
                    minDate={selectedProject?.start_date}
                    maxDate={selectedProject?.end_date}
                  />
                </Card>
              )}
            </div>

            {/* 详细列表区域 */}
            {!loadingData && detailTasks.length > 0 && (
              <div style={{ paddingTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {detailTasks.map((task) => {
                    const group = groupPlans.find(g => g.id === task.group_id);
                    const milestone = milestones.find(m => m.id === task.milestone_id);
                    return (
                      <div key={task.id} style={{ display: 'flex', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: getStatusColor(task.status), flexShrink: 0 }} />
                          <div style={{ width: 2, flex: 1, background: 'var(--color-border)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Card style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <Title level={4} style={{ margin: 0 }}>{task.name}</Title>
                                  {getStatusIcon(task.status)}
                                </div>
                                <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
                                  {group && (
                                    <div style={{ padding: '4px 8px', backgroundColor: 'rgba(82, 196, 26, 0.1)', borderRadius: 4 }}>
                                      <span style={{ fontSize: 12, color: 'oklch(40% 0.14 145)', fontWeight: 500 }}>
                                        隶属小组计划：{group.name}
                                      </span>
                                    </div>
                                  )}
                                  {milestone && (
                                    <div style={{ padding: '4px 8px', backgroundColor: 'rgba(24, 144, 255, 0.1)', borderRadius: 4 }}>
                                      <span style={{ fontSize: 12, color: 'oklch(50% 0.14 240)', fontWeight: 500 }}>
                                        隶属里程碑：{milestone.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                  <Text type="secondary">负责人: {getMemberDisplayName(task.owner, teamMembers)}</Text>
                                  <Text type="secondary">计划: {dayjs(task.plan_start_date).format('YYYY-MM-DD')} ~ {dayjs(task.plan_end_date).format('YYYY-MM-DD')}</Text>
                                  {task.actual_start_date && (
                                    <Text type="secondary">实际开始: {dayjs(task.actual_start_date).format('YYYY-MM-DD')}</Text>
                                  )}
                                  {task.actual_end_date && (
                                    <Text type="secondary">实际结束: {dayjs(task.actual_end_date).format('YYYY-MM-DD')}</Text>
                                  )}
                                  <Text type="secondary">状态: {task.current_status}</Text>
                                </div>
                                {task.description && (
                                  <Text style={{ display: 'block', marginBottom: 8 }}>{task.description}</Text>
                                )}
                                {task.acceptance_criteria && (
                                  <div style={{ marginBottom: 8, padding: 8, backgroundColor: 'rgba(24, 144, 255, 0.05)', borderRadius: 4 }}>
                                    <span style={{ fontWeight: 500, color: 'var(--color-accent)' }}>验收标准：</span>
                                    {task.acceptance_criteria}
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: 24, marginBottom: 8, fontSize: 13 }}>
                                  <div>计划开始：{dayjs(task.plan_start_date).format('YYYY-MM-DD')}</div>
                                  <div>计划结束：{dayjs(task.plan_end_date).format('YYYY-MM-DD')}</div>
                                  {task.actual_start_date && <div>实际开始：{dayjs(task.actual_start_date).format('YYYY-MM-DD')}</div>}
                                  {task.actual_end_date && <div>实际结束：{dayjs(task.actual_end_date).format('YYYY-MM-DD')}</div>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <Progress percent={task.progress} strokeColor={getStatusColor(task.status)} showInfo={false} style={{ flex: 1 }} />
                                  <span style={{ fontSize: 14, fontWeight: 600 }}>{task.progress}%</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                                <Tooltip title="编辑">
                                  <Button type="text" icon={<EditOutlined />} onClick={() => openTaskModal(task)} />
                                </Tooltip>
                                <Tooltip title="删除">
                                  <Popconfirm title="确定删除此任务吗？" onConfirm={() => handleDeleteTask(task.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                  </Popconfirm>
                                </Tooltip>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ 计划统计内容 ============ */}
        {activeTab === 'analytics' && (
          <div style={{ padding: '0 16px 16px' }}>
            <Tabs
              defaultActiveKey="status"
              items={[
                {
                  key: 'status',
                  label: '状态分布',
                  children: (
                    <Card>
                      {loadingData ? (
                        <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
                      ) : Object.keys(taskStatusData).length > 0 ? (
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
                      {loadingData ? (
                        <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
                      ) : Object.keys(taskPriorityData).length > 0 ? (
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
          </div>
        )}
      </div>

      <Modal title={isEditingMilestone ? '编辑里程碑' : '添加里程碑'} open={milestoneModalOpen} onOk={handleMilestoneSubmit} onCancel={() => setMilestoneModalOpen(false)} okText={isEditingMilestone ? '保存' : '创建'} width={600}>
        {selectedProject && (
          <div style={{ marginBottom: 16, padding: '8px 12px', backgroundColor: 'rgba(24, 144, 255, 0.05)', borderRadius: 4, border: '1px solid var(--color-accent)' }}>
            <span style={{ fontSize: 12, color: 'var(--color-accent)' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              项目时间范围：{dayjs(selectedProject.start_date).format('YYYY-MM-DD')} ~ {selectedProject.end_date ? dayjs(selectedProject.end_date).format('YYYY-MM-DD') : '未设置'}
            </span>
          </div>
        )}
        <Form form={milestoneForm} layout="vertical">
          <Form.Item name="name" label="里程碑名称" rules={[{ required: true, message: '请输入里程碑名称' }]}>
            <Input placeholder="请输入里程碑名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入里程碑描述" rows={2} />
          </Form.Item>
          <Form.Item name="acceptance_criteria" label="验收标准" rules={[{ required: true, message: '请输入验收标准' }]}>
            <Input.TextArea placeholder="请输入验收标准" rows={2} />
          </Form.Item>
          <Form.Item name="owner" label="负责人" rules={[{ required: true, message: '请选择负责人' }]}>
            <Select 
              placeholder="请选择负责人" 
              showSearch
              optionFilterProp="children"
              options={teamMembers.map(member => ({ 
                label: member.name,
                value: member._id 
              }))}
            />
          </Form.Item>
          <Form.Item name="current_status" label="当前状态" rules={[{ required: true, message: '请选择当前状态' }]}>
            <Select placeholder="请选择当前状态" options={MILESTONE_STATUS_OPTIONS} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item 
              name="plan_start_date" 
              label="计划开始日期" 
              rules={[
                { required: true, message: '请选择计划开始日期' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('plan_end_date')) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue('plan_end_date'))) {
                      return Promise.reject(new Error('计划开始日期必须早于计划结束日期'));
                    }
                    if (selectedProject && value.isBefore(dayjs(selectedProject.start_date))) {
                      return Promise.reject(new Error(`计划开始日期不能早于项目开始日期 (${dayjs(selectedProject.start_date).format('YYYY-MM-DD')})`));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item 
              name="actual_start_date" 
              label="实际开始日期"
              dependencies={['actual_end_date']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('actual_end_date')) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue('actual_end_date'))) {
                      return Promise.reject(new Error('实际开始日期必须早于实际结束日期'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item 
              name="plan_end_date" 
              label="计划结束日期" 
              dependencies={['plan_start_date']}
              rules={[
                { required: true, message: '请选择计划结束日期' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('plan_start_date')) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue('plan_start_date'))) {
                      return Promise.reject(new Error('计划结束日期必须晚于计划开始日期'));
                    }
                    if (selectedProject && selectedProject.end_date && value.isAfter(dayjs(selectedProject.end_date))) {
                      return Promise.reject(new Error(`计划结束日期不能晚于项目结束日期 (${dayjs(selectedProject.end_date).format('YYYY-MM-DD')})`));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item 
              name="actual_end_date" 
              label="实际结束日期"
              dependencies={['actual_start_date']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('actual_start_date')) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue('actual_start_date'))) {
                      return Promise.reject(new Error('实际结束日期必须晚于实际开始日期'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal title={isEditingGroup ? '编辑小组计划' : '添加小组计划'} open={groupModalOpen} onOk={handleGroupSubmit} onCancel={() => setGroupModalOpen(false)} okText={isEditingGroup ? '保存' : '创建'} width={600}>
        {milestones.length > 0 && (
          <div style={{ marginBottom: 16, padding: '8px 12px', backgroundColor: 'rgba(24, 144, 255, 0.05)', borderRadius: 4, border: '1px solid var(--color-accent)' }}>
            <span style={{ fontSize: 12, color: 'var(--color-accent)' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              请选择此小组计划隶属的里程碑
            </span>
          </div>
        )}
        <Form form={groupForm} layout="vertical">
          <Form.Item name="milestone_id" label="隶属里程碑" rules={[{ required: true, message: '请选择隶属的里程碑' }]}>
            <Select 
              placeholder="请选择隶属的里程碑" 
              options={milestones.map(m => ({ 
                label: `${m.name} (${dayjs(m.plan_start_date).format('YYYY-MM-DD')} ~ ${dayjs(m.plan_end_date).format('YYYY-MM-DD')})`, 
                value: m.id 
              }))}
              onChange={() => groupForm.setFieldValue('plan_start_date', null)}
            />
          </Form.Item>
          <Form.Item name="name" label="小组计划名称" rules={[{ required: true, message: '请输入小组计划名称' }]}>
            <Input placeholder="请输入小组计划名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入描述" rows={2} />
          </Form.Item>
          <Form.Item name="acceptance_criteria" label="验收标准" rules={[{ required: true, message: '请输入验收标准' }]}>
            <Input.TextArea placeholder="请输入验收标准" rows={2} />
          </Form.Item>
          <Form.Item name="owner" label="负责人" rules={[{ required: true, message: '请选择负责人' }]}>
            <Select 
              placeholder="请选择负责人" 
              showSearch
              optionFilterProp="children"
              options={teamMembers.map(member => ({ 
                label: member.name,
                value: member._id 
              }))}
            />
          </Form.Item>
          <Form.Item name="current_status" label="当前状态" rules={[{ required: true, message: '请选择当前状态' }]}>
            <Select placeholder="请选择当前状态" options={MILESTONE_STATUS_OPTIONS} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item 
              name="plan_start_date" 
              label="计划开始日期" 
              rules={[
                { required: true, message: '请选择计划开始日期' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('plan_end_date')) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue('plan_end_date'))) {
                      return Promise.reject(new Error('计划开始日期必须早于计划结束日期'));
                    }
                    const milestoneId = getFieldValue('milestone_id');
                    if (milestoneId) {
                      const milestone = milestones.find(m => m.id === milestoneId);
                      if (milestone && value.isBefore(dayjs(milestone.plan_start_date))) {
                        return Promise.reject(new Error(`计划开始日期不能早于隶属里程碑的开始日期 (${dayjs(milestone.plan_start_date).format('YYYY-MM-DD')})`));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item 
              name="actual_start_date" 
              label="实际开始日期"
              dependencies={['actual_end_date']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('actual_end_date')) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue('actual_end_date'))) {
                      return Promise.reject(new Error('实际开始日期必须早于实际结束日期'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item 
              name="plan_end_date" 
              label="计划结束日期" 
              dependencies={['plan_start_date']}
              rules={[
                { required: true, message: '请选择计划结束日期' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('plan_start_date')) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue('plan_start_date'))) {
                      return Promise.reject(new Error('计划结束日期必须晚于计划开始日期'));
                    }
                    const milestoneId = getFieldValue('milestone_id');
                    if (milestoneId) {
                      const milestone = milestones.find(m => m.id === milestoneId);
                      if (milestone && value.isAfter(dayjs(milestone.plan_end_date))) {
                        return Promise.reject(new Error(`计划结束日期不能晚于隶属里程碑的结束日期 (${dayjs(milestone.plan_end_date).format('YYYY-MM-DD')})`));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item 
              name="actual_end_date" 
              label="实际结束日期"
              dependencies={['actual_start_date']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('actual_start_date')) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue('actual_start_date'))) {
                      return Promise.reject(new Error('实际结束日期必须晚于实际开始日期'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal title={isEditingTask ? '编辑详细任务' : '添加详细任务'} open={taskModalOpen} onOk={handleTaskSubmit} onCancel={() => setTaskModalOpen(false)} okText={isEditingTask ? '保存' : '创建'} width={600}>
        {groupPlans.length > 0 && (
          <div style={{ marginBottom: 16, padding: '8px 12px', backgroundColor: 'rgba(24, 144, 255, 0.05)', borderRadius: 4, border: '1px solid var(--color-accent)' }}>
            <span style={{ fontSize: 12, color: 'var(--color-accent)' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              请选择此任务隶属的小组计划
            </span>
          </div>
        )}
        <Form form={taskForm} layout="vertical">
          <Form.Item name="group_id" label="隶属小组计划" rules={[{ required: true, message: '请选择隶属的小组计划' }]}>
            <Select 
              placeholder="请选择隶属的小组计划" 
              options={groupPlans.map(g => ({ 
                label: `${g.name} (${dayjs(g.plan_start_date).format('YYYY-MM-DD')} ~ ${dayjs(g.plan_end_date).format('YYYY-MM-DD')})`, 
                value: g.id 
              }))}
              onChange={() => taskForm.setFieldValue('plan_start_date', null)}
            />
          </Form.Item>
          <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入描述" rows={2} />
          </Form.Item>
          <Form.Item name="acceptance_criteria" label="验收标准" rules={[{ required: true, message: '请输入验收标准' }]}>
            <Input.TextArea placeholder="请输入验收标准" rows={2} />
          </Form.Item>
          <Form.Item name="owner" label="负责人" rules={[{ required: true, message: '请选择负责人' }]}>
            <Select 
              placeholder="请选择负责人" 
              showSearch
              optionFilterProp="children"
              options={teamMembers.map(member => ({ 
                label: member.name,
                value: member._id 
              }))}
            />
          </Form.Item>
          <Form.Item name="current_status" label="当前状态" rules={[{ required: true, message: '请选择当前状态' }]}>
            <Select placeholder="请选择当前状态" options={MILESTONE_STATUS_OPTIONS} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item 
              name="plan_start_date" 
              label="计划开始日期" 
              rules={[
                { required: true, message: '请选择计划开始日期' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('plan_end_date')) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue('plan_end_date'))) {
                      return Promise.reject(new Error('计划开始日期必须早于计划结束日期'));
                    }
                    const groupId = getFieldValue('group_id');
                    if (groupId) {
                      const group = groupPlans.find(g => g.id === groupId);
                      if (group && value.isBefore(dayjs(group.plan_start_date))) {
                        return Promise.reject(new Error(`计划开始日期不能早于隶属小组计划的开始日期 (${dayjs(group.plan_start_date).format('YYYY-MM-DD')})`));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item 
              name="actual_start_date" 
              label="实际开始日期"
              dependencies={['actual_end_date']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('actual_end_date')) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue('actual_end_date'))) {
                      return Promise.reject(new Error('实际开始日期必须早于实际结束日期'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item 
              name="plan_end_date" 
              label="计划结束日期" 
              dependencies={['plan_start_date']}
              rules={[
                { required: true, message: '请选择计划结束日期' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('plan_start_date')) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue('plan_start_date'))) {
                      return Promise.reject(new Error('计划结束日期必须晚于计划开始日期'));
                    }
                    const groupId = getFieldValue('group_id');
                    if (groupId) {
                      const group = groupPlans.find(g => g.id === groupId);
                      if (group && value.isAfter(dayjs(group.plan_end_date))) {
                        return Promise.reject(new Error(`计划结束日期不能晚于隶属小组计划的结束日期 (${dayjs(group.plan_end_date).format('YYYY-MM-DD')})`));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item 
              name="actual_end_date" 
              label="实际结束日期"
              dependencies={['actual_start_date']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('actual_start_date')) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue('actual_start_date'))) {
                      return Promise.reject(new Error('实际结束日期必须晚于实际开始日期'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PlanningPage;
