import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Popconfirm, Card, Typography, Tabs, Tree, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, RightOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import dayjs from 'dayjs';
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation, useGetProjectsQuery, useAddTaskDependencyMutation, useRemoveTaskDependencyMutation } from '../../store/api';
import type { Task, Project } from '../../types/models';
import { TASK_STATUS, PRIORITY, TASK_TYPE } from '../../utils/constants';

const { Title } = Typography;
const { TextArea } = Input;

const Tasks: React.FC = () => {
  const [data, setData] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ project_id: '', status_filter: '', priority: '' });
  const [dependencyModalOpen, setDependencyModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedDependencyId, setSelectedDependencyId] = useState('');

  const { data: tasksData = [], isLoading: tasksLoading, refetch } = useGetTasksQuery({
    project_id: filters.project_id || undefined,
    status_filter: filters.status_filter || undefined,
    priority: filters.priority || undefined,
  });
  
  const { data: projectsData = [] } = useGetProjectsQuery(undefined);
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addDependency] = useAddTaskDependencyMutation();
  const [removeDependency] = useRemoveTaskDependencyMutation();

  useEffect(() => {
    if (tasksData) {
      setData(Array.isArray(tasksData) ? tasksData : []);
    }
  }, [tasksData]);

  useEffect(() => {
    if (projectsData) {
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    }
  }, [projectsData]);

  const handleCreate = () => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({ priority: 'medium', type: 'task', status: 'todo' });
    setModalOpen(true);
  };

  const handleEdit = (record: Task) => {
    setEditingTask(record);
    form.setFieldsValue({
      ...record,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      due_date: record.due_date ? dayjs(record.due_date) : null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        start_date: values.start_date?.toISOString(),
        due_date: values.due_date?.toISOString(),
        reporter_id: 'reporter_id_placeholder',
      };

      if (editingTask) {
        await updateTask({ id: editingTask._id, body: payload }).unwrap();
        message.success('任务更新成功');
      } else {
        await createTask(payload).unwrap();
        message.success('任务创建成功');
      }
      setModalOpen(false);
      refetch();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingTask ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id).unwrap();
      message.success('任务已删除');
      refetch();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    try {
      await updateTask({ id, body: { status } }).unwrap();
      message.success('状态已更新');
      refetch();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleAddDependency = async () => {
    if (!selectedTaskId || !selectedDependencyId) {
      message.warning('请选择任务和依赖任务');
      return;
    }
    if (selectedTaskId === selectedDependencyId) {
      message.warning('不能依赖自己');
      return;
    }
    try {
      await addDependency({ taskId: selectedTaskId, body: { dependency_id: selectedDependencyId } }).unwrap();
      message.success('依赖关系已添加');
    } catch (error: any) {
      message.error(error?.data?.detail || '添加依赖失败');
    }
    setDependencyModalOpen(false);
    setSelectedTaskId('');
    setSelectedDependencyId('');
    refetch();
  };

  const handleRemoveDependency = async (taskId: string, dependencyId: string) => {
    try {
      await removeDependency({ taskId, dependencyId }).unwrap();
      message.success('依赖关系已移除');
    } catch (error: any) {
      message.error(error?.data?.detail || '移除依赖失败');
    }
    refetch();
  };

  const openDependencyModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setSelectedDependencyId('');
    setDependencyModalOpen(true);
  };

  const buildDependencyTree = (): DataNode[] => {
    const rootTasks = data.filter((t) => !t.dependencies?.length);
    
    const buildTree = (task: Task): DataNode => {
      const children = data
        .filter((t) => t.dependencies?.includes(task._id))
        .map(buildTree);
      
      return {
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color={task.priority === 'critical' ? 'red' : task.priority === 'high' ? 'orange' : 'blue'} style={{ fontSize: 10 }}>
              {PRIORITY[task.priority as keyof typeof PRIORITY]}
            </Tag>
            <span>{task.title}</span>
          </div>
        ),
        key: task._id,
        children: children.length ? children : undefined,
      };
    };
    
    return rootTasks.map(buildTree);
  };

  const columns: ColumnsType<Task> = [
    {
      title: '任务标题',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (type: string) => {
        const colorMap: Record<string, string> = { feature: 'blue', bug: 'red', task: 'default', milestone: 'gold' };
        return <Tag color={colorMap[type] || 'default'}>{TASK_TYPE[type as keyof typeof TASK_TYPE] || type}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={priority === 'critical' ? 'red' : priority === 'high' ? 'orange' : priority === 'medium' ? 'blue' : 'default'}>
          {PRIORITY[priority as keyof typeof PRIORITY]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: Task['status'], record: Task) => (
        <Select
          size="small"
          value={status}
          style={{ width: 100 }}
          onChange={(value: Task['status']) => handleStatusChange(record._id, value)}
          options={Object.entries(TASK_STATUS).map(([key, label]) => ({ value: key, label }))}
        />
      ),
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      width: 110,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '截止日期',
      dataIndex: 'due_date',
      width: 110,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '预估工时',
      dataIndex: 'estimate_hours',
      width: 100,
      render: (hours: number) => (hours ? `${hours}人天` : '-'),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space wrap>
          {tags.slice(0, 2).map((tag) => <Tag key={tag}>{tag}</Tag>)}
          {tags.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: '依赖',
      dataIndex: 'dependencies',
      width: 180,
      render: (deps: string[], record: Task) => (
        <div>
          {deps?.length ? (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {deps.slice(0, 2).map((depId) => {
                  const dep = data.find((t) => t._id === depId);
                  return (
                    <Tag key={depId} color="purple" style={{ fontSize: 11 }}>
                      {dep?.title?.substring(0, 10) || depId.substring(0, 8)}
                    </Tag>
                  );
                })}
                {deps.length > 2 && <Tag>+{deps.length - 2}</Tag>}
              </div>
              <Button
                type="text"
                size="small"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => deps.forEach((dep) => handleRemoveDependency(record._id, dep))}
              >
                清除依赖
              </Button>
            </div>
          ) : (
            <Button type="text" size="small" icon={<LinkOutlined />} onClick={() => openDependencyModal(record._id)}>
              添加依赖
            </Button>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除此任务？" onConfirm={() => handleDelete(record._id)}>
            <Tooltip title="删除">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>任务管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建任务
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="筛选项目"
            allowClear
            style={{ width: 200 }}
            value={filters.project_id || undefined}
            onChange={(value) => setFilters((prev) => ({ ...prev, project_id: value || '' }))}
            options={projects.map((p) => ({ label: p.name, value: p._id }))}
          />
          <Select
            placeholder="筛选状态"
            allowClear
            style={{ width: 120 }}
            value={filters.status_filter || undefined}
            onChange={(value) => setFilters((prev) => ({ ...prev, status_filter: value || '' }))}
            options={Object.entries(TASK_STATUS).map(([key, label]) => ({ value: key, label }))}
          />
          <Select
            placeholder="筛选优先级"
            allowClear
            style={{ width: 120 }}
            value={filters.priority || undefined}
            onChange={(value) => setFilters((prev) => ({ ...prev, priority: value || '' }))}
            options={Object.entries(PRIORITY).map(([key, label]) => ({ value: key, label }))}
          />
        </Space>
      </Card>

      <Card>
        <Tabs
          defaultActiveKey="table"
          items={[
            {
              key: 'table',
              label: '表格视图',
              children: (
                <Table
                  columns={columns}
                  dataSource={data}
                  rowKey="_id"
                  loading={tasksLoading}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
                  scroll={{ x: 1400 }}
                  locale={{ emptyText: '暂无数据' }}
                />
              ),
            },
            {
              key: 'kanban',
              label: '看板视图',
              children: (
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
                  {Object.entries(TASK_STATUS).map(([status, label]) => {
                    const statusTasks = data.filter((t) => t.status === status);
                    return (
                      <Card key={status} style={{ minWidth: 280, flexShrink: 0 }} title={`${label} (${statusTasks.length})`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {statusTasks.map((task) => (
                            <Card key={task._id} size="small" style={{ borderRadius: 'var(--radius-md)', cursor: 'pointer' }} onClick={() => handleEdit(task)}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</div>
                                <Tag color={task.priority === 'critical' ? 'red' : task.priority === 'high' ? 'orange' : 'blue'} style={{ fontSize: 10 }}>
                                  {PRIORITY[task.priority as keyof typeof PRIORITY]}
                                </Tag>
                              </div>
                              {task.type && (
                                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>
                                  {TASK_TYPE[task.type as keyof typeof TASK_TYPE] || task.type}
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ),
            },
            {
              key: 'dependencies',
              label: '依赖视图',
              children: (
                <div style={{ padding: 16 }}>
                  {data.length ? (
                    <Tree
                      treeData={buildDependencyTree()}
                      defaultExpandAll
                      showLine
                      switcherIcon={<RightOutlined />}
                      style={{ maxHeight: 600, overflowY: 'auto' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>暂无任务数据</div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="任务标题" rules={[{ required: true, message: '请输入任务标题' }]}>
            <Input placeholder="任务标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="任务描述" />
          </Form.Item>
          <Form.Item name="project_id" label="所属项目" rules={[{ required: true, message: '请选择项目' }]}>
            <Select placeholder="选择项目" options={projects.map((p) => ({ label: p.name, value: p._id }))} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="type" label="类型">
              <Select>
                <Select.Option value="task">任务</Select.Option>
                <Select.Option value="feature">功能</Select.Option>
                <Select.Option value="bug">缺陷</Select.Option>
                <Select.Option value="milestone">里程碑</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="priority" label="优先级">
              <Select>
                <Select.Option value="low">低</Select.Option>
                <Select.Option value="medium">中</Select.Option>
                <Select.Option value="high">高</Select.Option>
                <Select.Option value="critical">紧急</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="start_date" label="开始日期">
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item name="due_date" label="截止日期">
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
          </div>
          <Form.Item name="estimate_hours" label="预估工时（人天）">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加任务依赖"
        open={dependencyModalOpen}
        onOk={handleAddDependency}
        onCancel={() => { setDependencyModalOpen(false); setSelectedTaskId(''); setSelectedDependencyId(''); }}
        okText="确认添加"
        okButtonProps={{ disabled: !selectedDependencyId }}
      >
        <div style={{ marginBottom: 16 }}>
          <span style={{ color: 'var(--color-muted)' }}>当前任务：</span>
          <strong>{data.find((t) => t._id === selectedTaskId)?.title || '未选择'}</strong>
        </div>
        <Select
          style={{ width: '100%' }}
          value={selectedDependencyId || undefined}
          onChange={setSelectedDependencyId}
          placeholder="请选择依赖的任务（此任务完成后才能开始当前任务）"
          options={data
            .filter((t) => t._id !== selectedTaskId)
            .map((t) => ({ label: t.title, value: t._id }))}
        />
        <div style={{ marginTop: 16, color: 'var(--color-muted)', fontSize: 12 }}>
          提示：依赖关系表示当前任务依赖于所选任务，所选任务完成后当前任务才能开始
        </div>
      </Modal>
    </>
  );
};

export default Tasks;
