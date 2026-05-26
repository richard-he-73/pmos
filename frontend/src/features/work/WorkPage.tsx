import { useState } from 'react';
import { Card, Table, Button, Tag, message, Space, Popconfirm, Typography, Tooltip, Modal, Form, Input, Select, DatePicker, Input as AntInput, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { WorkRecord } from '../../types/models';
import { useGetWorkRecordsQuery, useDeleteWorkRecordMutation, useCreateWorkRecordMutation, useUpdateWorkRecordMutation } from '../../store/api';

const { Title } = Typography;
const { TextArea } = AntInput;

const WorkPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkRecord | null>(null);
  const [form] = Form.useForm();
  
  const { data: workRecords = [], isLoading: loading, refetch } = useGetWorkRecordsQuery({});
  const [deleteWorkRecord] = useDeleteWorkRecordMutation();
  const [createWorkRecord, { isLoading: isCreating }] = useCreateWorkRecordMutation();
  const [updateWorkRecord, { isLoading: isUpdating }] = useUpdateWorkRecordMutation();

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: WorkRecord) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        ...values,
        date: values.date?.format('YYYY-MM-DD'),
      };
      
      if (editingItem) {
        await updateWorkRecord({ id: editingItem._id, body: payload }).unwrap();
        message.success('工时记录更新成功');
      } else {
        await createWorkRecord(payload).unwrap();
        message.success('工时记录创建成功');
      }
      setModalOpen(false);
      refetch();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingItem ? '更新失败' : (error?.data?.detail || '创建失败'));
    }
  };

  const handleDelete = async (record: WorkRecord) => {
    try {
      await deleteWorkRecord(record._id).unwrap();
      message.success('工时记录删除成功');
      refetch();
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<WorkRecord> = [
    { title: '用户', dataIndex: 'user_id', render: (v: string) => <span className="mono-value">{v?.substring(0, 8)}...</span> },
    { title: '项目', dataIndex: 'project_id', render: (v: string) => v ? <span className="mono-value">{v?.substring(0, 8)}...</span> : '-' },
    { title: '日期', dataIndex: 'date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '工时', dataIndex: 'hours', render: (h: number) => <span className="mono-value">{h}人天</span> },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
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
        <Title level={4} style={{ margin: 0 }}>工作管理（考勤/工时）</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建记录
        </Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={workRecords} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} locale={{ emptyText: '暂无数据' }} />
      </Card>

      <Modal
        title={editingItem ? '编辑工时记录' : '新建工时记录'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="user_id" label="用户ID" rules={[{ required: true, message: '请输入用户ID' }]}>
            <Input placeholder="用户ID" />
          </Form.Item>
          <Form.Item name="project_id" label="项目ID">
            <Input placeholder="项目ID" />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="hours" label="工时" rules={[{ required: true, message: '请输入工时' }]}>
            <InputNumber style={{ width: '100%' }} min={0} max={24} step={0.5} placeholder="工时（人天）" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select placeholder="选择类型">
              <Select.Option value="work">工作</Select.Option>
              <Select.Option value="overtime">加班</Select.Option>
              <Select.Option value="leave">请假</Select.Option>
              <Select.Option value="training">培训</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="工作描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select placeholder="选择状态">
              <Select.Option value="submitted">已提交</Select.Option>
              <Select.Option value="approved">已批准</Select.Option>
              <Select.Option value="rejected">已拒绝</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WorkPage;
