import { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Communication } from '../../types/models';
import { getCommunications, createCommunication, updateCommunication, deleteCommunication } from '../../api/modules';

const { Title } = Typography;
const { TextArea } = Input;

const CommunicationPage: React.FC = () => {
  const [data, setData] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Communication | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCommunications();
      setData(Array.isArray(res) ? res : []);
    } catch (e) { message.error('获取沟通记录失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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
        date: values.date?.toISOString(),
        participants: values.participants?.split(',').map((s: string) => s.trim()).filter(Boolean),
      };

      if (editing) {
        await updateCommunication(editing._id, payload);
        message.success('沟通记录更新成功');
      } else {
        await createCommunication(payload);
        message.success('沟通记录创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editing ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (record: Communication) => {
    try {
      await deleteCommunication(record._id);
      message.success('沟通记录删除成功');
      fetchData();
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
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>沟通管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建记录</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title={editing ? '编辑沟通记录' : '新建沟通记录'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="meeting">会议</Select.Option>
              <Select.Option value="call">电话</Select.Option>
              <Select.Option value="email">邮件</Select.Option>
              <Select.Option value="chat">聊天</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <Input type="date" />
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

export default CommunicationPage;
