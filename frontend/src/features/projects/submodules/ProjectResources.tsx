import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Tag, Card, Typography, Progress, Alert, Tabs, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetResourcesQuery, useCreateResourceMutation, useUpdateResourceMutation, useDeleteResourceMutation, useCheckResourceConflictsQuery } from '../../../store/api';
import type { Resource } from '../../../types/models';

const { Title } = Typography;
const { TextArea } = Input;

interface ConflictItem {
  resource_id: string;
  resource_name: string;
  conflicts: Array<{
    project_id: string;
    project_name: string;
    start_date: string;
    end_date: string;
  }>;
}

const ProjectResources: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ type: '', availability: '' });
  const [conflictChecked, setConflictChecked] = useState(false);
  const [checkConflictsTrigger, setCheckConflictsTrigger] = useState(false);

  const { data: resources = [], isLoading: loading, refetch } = useGetResourcesQuery(
    { type: filters.type || undefined, availability: filters.availability || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const { data: conflicts = [], isLoading: conflictLoading, refetch: refetchConflicts } = useCheckResourceConflictsQuery(undefined, { skip: !checkConflictsTrigger });
  const [createResource] = useCreateResourceMutation();
  const [updateResource] = useUpdateResourceMutation();
  const [deleteResource] = useDeleteResourceMutation();

  const handleCheckConflicts = async () => {
    setConflictChecked(true);
    setCheckConflictsTrigger(true);
    refetchConflicts();
  };

  const handleCreate = () => {
    setEditingResource(null);
    form.resetFields();
    form.setFieldsValue({ type: 'human', availability: 'available' });
    setModalOpen(true);
  };

  const handleEdit = (record: Resource) => {
    setEditingResource(record);
    form.setFieldsValue({
      ...record,
      hourly_rate: record.cost_per_hour
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { 
        ...values,
        cost_per_hour: values.hourly_rate,
        project_id: projectId
      };
      delete payload.hourly_rate;

      if (editingResource) {
        await updateResource({ id: editingResource._id, body: payload }).unwrap();
        message.success('资源更新成功');
      } else {
        await createResource(payload).unwrap();
        message.success('资源创建成功');
      }
      setModalOpen(false);
      refetch();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingResource ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResource(id).unwrap();
      message.success('资源已删除');
      refetch();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Resource> = [
    {
      title: '资源名称',
      dataIndex: 'name',
      width: 180,
      ellipsis: true,
      render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => {
        const colorMap: Record<string, string> = { human: 'blue', equipment: 'orange', material: 'green', software: 'purple' };
        const labelMap: Record<string, string> = { human: '人力', equipment: '设备', material: '物资', software: '软件' };
        return <Tag color={colorMap[type] || 'default'}>{labelMap[type] || type}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      width: 100,
      render: (capacity: number) => <span className="mono-value">{capacity}</span>,
    },
    {
      title: '已分配',
      dataIndex: 'allocated',
      width: 120,
      render: (allocated: number, record: Resource) => {
        const percent = record.capacity ? Math.round((allocated / record.capacity) * 100) : 0;
        return (
          <div>
            <span className="mono-value">{allocated}</span>
            <Progress percent={percent} size="small" style={{ marginTop: 4 }} />
          </div>
        );
      },
    },
    {
      title: '可用性',
      dataIndex: 'availability',
      width: 100,
      render: (availability: string) => {
        const colorMap: Record<string, string> = { available: 'green', busy: 'orange', unavailable: 'red' };
        const labelMap: Record<string, string> = { available: '可用', busy: '繁忙', unavailable: '不可用' };
        return <Tag color={colorMap[availability] || 'default'}>{labelMap[availability] || availability}</Tag>;
      },
    },
    {
      title: '成本/人天',
      dataIndex: 'cost_per_hour',
      width: 120,
      render: (rate: number) => <span className="mono-value">{rate ? `${rate} CNY` : '-'}</span>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: string[]) => {
        const safeTags = tags || [];
        return (
          <Space wrap>
            {safeTags.slice(0, 3).map((tag) => <Tag key={tag}>{tag}</Tag>)}
            {safeTags.length > 3 && <Tag>+{safeTags.length - 3}</Tag>}
          </Space>
        );
      },
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
          <Popconfirm title="确定删除此资源？" onConfirm={() => handleDelete(record._id)}>
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
          <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          资源管理
        </Title>
      </div>

      {conflictChecked && conflicts.length > 0 && (
        <Alert
          message={`检测到 ${conflicts.length} 个资源存在冲突`}
          description="以下资源在同一时间段被多个项目分配，可能导致资源过载"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="筛选类型"
            allowClear
            style={{ width: 150 }}
            value={filters.type || undefined}
            onChange={(value) => setFilters((prev) => ({ ...prev, type: value || '' }))}
            options={[
              { label: '人力', value: 'human' },
              { label: '设备', value: 'equipment' },
              { label: '物资', value: 'material' },
              { label: '软件', value: 'software' },
            ]}
          />
          <Select
            placeholder="筛选可用性"
            allowClear
            style={{ width: 150 }}
            value={filters.availability || undefined}
            onChange={(value) => setFilters((prev) => ({ ...prev, availability: value || '' }))}
            options={[
              { label: '可用', value: 'available' },
              { label: '繁忙', value: 'busy' },
              { label: '不可用', value: 'unavailable' },
            ]}
          />
        </Space>
      </Card>

      <Card>
        <Tabs
          defaultActiveKey="resources"
          items={[
            {
              key: 'resources',
              label: '资源列表',
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button icon={<SyncOutlined />} onClick={handleCheckConflicts} loading={conflictLoading}>
                      检测冲突
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                      新建资源
                    </Button>
                  </div>
                  <Table
                    columns={columns}
                    dataSource={resources}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
                    scroll={{ x: 1200 }}
                    locale={{ emptyText: '暂无数据' }}
                  />
                </div>
              ),
            },
            {
              key: 'conflicts',
              label: `资源冲突 (${conflicts.length})`,
              children: conflictChecked ? (
                conflicts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {conflicts.map((conflict) => (
                      <div key={conflict.resource_id} className="conflict-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <WarningOutlined style={{ color: 'var(--color-warning)', fontSize: 24 }} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{conflict.resource_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                              在以下项目中存在时间冲突
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {conflict.conflicts.map((c, idx) => (
                            <Card key={idx} size="small" style={{ width: 280 }}>
                              <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.project_name}</div>
                              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                                {c.start_date} ~ {c.end_date}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                    <div>未检测到资源冲突</div>
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <div>点击上方「检测冲突」按钮检查资源冲突</div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingResource ? '编辑资源' : '新建资源'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={500}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="资源名称" rules={[{ required: true, message: '请输入资源名称' }]}>
            <Input placeholder="资源名称" />
          </Form.Item>
          <Form.Item name="type" label="资源类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="human">人力</Select.Option>
              <Select.Option value="equipment">设备</Select.Option>
              <Select.Option value="material">物资</Select.Option>
              <Select.Option value="software">软件</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="资源描述" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="capacity" label="容量" rules={[{ required: true, validator: (_, value) => {
              if (value === undefined || value === null || value === '') {
                return Promise.reject('请输入容量');
              }
              const num = Number(value);
              if (isNaN(num)) {
                return Promise.reject('请输入有效的数字');
              }
              if (num < 0) {
                return Promise.reject('容量不能为负数');
              }
              return Promise.resolve();
            } }]}>
              <InputNumber style={{ width: '100%' }} placeholder="容量" min={0} />
            </Form.Item>
            <Form.Item name="availability" label="可用性" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="available">可用</Select.Option>
                <Select.Option value="busy">繁忙</Select.Option>
                <Select.Option value="unavailable">不可用</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="hourly_rate" label="成本/人天">
            <InputNumber style={{ width: '100%' }} addonAfter="CNY" placeholder="每人天成本" min={0} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectResources;