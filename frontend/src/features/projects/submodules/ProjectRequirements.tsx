import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm, Card, Typography, Badge, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetRequirementsQuery, useCreateRequirementMutation, useUpdateRequirementMutation, useDeleteRequirementMutation } from '../../../store/api';
import type { Requirement } from '../../../types/models';
import { REQUIREMENT_STATUS, REQUIREMENT_TYPE, PRIORITY } from '../../../utils/constants';
import { useDataItems } from '../../../hooks/useDataItems';
import DataItemSelect from '../../../components/common/DataItemSelect';

const { Title } = Typography;
const { TextArea } = Input;

const ProjectRequirements: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [form] = Form.useForm();

  const { data: requirements = [], isLoading: loading } = useGetRequirementsQuery({ project_id: projectId });
  const [createRequirement] = useCreateRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();
  const [deleteRequirement] = useDeleteRequirementMutation();

  const { items: requirementTypes } = useDataItems('requirement_type');
  const { items: requirementStatuses } = useDataItems('requirement_status');
  const { items: priorities } = useDataItems('priority');

  const handleCreate = () => {
    setEditingRequirement(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: Requirement) => {
    setEditingRequirement(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        project_id: projectId,
        code: values.code || `REQ-${Date.now()}`,
      };

      if (editingRequirement) {
        await updateRequirement({ id: editingRequirement._id, body: payload }).unwrap();
        message.success('需求更新成功');
      } else {
        await createRequirement(payload).unwrap();
        message.success('需求创建成功');
      }
      setModalOpen(false);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingRequirement ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRequirement(id).unwrap();
      message.success('需求已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Requirement> = [
    {
      title: '需求编号',
      dataIndex: 'code',
      width: 120,
      render: (code: string) => <span className="mono-value">{code}</span>,
    },
    {
      title: '需求标题',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
      render: (title: string) => <span style={{ fontWeight: 600 }}>{title}</span>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => <Tag>{REQUIREMENT_TYPE[type as keyof typeof REQUIREMENT_TYPE] || type}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          draft: 'default',
          reviewing: 'blue',
          approved: 'success',
          in_progress: 'processing',
          done: 'success',
          rejected: 'error',
        };
        return <Tag color={colorMap[status] || 'default'}>{REQUIREMENT_STATUS[status as keyof typeof REQUIREMENT_STATUS] || status}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (priority: string) => {
        const colorMap: Record<string, string> = { low: 'default', medium: 'blue', high: 'orange', critical: 'red' };
        return <Tag color={colorMap[priority] || 'default'}><Badge status={colorMap[priority] as any} text={PRIORITY[priority as keyof typeof PRIORITY]} /></Tag>;
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 120,
      ellipsis: true,
    },
    {
      title: '版本',
      dataIndex: 'version',
      width: 80,
      render: (version: number) => <span className="mono-value">v{version}</span>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space wrap>
          {tags?.slice(0, 2).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {tags?.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除此需求？" onConfirm={() => handleDelete(record._id)}>
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
          <FileTextOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
          需求管理
        </Title>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建需求
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={requirements}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
          scroll={{ x: 1200 }}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>

      <Modal
        title={editingRequirement ? '编辑需求' : '新建需求'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="需求编号" rules={[{ required: true, message: '请输入需求编号' }]}>
            <Input placeholder="如 REQ-001" />
          </Form.Item>
          <Form.Item name="title" label="需求标题" rules={[{ required: true, message: '请输入需求标题' }]}>
            <Input placeholder="请输入需求标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="需求详细描述" />
          </Form.Item>
          <Form.Item name="type" label="需求类型" rules={[{ required: true }]}>
            <DataItemSelect category="requirement_type" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <DataItemSelect category="requirement_status" />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <DataItemSelect category="priority" />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Input placeholder="需求来源" />
          </Form.Item>
          <Form.Item name="acceptance_criteria" label="验收标准">
            <Select mode="tags" placeholder="输入验收标准后按回车" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectRequirements;
