import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm, Card, Typography, Progress, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getRisks, createRisk, updateRisk, deleteRisk } from '../../api/risks';
import type { Risk } from '../../types/models';
import { RISK_STATUS, RISK_CATEGORY, PRIORITY } from '../../utils/constants';

const { Title } = Typography;
const { TextArea } = Input;

const Risks: React.FC = () => {
  const [data, setData] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRisks();
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      message.error('获取风险列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingRisk(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: Risk) => {
    setEditingRisk(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        project_id: values.project_id || 'default_project',
        owner_id: 'owner_id_placeholder',
      };

      if (editingRisk) {
        await updateRisk(editingRisk._id, payload);
        message.success('风险更新成功');
      } else {
        await createRisk(payload);
        message.success('风险创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingRisk ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRisk(id);
      message.success('风险已删除');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 7) return 'red';
    if (severity >= 4) return 'orange';
    return 'green';
  };

  const columns: ColumnsType<Risk> = [
    {
      title: '风险标题',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
      render: (title: string) => <span style={{ fontWeight: 600 }}>{title}</span>,
    },
    {
      title: '类别',
      dataIndex: 'category',
      width: 100,
      render: (category: string) => <Tag>{RISK_CATEGORY[category as keyof typeof RISK_CATEGORY] || category}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          identified: 'default',
          assessed: 'blue',
          mitigating: 'orange',
          closed: 'success',
        };
        return <Tag color={colorMap[status] || 'default'}>{RISK_STATUS[status as keyof typeof RISK_STATUS] || status}</Tag>;
      },
    },
    {
      title: '概率',
      dataIndex: 'probability',
      width: 80,
      render: (probability: string) => {
        const colorMap: Record<string, string> = { low: 'green', medium: 'orange', high: 'red' };
        return <Tag color={colorMap[probability] || 'default'}>{PRIORITY[probability as keyof typeof PRIORITY]}</Tag>;
      },
    },
    {
      title: '影响',
      dataIndex: 'impact',
      width: 80,
      render: (impact: string) => {
        const colorMap: Record<string, string> = { low: 'green', medium: 'orange', high: 'red' };
        return <Tag color={colorMap[impact] || 'default'}>{PRIORITY[impact as keyof typeof PRIORITY]}</Tag>;
      },
    },
    {
      title: '严重度',
      dataIndex: 'severity',
      width: 100,
      render: (severity: number) => (
        <Tooltip title={`严重度: ${severity}/10`}>
          <Progress
            percent={severity * 10}
            size="small"
            strokeColor={getSeverityColor(severity)}
            format={() => severity}
          />
        </Tooltip>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space wrap>
          {tags.slice(0, 2).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {tags.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除此风险？" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>风险管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建风险
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingRisk ? '编辑风险' : '新建风险'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="风险标题" rules={[{ required: true, message: '请输入风险标题' }]}>
            <Input placeholder="请输入风险标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="风险详细描述" />
          </Form.Item>
          <Form.Item name="category" label="风险类别" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="technical">技术风险</Select.Option>
              <Select.Option value="schedule">进度风险</Select.Option>
              <Select.Option value="budget">预算风险</Select.Option>
              <Select.Option value="resource">资源风险</Select.Option>
              <Select.Option value="external">外部风险</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="probability" label="发生概率" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="impact" label="影响程度" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="identified">已识别</Select.Option>
              <Select.Option value="assessed">已评估</Select.Option>
              <Select.Option value="mitigating">缓解中</Select.Option>
              <Select.Option value="closed">已关闭</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="mitigation_plan" label="缓解计划">
            <TextArea rows={3} placeholder="风险缓解计划" />
          </Form.Item>
          <Form.Item name="contingency_plan" label="应急计划">
            <TextArea rows={3} placeholder="风险应急计划" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Risks;
