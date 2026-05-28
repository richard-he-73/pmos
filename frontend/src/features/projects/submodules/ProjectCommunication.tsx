import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm, Tooltip, DatePicker, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Communication } from '../../../types/models';
import { useGetCommunicationsQuery, useCreateCommunicationMutation, useUpdateCommunicationMutation, useDeleteCommunicationMutation } from '../../../store/api';
import { useDataItems } from '../../../hooks/useDataItems';
import DataItemSelect from '../../../components/common/DataItemSelect';

const { Title } = Typography;
const { TextArea } = Input;

const ProjectCommunication: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Communication | null>(null);
  const [form] = Form.useForm();

  const { data: communications = [], isLoading: loading } = useGetCommunicationsQuery({ project_id: projectId });
  const [createCommunication] = useCreateCommunicationMutation();
  const [updateCommunication] = useUpdateCommunicationMutation();
  const [deleteCommunication] = useDeleteCommunicationMutation();
  const { items: communicationTypes } = useDataItems('communication_type');

  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: Communication) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
      participants: record.participants?.join(','),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        ...values,
        project_id: projectId,
        date: values.date?.toISOString(),
        participants: values.participants?.split(',').map((s: string) => s.trim()).filter(Boolean),
      };

      if (editing) {
        await updateCommunication({ id: editing._id, body: payload }).unwrap();
        message.success('沟通记录更新成功');
      } else {
        await createCommunication(payload).unwrap();
        message.success('沟通记录创建成功');
      }
      setModalOpen(false);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editing ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (record: Communication) => {
    try {
      await deleteCommunication(record._id).unwrap();
      message.success('沟通记录删除成功');
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Communication> = [
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '日期', dataIndex: 'date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '参与人数', dataIndex: 'participants', render: (p: string[]) => p?.length || 0 },
    { title: '地点', dataIndex: 'location', width: 120 },
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
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, display: 'inline' }}>
          <MessageOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          沟通管理
        </Title>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建记录</Button>
        </div>
        <Table columns={columns} dataSource={communications} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} locale={{ emptyText: '暂无数据' }} />
      </Card>

      <Modal
        title={editing ? '编辑沟通记录' : '新建沟通记录'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <DataItemSelect category="communication_type" />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="participants" label="参与人 (逗号分隔)">
            <Input placeholder="张三,李四" />
          </Form.Item>
          <Form.Item name="location" label="地点">
            <Input />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectCommunication;
