import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, message, Space, Popconfirm, Typography, Tooltip, Modal, Form, Input, Select, DatePicker, Input as AntInput } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { DeploymentPlan } from '../../../types/models';
import { useGetDeploymentsQuery, useDeleteDeploymentMutation, useCreateDeploymentMutation, useUpdateDeploymentMutation } from '../../../store/api';

const { Title } = Typography;
const { TextArea } = AntInput;

const ProjectDeployment: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DeploymentPlan | null>(null);
  const [form] = Form.useForm();
  
  const { data: deployments = [], isLoading: loading, refetch } = useGetDeploymentsQuery({ project_id: projectId });
  const [deleteDeployment] = useDeleteDeploymentMutation();
  const [createDeployment, { isLoading: isCreating }] = useCreateDeploymentMutation();
  const [updateDeployment, { isLoading: isUpdating }] = useUpdateDeploymentMutation();

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: DeploymentPlan) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      scheduled_date: record.scheduled_date ? dayjs(record.scheduled_date) : null,
      actual_date: record.actual_date ? dayjs(record.actual_date) : null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        ...values,
        project_id: projectId,
        scheduled_date: values.scheduled_date?.format('YYYY-MM-DD'),
        actual_date: values.actual_date?.format('YYYY-MM-DD'),
      };
      
      if (editingItem) {
        await updateDeployment({ id: editingItem._id, body: payload }).unwrap();
        message.success('投产计划更新成功');
      } else {
        await createDeployment(payload).unwrap();
        message.success('投产计划创建成功');
      }
      setModalOpen(false);
      refetch();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingItem ? '更新失败' : (error?.data?.detail || '创建失败'));
    }
  };

  const handleDelete = async (record: DeploymentPlan) => {
    try {
      await deleteDeployment(record._id).unwrap();
      message.success('投产计划删除成功');
      refetch();
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<DeploymentPlan> = [
    { title: '投产名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '版本', dataIndex: 'version', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
    { title: '计划日期', dataIndex: 'scheduled_date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '实际日期', dataIndex: 'actual_date', render: (d: string) => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
    { title: '环境', dataIndex: 'environment', render: (e: string) => e ? <Tag>{e}</Tag> : '-' },
    { title: '结果', dataIndex: 'result', ellipsis: true },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record)}>
            <Tooltip title="删除">
              <Button type="text" size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<LeftOutlined />} onClick={() => navigate(`/projects/${projectId}`)}>返回概览</Button>
          <Title level={4} style={{ margin: 0 }}>投产管理</Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建投产
        </Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={deployments} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} locale={{ emptyText: '暂无数据' }} />
      </Card>

      <Modal
        title={editingItem ? '编辑投产计划' : '新建投产计划'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="投产名称" rules={[{ required: true, message: '请输入投产名称' }]}>
            <Input placeholder="投产名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="投产描述" />
          </Form.Item>
          <Form.Item name="version" label="版本">
            <Input placeholder="版本号" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select placeholder="选择状态">
              <Select.Option value="planned">计划中</Select.Option>
              <Select.Option value="approved">已批准</Select.Option>
              <Select.Option value="deploying">部署中</Select.Option>
              <Select.Option value="success">成功</Select.Option>
              <Select.Option value="failed">失败</Select.Option>
              <Select.Option value="rolled_back">已回滚</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="scheduled_date" label="计划日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="actual_date" label="实际日期">
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="rollback_plan" label="回滚计划">
            <TextArea rows={2} placeholder="回滚计划" />
          </Form.Item>
          <Form.Item name="approver_id" label="批准人ID">
            <Input placeholder="批准人ID" />
          </Form.Item>
          <Form.Item name="deployed_by" label="部署人">
            <Input placeholder="部署人" />
          </Form.Item>
          <Form.Item name="result" label="结果">
            <TextArea rows={2} placeholder="投产结果" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProjectDeployment;
