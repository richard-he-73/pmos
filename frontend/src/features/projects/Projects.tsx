import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Progress, Popconfirm, Card, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined, ProjectOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useGetProjectsQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation, useCloneProjectMutation, useSetDefaultProjectMutation } from '../../store/api';
import type { Project } from '../../types/models';
import { PROJECT_STATUS, PRIORITY } from '../../utils/constants';
import { useDataItems } from '../../hooks/useDataItems';
import type { DataItem } from '../../services/dataItem';
import DataItemSelect from '../../components/common/DataItemSelect';

const { Title } = Typography;
const { TextArea } = Input;

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloningProject, setCloningProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [cloneForm] = Form.useForm();
  const [projectStatusItems, setProjectStatusItems] = useState<DataItem[]>([]);
  const [priorityItems, setPriorityItems] = useState<DataItem[]>([]);
  
  const { data: projects = [], isLoading, refetch } = useGetProjectsQuery(undefined);
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [cloneProject] = useCloneProjectMutation();
  const [setDefaultProject, { isLoading: isSettingDefault }] = useSetDefaultProjectMutation();
  const { items: statuses } = useDataItems('project_status');
  const { items: priorities } = useDataItems('priority');

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: Project) => {
    setEditingProject(record);
    form.setFieldsValue({
      ...record,
      start_date: dayjs(record.start_date),
      end_date: record.end_date ? dayjs(record.end_date) : null,
      budget_total: record.budget?.total,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      console.log('Code value:', values.code);
      console.log('Code length:', values.code?.length);
      const payload: any = {
        ...values,
        // 修复时区问题：只保留日期部分，不涉及时区转换
        start_date: values.start_date?.format('YYYY-MM-DD'),
        end_date: values.end_date?.format('YYYY-MM-DD'),
        owner_id: 'owner_id_placeholder',
        stakeholders: [],
        budget_total: Number(values.budget_total) || 0,
        budget_used: editingProject?.budget?.used || 0,
        budget_currency: editingProject?.budget?.currency || 'CNY',
        progress: editingProject?.progress || 0,
      };
      console.log('Payload to submit:', payload);
      console.log('Payload code:', payload.code);

      if (editingProject) {
        await updateProject({ id: editingProject._id, body: payload }).unwrap();
        message.success('项目更新成功');
      } else {
        await createProject(payload).unwrap();
        message.success('项目创建成功');
      }
      setModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Error submitting project:', error);
      if (error?.errorFields) return;
      message.error(editingProject ? '更新失败' : (error?.data?.detail || '创建失败'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id).unwrap();
      message.success('项目已删除');
      refetch();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleClone = (record: Project) => {
    setCloningProject(record);
    cloneForm.setFieldsValue({
      name: `${record.name} (副本)`,
      code: `${record.code}-copy`,
    });
    setCloneModalOpen(true);
  };

  const handleCloneSubmit = async () => {
    if (!cloningProject) return;
    try {
      const values = await cloneForm.validateFields();
      await cloneProject({ id: cloningProject._id, body: values }).unwrap();
      message.success('项目克隆成功');
      setCloneModalOpen(false);
      setCloningProject(null);
      refetch();
    } catch (error) {
      console.error('Error cloning project:', error);
      message.error('克隆失败');
    }
  };

  const handleSetDefault = async (record: Project) => {
    try {
      await setDefaultProject(record._id).unwrap();
      message.success('已设置为默认项目！请刷新页面查看效果');
      refetch();
    } catch (error) {
      console.error('Error setting default project:', error);
      message.error('设置失败');
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: '项目编号',
      dataIndex: 'code',
      width: 150,
      ellipsis: true,
      render: (code: string) => (
        <Tooltip title={code}>
          <span style={{ fontFamily: 'monospace' }}>{code}</span>
        </Tooltip>
      ),
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      width: 220,
      ellipsis: true,
      render: (name: string, record: Project) => (
        <Space>
          <a onClick={() => navigate(`/projects/${record._id}/tasks`)} style={{ fontWeight: 600 }}>{name}</a>
          {record.is_default && <Tag color="blue">默认项目</Tag>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          planning: 'default',
          active: 'processing',
          on_hold: 'warning',
          completed: 'success',
          archived: 'default',
        };
        return <Tag color={colorMap[status] || 'default'}>{PROJECT_STATUS[status as keyof typeof PROJECT_STATUS] || status}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (priority: string) => {
        const colorMap: Record<string, string> = {
          low: 'default',
          medium: 'blue',
          high: 'orange',
          critical: 'red',
        };
        return <Tag color={colorMap[priority] || 'default'}>{PRIORITY[priority as keyof typeof PRIORITY]}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 150,
      render: (progress: number) => (
        <Progress percent={Math.round(progress)} size="small" strokeColor="var(--color-accent)" />
      ),
    },
    {
      title: '预算使用',
      dataIndex: 'budget',
      width: 120,
      render: (budget: any) => {
        const percent = budget?.total ? Math.round((budget.used / budget.total) * 100) : 0;
        return (
          <div>
            <span className="mono-value">{percent}%</span>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
              {budget.used.toLocaleString()}/{budget.total.toLocaleString()} {budget.currency}
            </div>
          </div>
        );
      },
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/projects/${record._id}/tasks`)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="克隆">
            <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleClone(record)} />
          </Tooltip>
          {!record.is_default && (
            <Tooltip title="设为默认">
              <Button
                type="text"
                size="small"
                onClick={() => handleSetDefault(record)}
                loading={isSettingDefault}
              >
                ⭐
              </Button>
            </Tooltip>
          )}
          <Popconfirm title="确定删除此项目？" onConfirm={() => handleDelete(record._id)}>
            <Tooltip title="删除">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, display: 'inline' }}>
          <ProjectOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          项目管理
        </Title>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建项目
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={projects}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
          scroll={{ x: 1200 }}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="项目编号" rules={[{ required: true, message: '请输入项目编号' }]}>
            <Input placeholder="如 PRJ-2024-001" />
          </Form.Item>
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="项目名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="项目描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <DataItemSelect category="project_status" placeholder="请选择状态" />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <DataItemSelect category="priority" placeholder="请选择优先级" />
          </Form.Item>
          <Form.Item name="start_date" label="开始日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="end_date" label="结束日期">
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="budget_total" label="总预算">
            <Input type="number" addonAfter="CNY" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="克隆项目"
        open={cloneModalOpen}
        onCancel={() => {
          setCloneModalOpen(false);
          setCloningProject(null);
        }}
        footer={[
          <Button key="back" onClick={() => {
            setCloneModalOpen(false);
            setCloningProject(null);
          }}>取消</Button>
        ]}
      >
        <Form form={cloneForm} layout="vertical">
          <Form.Item label="新项目名称" name="name" rules={[{ required: true, message: '请输入新项目名称' }]}>
            <Input placeholder="输入新项目名称" />
          </Form.Item>
          <Form.Item label="新项目编号" name="code" rules={[{ required: true, message: '请输入新项目编号' }]}>
            <Input placeholder="输入新项目编号" />
          </Form.Item>
          <Button type="primary" onClick={handleCloneSubmit}>确认克隆</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;
