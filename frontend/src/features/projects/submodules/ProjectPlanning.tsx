import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Empty, Select, Tabs, Progress, Tag, Button, Modal, Form, Input, DatePicker, message, Tooltip, Popconfirm, Upload, InputNumber } from 'antd';
import { CalendarOutlined, FolderOutlined, UserOutlined, BarsOutlined, RightOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { GanttChart } from '../../../components/charts/GanttChart';
import { BarChart } from '../../../components/charts/BarChart';
import { getTaskGanttData } from '../../../api/stats';
import { getTasks } from '../../../api/tasks';
import { getProjects } from '../../../api/projects';
import { getResources } from '../../../api/resources';
import { 
  getMilestones, getGroupPlans, getDetailTasks,
  createMilestone, updateMilestone, deleteMilestone,
  createGroupPlan, updateGroupPlan, deleteGroupPlan,
  createDetailTask, updateDetailTask, deleteDetailTask,
  type Milestone, type GroupPlan, type DetailTask
} from '../../../api/plans';
import type { GanttTask } from '../../../api/stats';
import type { Task, Project, Resource } from '../../../types/models';
import { TASK_STATUS, PRIORITY } from '../../../utils/constants';
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

const getMemberDisplayName = (userId: string, teamMembers: Resource[]): string => {
  if (!userId) return '-';
  const member = teamMembers.find(m => m._id === userId);
  return member?.name || userId;
};

const ProjectPlanning: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
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
          if (projectId) {
            const project = processedProjects.find(p => p._id === projectId);
            setSelectedProject(project || null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    loadProjects();
  }, [projectId]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData(selectedProject._id);
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
          const data: any = { project_id: projectId };
          
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
        loadProjectData(projectId!);
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
          project_id: projectId,
          status: 'pending',
          progress: 0
        };
        await createMilestone(createData);
        message.success('里程碑创建成功');
      }
      
      setMilestoneModalOpen(false);
      loadProjectData(projectId!);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error('操作失败');
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      await deleteMilestone(id);
      message.success('里程碑已删除');
      loadProjectData(projectId!);
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
          project_id: projectId,
          status: 'pending',
          progress: 0
        };
        await createGroupPlan(createData);
        message.success('小组计划创建成功');
      }
      
      setGroupModalOpen(false);
      loadProjectData(projectId!);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error('操作失败');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroupPlan(id);
      message.success('小组计划已删除');
      loadProjectData(projectId!);
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
          project_id: projectId,
          status: 'pending',
          progress: 0
        };
        await createDetailTask(createData);
        message.success('详细任务创建成功');
      }
      
      setTaskModalOpen(false);
      loadProjectData(projectId!);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error('操作失败');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDetailTask(id);
      message.success('详细任务已删除');
      loadProjectData(projectId!);
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

  if (!selectedProject) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, display: 'inline' }}>
            <FolderOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
            计划管理
          </Title>
        </div>
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
            项目加载中...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      {/* 固定Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, display: 'inline' }}>
          <FolderOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
          计划管理
        </Title>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
            {
              key: 'milestone',
              label: '项目里程碑计划',
              children: (
                <>
                  {/* 固定区域：统计卡片、按钮、甘特图 */}
                  <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', paddingBottom: 16, borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
                    <Card>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>总里程碑数</div>
                          <div style={{ fontSize: 28, fontWeight: 700 }}>{milestoneStats.total}</div>
                        </Card>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>已完成</div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(40% 0.14 145)' }}>{milestoneStats.completed}</div>
                        </Card>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>进行中</div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(50% 0.12 40)' }}>{milestoneStats.in_progress}</div>
                        </Card>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>未开始</div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(60% 0.14 240)' }}>{milestoneStats.pending}</div>
                        </Card>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                          <Tooltip title="下载模板">
                            <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('milestone')} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}>下载模板</Button>
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
                        <Empty description="暂无里程碑" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <GanttChart key={'milestone-gantt'} tasks={getMilestoneGanttData()} height={300} minDate={selectedProject?.start_date} maxDate={selectedProject?.end_date} />
                      )}
                    </Card>
                  </div>

                  {/* 滚动区域：计划列表 */}
                  <div style={{ paddingTop: 16 }}>
                    {!loadingData && milestones.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {milestones.map((milestone, index) => (
                          <Card key={milestone.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: getStatusColor(milestone.status), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {getStatusIcon(milestone.status)}
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 600 }}>{milestone.name}</div>
                              </div>
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
                            <Progress percent={milestone.progress} strokeColor={getStatusColor(milestone.status)} />
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ),
            },
            {
              key: 'group',
              label: '小组计划',
              children: (
                <>
                  {/* 固定区域：统计卡片、按钮、甘特图 */}
                  <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', paddingBottom: 16, borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
                    <Card>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>总计划数</div>
                          <div style={{ fontSize: 28, fontWeight: 700 }}>{groupStats.total}</div>
                        </Card>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>已完成</div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(40% 0.14 145)' }}>{groupStats.completed}</div>
                        </Card>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>进行中</div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(50% 0.12 40)' }}>{groupStats.in_progress}</div>
                        </Card>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>未开始</div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(60% 0.14 240)' }}>{groupStats.pending}</div>
                        </Card>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                          <Tooltip title="下载模板">
                            <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('group')} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}>下载模板</Button>
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
                        <Empty description="暂无小组计划" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <GanttChart key={'group-gantt'} tasks={getGroupGanttData()} height={300} minDate={selectedProject?.start_date} maxDate={selectedProject?.end_date} />
                      )}
                    </Card>
                  </div>

                  {/* 滚动区域：计划列表 */}
                  <div style={{ paddingTop: 16 }}>
                    {!loadingData && groupPlans.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {groupPlans.map((group) => {
                          const milestone = milestones.find(m => m.id === group.milestone_id);
                          return (
                            <Card key={group.id}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: getStatusColor(group.status), flexShrink: 0 }} />
                                  <Title level={4} style={{ margin: 0 }}>{group.name}</Title>
                                  {getStatusIcon(group.status)}
                                </div>
                                <div>
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
                              {milestone && (
                                <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: 'rgba(82, 196, 26, 0.1)', borderRadius: 4, display: 'inline-block' }}>
                                  <span style={{ fontSize: 12, color: 'oklch(40% 0.14 145)', fontWeight: 500 }}>
                                    隶属里程碑：{milestone.name}
                                  </span>
                                </div>
                              )}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                <Text type="secondary">负责人：{getMemberDisplayName(group.owner, teamMembers)}</Text>
                                <Text type="secondary">计划：{dayjs(group.plan_start_date).format('YYYY-MM-DD')} ~ {dayjs(group.plan_end_date).format('YYYY-MM-DD')}</Text>
                                {group.actual_start_date && (
                                  <Text type="secondary">实际开始：{dayjs(group.actual_start_date).format('YYYY-MM-DD')}</Text>
                                )}
                                {group.actual_end_date && (
                                  <Text type="secondary">实际结束：{dayjs(group.actual_end_date).format('YYYY-MM-DD')}</Text>
                                )}
                                <Text type="secondary">状态：{group.current_status}</Text>
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
                              <Progress percent={group.progress} strokeColor={getStatusColor(group.status)} />
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ),
            },
            {
              key: 'detail',
              label: '详细计划',
              children: (
                <>
                  {/* 固定区域：统计卡片、按钮、甘特图 */}
                  <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', paddingBottom: 16, borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
                    <Card>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>总任务数</div>
                          <div style={{ fontSize: 28, fontWeight: 700 }}>{taskStats.total}</div>
                        </Card>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>已完成</div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(40% 0.14 145)' }}>{taskStats.completed}</div>
                        </Card>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>进行中</div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(50% 0.12 40)' }}>{taskStats.in_progress}</div>
                        </Card>
                        <Card size="small">
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>未开始</div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: 'oklch(60% 0.14 240)' }}>{taskStats.pending}</div>
                        </Card>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                          <Tooltip title="下载模板">
                            <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('detail')} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}>下载模板</Button>
                          </Tooltip>
                          <Upload showUploadList={false} beforeUpload={(file) => { handleImportData(file, 'detail'); return false; }}>
                            <Tooltip title="导入数据">
                              <Button icon={<UploadOutlined />} style={{ marginLeft: 8, backgroundColor: '#13c2c2', borderColor: '#13c2c2', color: 'white' }}>导入</Button>
                            </Tooltip>
                          </Upload>
                        </div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openTaskModal()}>添加任务</Button>
                      </div>

                      {loadingData ? (
                        <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
                      ) : detailTasks.length === 0 ? (
                        <Empty description="暂无详细任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <GanttChart key={'detail-gantt'} tasks={getDetailTaskGanttData()} height={300} minDate={selectedProject?.start_date} maxDate={selectedProject?.end_date} />
                      )}
                    </Card>
                  </div>

                  {/* 滚动区域：计划列表 */}
                  <div style={{ paddingTop: 16 }}>
                    {!loadingData && detailTasks.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {detailTasks.map((task) => {
                          const group = groupPlans.find(g => g.id === task.group_id);
                          const milestone = milestones.find(m => m.id === task.milestone_id);
                          return (
                            <Card key={task.id}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: getStatusColor(task.status), flexShrink: 0 }} />
                                  <Title level={4} style={{ margin: 0 }}>{task.name}</Title>
                                  {getStatusIcon(task.status)}
                                </div>
                                <div>
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
                              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
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
                                <Text type="secondary">负责人：{getMemberDisplayName(task.owner, teamMembers)}</Text>
                                <Text type="secondary">计划：{dayjs(task.plan_start_date).format('YYYY-MM-DD')} ~ {dayjs(task.plan_end_date).format('YYYY-MM-DD')}</Text>
                                {task.actual_start_date && (
                                  <Text type="secondary">实际开始：{dayjs(task.actual_start_date).format('YYYY-MM-DD')}</Text>
                                )}
                                {task.actual_end_date && (
                                  <Text type="secondary">实际结束：{dayjs(task.actual_end_date).format('YYYY-MM-DD')}</Text>
                                )}
                                <Text type="secondary">状态：{task.current_status}</Text>
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
                              <Progress percent={task.progress} strokeColor={getStatusColor(task.status)} />
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ),
            },
          ]}
        />
    </div>
  );

};

export default ProjectPlanning;
