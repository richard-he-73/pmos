import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Card, Descriptions, Button, Spin, Tag, Progress, Space, Typography, Result, Modal, Select, Input, message, Table, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CopyOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getProject, deleteProject, cloneProject, getProjectStatusFlow, transitionProjectStatus } from '../../api/projects';
import { getTasks, getTaskDependencies } from '../../api/tasks';
import type { Project, Task } from '../../types/models';
import { PROJECT_STATUS, PRIORITY, TASK_STATUS } from '../../utils/constants';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusFlow, setStatusFlow] = useState<{ allowed_transitions: { status: string; description: string }[] } | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getProject(id), getTasks(id)])
      .then(([projectData, tasksData]) => {
        setProject(projectData);
        setTasks(tasksData || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteProject(id);
      message.success('项目删除成功');
      navigate('/projects');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleClone = async () => {
    if (!id || !project) return;
    try {
      await cloneProject(id, `${project.name} (副本)`);
      message.success('项目克隆成功');
      navigate('/projects');
    } catch (error) {
      message.error('克隆失败');
    }
  };

  const openStatusModal = async () => {
    if (!id) return;
    try {
      const flow = await getProjectStatusFlow(id);
      setStatusFlow(flow);
      setNewStatus('');
      setStatusReason('');
      setStatusModalOpen(true);
    } catch (error) {
      message.error('获取状态流转信息失败');
    }
  };

  const handleStatusTransition = async () => {
    if (!id || !newStatus) return;
    setStatusLoading(true);
    try {
      const updated = await transitionProjectStatus(id, newStatus, statusReason);
      setProject(updated);
      message.success(`状态已更新为 "${PROJECT_STATUS[newStatus as keyof typeof PROJECT_STATUS]}"`);
      setStatusModalOpen(false);
    } catch (error: any) {
      message.error(error?.response?.data?.detail || '状态流转失败');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  if (!project) {
    return (
      <Result
        status="404"
        title="项目不存在"
        extra={<Button type="primary" onClick={() => navigate('/projects')}>返回项目列表</Button>}
      />
    );
  }

  const budgetPercent = project.budget?.total ? Math.round((project.budget.used / project.budget.total) * 100) : 0;

  const overviewTab = (
    <Card>
      <Descriptions title="项目信息" bordered column={2}>
        <Descriptions.Item label="项目编号" span={1}>{project.code}</Descriptions.Item>
        <Descriptions.Item label="项目名称" span={1}>{project.name}</Descriptions.Item>
        <Descriptions.Item label="状态" span={1}>
          <Tag color={project.status === 'active' ? 'processing' : project.status === 'completed' ? 'success' : project.status === 'on_hold' ? 'warning' : 'default'}>
            {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS] || project.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="优先级" span={1}>
          <Tag color={project.priority === 'critical' ? 'red' : project.priority === 'high' ? 'orange' : project.priority === 'medium' ? 'blue' : 'default'}>
            {PRIORITY[project.priority as keyof typeof PRIORITY] || project.priority}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="负责人" span={1}>{project.owner_id || '未分配'}</Descriptions.Item>
        <Descriptions.Item label="团队成员" span={1}>{project.team_members?.length || 0} 人</Descriptions.Item>
        <Descriptions.Item label="开始日期" span={1}>{dayjs(project.start_date).format('YYYY-MM-DD')}</Descriptions.Item>
        <Descriptions.Item label="结束日期" span={1}>
          {project.end_date ? dayjs(project.end_date).format('YYYY-MM-DD') : '未设置'}
        </Descriptions.Item>
        <Descriptions.Item label="进度" span={2}>
          <Progress percent={Math.round(project.progress)} strokeColor="var(--color-accent)" />
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={2}>{project.description || '暂无描述'}</Descriptions.Item>
        <Descriptions.Item label="标签" span={2}>
          <Space wrap>
            {project.tags?.map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="创建时间" span={1}>{dayjs(project.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        <Descriptions.Item label="更新时间" span={1}>{dayjs(project.updated_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const tasksTab = (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={5} style={{ margin: 0 }}>任务列表 ({tasks.length})</Title>
      </div>
      <Table<Task>
        columns={[
          { title: '标题', dataIndex: 'title', ellipsis: true, render: (t: string) => <Text strong>{t}</Text> },
          { title: '类型', dataIndex: 'type', width: 80, render: (t: string) => <Tag color="blue">{t}</Tag> },
          { title: '优先级', dataIndex: 'priority', width: 80, render: (p: string) => <Tag>{PRIORITY[p as keyof typeof PRIORITY]}</Tag> },
          { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => <Tag color={s === 'done' ? 'success' : s === 'in_progress' ? 'processing' : 'default'}>{TASK_STATUS[s as keyof typeof TASK_STATUS]}</Tag> },
          { title: '分配给', dataIndex: 'assignee_id', width: 120, ellipsis: true },
          { title: '截止日期', dataIndex: 'due_date', width: 120, render: (d: string) => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
        ]}
        dataSource={tasks}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        size="small"
        locale={{ emptyText: '暂无任务' }}
      />
    </Card>
  );

  const budgetTab = (
    <Card>
      <Title level={5} style={{ marginTop: 0 }}>预算分析</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <Text type="secondary">总预算</Text>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {project.budget?.total.toLocaleString()} {project.budget?.currency}
          </div>
        </div>
        <div>
          <Text type="secondary">已使用</Text>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: budgetPercent > 80 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {project.budget?.used.toLocaleString()} {project.budget?.currency}
          </div>
        </div>
        <div>
          <Text type="secondary">使用率</Text>
          <Progress percent={budgetPercent} strokeColor={budgetPercent > 80 ? 'var(--color-danger)' : 'var(--color-accent)'} />
        </div>
        <div>
          <Text type="secondary">剩余</Text>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
            {((project.budget?.total || 0) - (project.budget?.used || 0)).toLocaleString()} {project.budget?.currency}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>返回</Button>
          <Title level={4} style={{ margin: 0 }}>{project.name}</Title>
          <Tag color="blue">{project.code}</Tag>
        </div>
        <Space>
          <Button icon={<SwapOutlined />} onClick={openStatusModal}>状态流转</Button>
          <Button icon={<CopyOutlined />} onClick={handleClone}>克隆</Button>
          <Button icon={<EditOutlined />}>编辑</Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>删除</Button>
        </Space>
      </div>

      <Tabs
        defaultActiveKey="overview"
        items={[
          { key: 'overview', label: '概览', children: overviewTab },
          { key: 'tasks', label: `任务 (${tasks.length})`, children: tasksTab },
          { key: 'budget', label: '预算', children: budgetTab },
        ]}
      />

      <Modal
        title="项目状态流转"
        open={statusModalOpen}
        onOk={handleStatusTransition}
        onCancel={() => setStatusModalOpen(false)}
        confirmLoading={statusLoading}
        okText="确认流转"
        okButtonProps={{ disabled: !newStatus }}
      >
        <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="当前状态">
            <Tag color={project?.status === 'active' ? 'processing' : project?.status === 'completed' ? 'success' : 'default'}>
              {PROJECT_STATUS[project?.status as keyof typeof PROJECT_STATUS] || project?.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
        <div style={{ marginBottom: 16 }}>
          <Text>目标状态：</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={newStatus || undefined}
            onChange={setNewStatus}
            placeholder="请选择目标状态"
            options={statusFlow?.allowed_transitions.map((t) => ({
              label: `${PROJECT_STATUS[t.status as keyof typeof PROJECT_STATUS]} - ${t.description}`,
              value: t.status,
            }))}
          />
        </div>
        <div>
          <Text>流转原因（可选）：</Text>
          <TextArea
            style={{ marginTop: 8 }}
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            placeholder="请输入状态流转原因"
            rows={3}
          />
        </div>
      </Modal>
    </>
  );
};

export default ProjectDetail;
