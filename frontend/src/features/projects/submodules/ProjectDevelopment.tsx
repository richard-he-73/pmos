import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm, Card, Typography, DatePicker, Tabs, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, CodeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useGetIterationsQuery, useCreateIterationMutation, useUpdateIterationMutation, useDeleteIterationMutation, useGetCodeReviewsQuery, useCreateCodeReviewMutation, useUpdateCodeReviewMutation } from '../../../store/api';
import type { Iteration, CodeReview } from '../../../types/models';
import { ITERATION_STATUS, CODE_REVIEW_STATUS } from '../../../utils/constants';
import { useDataItems } from '../../../hooks/useDataItems';
import DataItemSelect from '../../../components/common/DataItemSelect';

const { Title } = Typography;
const { TextArea } = Input;

const ProjectDevelopment: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items: developmentStatuses } = useDataItems('development_status');
  
  const [iterationModalOpen, setIterationModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingIteration, setEditingIteration] = useState<Iteration | null>(null);
  const [iterationForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  const { data: iterations = [], isLoading: loading } = useGetIterationsQuery({ project_id: projectId });
  const { data: codeReviews = [] } = useGetCodeReviewsQuery({ project_id: projectId });
  const [createIteration] = useCreateIterationMutation();
  const [updateIteration] = useUpdateIterationMutation();
  const [deleteIteration] = useDeleteIterationMutation();
  const [createCodeReview] = useCreateCodeReviewMutation();
  const [updateCodeReview] = useUpdateCodeReviewMutation();

  const handleCreateIteration = () => {
    setEditingIteration(null);
    iterationForm.resetFields();
    setIterationModalOpen(true);
  };

  const handleEditIteration = (record: Iteration) => {
    setEditingIteration(record);
    iterationForm.setFieldsValue({
      ...record,
      start_date: dayjs(record.start_date),
      end_date: record.end_date ? dayjs(record.end_date) : null,
    });
    setIterationModalOpen(true);
  };

  const handleSubmitIteration = async () => {
    try {
      const values = await iterationForm.validateFields();
      const payload = {
        ...values,
        project_id: projectId,
        start_date: values.start_date?.toISOString(),
        end_date: values.end_date?.toISOString(),
      };

      if (editingIteration) {
        await updateIteration({ id: editingIteration._id, body: payload }).unwrap();
        message.success('迭代更新成功');
      } else {
        await createIteration(payload).unwrap();
        message.success('迭代创建成功');
      }
      setIterationModalOpen(false);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingIteration ? '更新失败' : '创建失败');
    }
  };

  const handleDeleteIteration = async (id: string) => {
    try {
      await deleteIteration(id).unwrap();
      message.success('迭代已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreateReview = () => {
    reviewForm.resetFields();
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      const values = await reviewForm.validateFields();
      await createCodeReview({
        ...values,
        project_id: projectId,
        reviewer_id: 'reviewer_id_placeholder',
        author_id: 'author_id_placeholder',
      }).unwrap();
      message.success('评审创建成功');
      setReviewModalOpen(false);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error('创建失败');
    }
  };

  const handleUpdateReviewStatus = async (id: string, status: CodeReview['status']) => {
    try {
      await updateCodeReview({ id, body: { status } }).unwrap();
      message.success('评审状态已更新');
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const iterationColumns: ColumnsType<Iteration> = [
    {
      title: '迭代名称',
      dataIndex: 'name',
      width: 200,
      render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { planning: 'default', active: 'processing', completed: 'success', cancelled: 'error' };
        return <Tag color={colorMap[status] || 'default'}>{ITERATION_STATUS[status as keyof typeof ITERATION_STATUS] || status}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 150,
      render: (progress: number) => (
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: 4 }}>{Math.round(progress)}%</div>
          <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 6 }}>
            <div style={{ background: 'var(--color-accent)', height: 6, borderRadius: 4, width: `${progress}%` }} />
          </div>
        </div>
      ),
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      width: 120,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '任务数',
      dataIndex: 'tasks',
      width: 80,
      render: (tasks: string[]) => <span className="mono-value">{tasks?.length || 0}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditIteration(record)} />
          </Tooltip>
          <Popconfirm title="确定删除此迭代？" onConfirm={() => handleDeleteIteration(record._id)}>
            <Tooltip title="删除">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const reviewColumns: ColumnsType<CodeReview> = [
    {
      title: '任务ID',
      dataIndex: 'task_id',
      width: 150,
      render: (id: string) => <span className="mono-value">{id}</span>,
    },
    {
      title: '评审人',
      dataIndex: 'reviewer_id',
      width: 120,
    },
    {
      title: '作者',
      dataIndex: 'author_id',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { pending: 'default', approved: 'success', rejected: 'error', needs_changes: 'warning' };
        return <Tag color={colorMap[status] || 'default'}>{CODE_REVIEW_STATUS[status as keyof typeof CODE_REVIEW_STATUS] || status}</Tag>;
      },
    },
    {
      title: '评论',
      dataIndex: 'comment',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Tooltip title="通过">
                <Button type="text" size="small" icon={<CheckCircleOutlined />} onClick={() => handleUpdateReviewStatus(record._id, 'approved' as const)} />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button type="text" size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleUpdateReviewStatus(record._id, 'rejected' as const)} />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, display: 'inline' }}>
          <CodeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          开发管理
        </Title>
      </div>

      <Tabs
        defaultActiveKey="iterations"
        items={[
          {
            key: 'iterations',
            label: '迭代管理',
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateIteration}>
                    新建迭代
                  </Button>
                </div>
                <Table
                  columns={iterationColumns}
                  dataSource={iterations}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
                  scroll={{ x: 1000 }}
                  locale={{ emptyText: '暂无数据' }}
                />
              </Card>
            ),
          },
          {
            key: 'codeReviews',
            label: '代码评审',
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateReview}>
                    新建评审
                  </Button>
                </div>
                <Table
                  columns={reviewColumns}
                  dataSource={codeReviews}
                  rowKey="_id"
                  loading={loading}
                  locale={{ emptyText: '暂无数据' }}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
                  scroll={{ x: 1000 }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={editingIteration ? '编辑迭代' : '新建迭代'}
        open={iterationModalOpen}
        onOk={handleSubmitIteration}
        onCancel={() => setIterationModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={iterationForm} layout="vertical">
          <Form.Item name="name" label="迭代名称" rules={[{ required: true, message: '请输入迭代名称' }]}>
            <Input placeholder="如 Sprint 1" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="迭代描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="planning">规划中</Select.Option>
              <Select.Option value="active">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="start_date" label="开始日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="end_date" label="结束日期">
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="progress" label="进度 (%)">
            <Input type="number" min={0} max={100} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建代码评审"
        open={reviewModalOpen}
        onOk={handleSubmitReview}
        onCancel={() => setReviewModalOpen(false)}
        width={500}
        okText="确定"
        cancelText="取消"
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item name="task_id" label="任务ID" rules={[{ required: true, message: '请输入任务ID' }]}>
            <Input placeholder="任务ID" />
          </Form.Item>
          <Form.Item name="comment" label="评论">
            <TextArea rows={3} placeholder="评审评论" />
          </Form.Item>
          <Form.Item name="code_url" label="代码链接">
            <Input placeholder="代码仓库链接" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDevelopment;
