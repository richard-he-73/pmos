import { useState } from 'react';
import { Card, Table, Button, Tag, message, Space, Popconfirm, Typography, Tooltip, Modal, Form, Input, Select, DatePicker, Input as AntInput } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { DrillPlan } from '../../types/models';
import { useGetDrillsQuery, useDeleteDrillMutation, useCreateDrillMutation, useUpdateDrillMutation } from '../../store/api';

const { Title } = Typography;
const { TextArea } = AntInput;

const DrillPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DrillPlan | null>(null);
  const [form] = Form.useForm();
  
  const { data: drills = [], isLoading: loading, refetch } = useGetDrillsQuery({});
  const [deleteDrill] = useDeleteDrillMutation();
  const [createDrill, { isLoading: isCreating }] = useCreateDrillMutation();
  const [updateDrill, { isLoading: isUpdating }] = useUpdateDrillMutation();

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: DrillPlan) => {
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
        scheduled_date: values.scheduled_date?.format('YYYY-MM-DD'),
        actual_date: values.actual_date?.format('YYYY-MM-DD'),
      };
      
      if (editingItem) {
        await updateDrill({ id: editingItem._id, body: payload }).unwrap();
        message.success('演练计划更新成功');
      } else {
        await createDrill(payload).unwrap();
        message.success('演练计划创建成功');
      }
      setModalOpen(false);
      refetch();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingItem ? '更新失败' : (error?.data?.detail || '创建失败'));
    }
  };

  const handleDelete = async (record: DrillPlan) => {
    try {
      await deleteDrill(record._id).unwrap();
      message.success('演练计划删除成功');
      refetch();
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<DrillPlan> = [
    { title: '演练名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
    { title: '计划日期', dataIndex: 'scheduled_date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '实际日期', dataIndex: 'actual_date', render: (d: string) => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
    { title: '参与人数', dataIndex: 'participants', render: (p: string[]) => p?.length || 0 },
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
        <Title level={4} style={{ margin: 0 }}>演练管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建演练
        </Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={drills} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} locale={{ emptyText: '暂无数据' }} />
      </Card>

      <Modal
        title={editingItem ? '编辑演练计划' : '新建演练计划'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="演练名称" rules={[{ required: true, message: '请输入演练名称' }]}>
            <Input placeholder="演练名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="演练描述" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select placeholder="选择类型">
              <Select.Option value="fire">火灾</Select.Option>
              <Select.Option value="disaster">灾害</Select.Option>
              <Select.Option value="security">安全</Select.Option>
              <Select.Option value="network">网络</Select.Option>
              <Select.Option value="database">数据库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select placeholder="选择状态">
              <Select.Option value="planned">计划中</Select.Option>
              <Select.Option value="in_progress">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="project_id" label="项目ID">
            <Input placeholder="项目ID" />
          </Form.Item>
          <Form.Item name="scheduled_date" label="计划日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="actual_date" label="实际日期">
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="participants" label="参与人员">
            <Select mode="tags" placeholder="输入参与人员后按回车" />
          </Form.Item>
          <Form.Item name="result" label="结果">
            <TextArea rows={2} placeholder="演练结果" />
          </Form.Item>
          <Form.Item name="lessons_learned" label="经验教训">
            <TextArea rows={2} placeholder="经验教训" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DrillPage;
