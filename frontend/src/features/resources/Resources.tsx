import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Popconfirm, Card, Typography, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getResources, createResource, updateResource, deleteResource } from '../../api/resources';
import type { Resource } from '../../types/models';

const { Title } = Typography;

const Resources: React.FC = () => {
  const [data, setData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ type_filter: '', availability: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getResources(
        filters.type_filter || undefined,
        filters.availability || undefined
      );
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      message.error('获取资源列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleCreate = () => {
    setEditingResource(null);
    form.resetFields();
    form.setFieldsValue({ type: 'human', availability: 'available', capacity: 100 });
    setModalOpen(true);
  };

  const handleEdit = (record: Resource) => {
    setEditingResource(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingResource) {
        await updateResource(editingResource._id, values);
        message.success('资源更新成功');
      } else {
        await createResource(values);
        message.success('资源创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingResource ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResource(id);
      message.success('资源已删除');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Resource> = [
    { title: '名称', dataIndex: 'name', width: 180, ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => {
        const map: Record<string, { color: string; label: string }> = {
          human: { color: 'blue', label: '人员' },
          equipment: { color: 'orange', label: '设备' },
          budget: { color: 'green', label: '预算' },
        };
        const { color, label } = map[type] || { color: 'default', label: type };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    { title: '分类', dataIndex: 'category', width: 120 },
    {
      title: '负载',
      dataIndex: 'capacity',
      width: 200,
      render: (_: number, record: Resource) => {
        const percent = record.capacity ? Math.round((record.allocated / record.capacity) * 100) : 0;
        const color = percent > 90 ? 'var(--color-danger)' : percent > 70 ? 'var(--color-warning)' : 'var(--color-success)';
        return (
          <div>
            <Progress percent={percent} size="small" strokeColor={color} />
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
              {record.allocated}/{record.capacity}
            </div>
          </div>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'availability',
      width: 100,
      render: (status: string) => {
        const map: Record<string, string> = { available: 'success', busy: 'warning', unavailable: 'error' };
        const labels: Record<string, string> = { available: '可用', busy: '忙碌', unavailable: '不可用' };
        return <Tag color={map[status] || 'default'}>{labels[status] || status}</Tag>;
      },
    },
    { title: '技能', dataIndex: 'skills', width: 200, render: (skills: string[]) => (
      <Space wrap>{skills.slice(0, 3).map((s) => <Tag key={s}>{s}</Tag>)}</Space>
    )},
    { title: '时薪', dataIndex: 'cost_per_hour', width: 100, render: (cost: number) => cost ? `${cost}/h` : '-' },
    {
      title: '操作', key: 'action', width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>资源管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建资源</Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select placeholder="筛选类型" allowClear style={{ width: 120 }}
            value={filters.type_filter || undefined}
            onChange={(value) => setFilters((prev) => ({ ...prev, type_filter: value || '' }))}
            options={[
              { label: '人员', value: 'human' },
              { label: '设备', value: 'equipment' },
              { label: '预算', value: 'budget' },
            ]}
          />
          <Select placeholder="筛选状态" allowClear style={{ width: 120 }}
            value={filters.availability || undefined}
            onChange={(value) => setFilters((prev) => ({ ...prev, availability: value || '' }))}
            options={[
              { label: '可用', value: 'available' },
              { label: '忙碌', value: 'busy' },
              { label: '不可用', value: 'unavailable' },
            ]}
          />
        </Space>
      </Card>

      <Card>
        <Table columns={columns} dataSource={data} rowKey="_id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal title={editingResource ? '编辑资源' : '新建资源'} open={modalOpen}
        onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="资源名称" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="human">人员</Select.Option>
              <Select.Option value="equipment">设备</Select.Option>
              <Select.Option value="budget">预算</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="分类（如：开发、测试、设计）" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="capacity" label="总容量">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="allocated" label="已分配">
              <Input type="number" />
            </Form.Item>
          </div>
          <Form.Item name="availability" label="可用性">
            <Select>
              <Select.Option value="available">可用</Select.Option>
              <Select.Option value="busy">忙碌</Select.Option>
              <Select.Option value="unavailable">不可用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cost_per_hour" label="时薪">
            <Input type="number" addonAfter="元/小时" />
          </Form.Item>
          <Form.Item name="skills" label="技能标签">
            <Select mode="tags" placeholder="输入技能后按回车" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Resources;
