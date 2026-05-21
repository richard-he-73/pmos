import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Popconfirm, Card, Typography, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getTasks, createTask, updateTask, deleteTask } from '../../api/tasks';
import { getProjects } from '../../api/projects';
import type { Task, Project } from '../../types/models';
import { TASK_STATUS, PRIORITY } from '../../utils/constants';

const { Title } = Typography;
const { TextArea } = Input;

const Tasks: React.FC = () => {
  const [data, setData] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ project_id: '', status_filter: '', priority: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTasks(
        filters.project_id || undefined,
        undefined,
        filters.status_filter || undefined,
        filters.priority || undefined
      );
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      message.error('获取任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(Array.isArray(res) ? res : []);
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, []);

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
        await updateTask(editingTask._id, payload);
        message.success('任务更新成功');
      } else {
        await createTask(payload);
        message.success('任务创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingTask ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      message.success('任务已删除');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    try {
      await updateTask(id, { status });
      message.success('状态已更新');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
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
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
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
      render: (hours: number) => (hours ? `${hours}h` : '-'),
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
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除此任务？" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
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
                  loading={loading}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
                  scroll={{ x: 1200 }}
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
                                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>{task.type}</div>
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
          ]}
        />
      </Card>

      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
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
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="due_date" label="截止日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="estimate_hours" label="预估工时（小时）">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Tasks;
