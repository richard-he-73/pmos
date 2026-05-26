import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Popconfirm, Card, Typography, Progress, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useGetRisksQuery, useCreateRiskMutation, useUpdateRiskMutation, useDeleteRiskMutation } from '../../store/api';
import { RISK_STATUS, RISK_SEVERITY } from '../../utils/constants';

const RISK_LIKELIHOOD = {
  low: '低',
  medium: '中',
  high: '高',
};

const RISK_IMPACT = {
  low: '低',
  medium: '中',
  high: '高',
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'low': return 'green';
    case 'medium': return 'orange';
    case 'high': return 'red';
    default: return 'blue';
  }
};

const getRiskLevel = (likelihood: string, impact: string) => {
  if (likelihood === 'high' || impact === 'high') return RISK_SEVERITY.high;
  if (likelihood === 'medium' || impact === 'medium') return RISK_SEVERITY.medium;
  return RISK_SEVERITY.low;
};

const { Title } = Typography;
const { TextArea } = Input;

const Risks: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<any>(null);
  const [filters, setFilters] = useState({ status: '', project_id: '' });
  const [form] = Form.useForm();

  const { data: risks = [], isLoading, refetch } = useGetRisksQuery(filters);
  const [createRisk, { isLoading: isCreating }] = useCreateRiskMutation();
  const [updateRisk, { isLoading: isUpdating }] = useUpdateRiskMutation();
  const [deleteRisk] = useDeleteRiskMutation();

  const handleCreate = () => {
    setEditingRisk(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRisk(record);
    form.setFieldsValue({
      ...record,
      identified_at: record.identified_at ? dayjs(record.identified_at) : null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        ...values,
        identified_at: values.identified_at?.toISOString(),
      };

      if (editingRisk) {
        await updateRisk({ id: editingRisk._id, body: payload }).unwrap();
        message.success('风险更新成功');
      } else {
        await createRisk(payload).unwrap();
        message.success('风险创建成功');
      }
      setModalOpen(false);
      refetch();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingRisk ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRisk(id).unwrap();
      message.success('风险已删除');
      refetch();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateRisk({ id, body: { status } }).unwrap();
      message.success('状态已更新');
      refetch();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: '风险标题',
      dataIndex: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '风险等级',
      dataIndex: 'risk_level',
      width: 100,
      render: (_, record: any) => {
        const level = getRiskLevel(record.likelihood, record.impact);
        return (
          <Tag color={getRiskColor(level)}>
            {level}
          </Tag>
        );
      },
    },
    {
      title: '可能性',
      dataIndex: 'likelihood',
      width: 100,
      render: (value: string) => RISK_LIKELIHOOD[value as keyof typeof RISK_LIKELIHOOD],
    },
    {
      title: '影响',
      dataIndex: 'impact',
      width: 100,
      render: (value: string) => RISK_IMPACT[value as keyof typeof RISK_IMPACT],
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string, record: any) => (
        <Select
          size="small"
          value={status}
          style={{ width: 100 }}
          onChange={(newStatus: string) => handleStatusChange(record._id, newStatus)}
          options={Object.entries(RISK_STATUS).map(([key, label]) => ({ value: key, label }))}
        />
      ),
    },
    {
      title: '责任人',
      dataIndex: 'owner',
      width: 120,
    },
    {
      title: '识别日期',
      dataIndex: 'identified_at',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
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
          <Popconfirm title="确定删除此风险？" onConfirm={() => handleDelete(record._id)}>
            <Tooltip title="删除">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: Array.isArray(risks) ? risks.length : 0,
    open: Array.isArray(risks) ? risks.filter((r: any) => r.status === 'open').length : 0,
    closed: Array.isArray(risks) ? risks.filter((r: any) => r.status === 'closed').length : 0,
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>风险管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增风险
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>总风险数</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{stats.total}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>开放风险</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{stats.open}</div>
            {stats.total > 0 && (
              <Progress
                percent={Math.round((stats.open / stats.total) * 100)}
                strokeColor="var(--color-accent)"
                size="small"
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>已关闭</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--color-success)' }}>{stats.closed}</div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={Array.isArray(risks) ? risks : []}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>

      <Modal
        title={editingRisk ? '编辑风险' : '新增风险'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="风险标题" rules={[{ required: true, message: '请输入风险标题' }]}>
            <Input placeholder="风险标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="风险描述" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="likelihood" label="可能性" rules={[{ required: true }]}>
                <Select>
                  {Object.entries(RISK_LIKELIHOOD).map(([key, label]) => (
                    <Select.Option key={key} value={key}>{label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="impact" label="影响" rules={[{ required: true }]}>
                <Select>
                  {Object.entries(RISK_IMPACT).map(([key, label]) => (
                    <Select.Option key={key} value={key}>{label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="mitigation_strategy" label="缓解策略">
            <TextArea rows={2} placeholder="缓解策略" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]} initialValue="open">
            <Select>
              {Object.entries(RISK_STATUS).map(([key, label]) => (
                <Select.Option key={key} value={key}>{label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="owner" label="责任人">
            <Input placeholder="责任人" />
          </Form.Item>
          <Form.Item name="identified_at" label="识别日期">
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Risks;
