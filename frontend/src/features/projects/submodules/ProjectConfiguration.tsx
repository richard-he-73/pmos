import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Typography, Modal, Form, Input, Select, Switch, message, Space, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ConfigItem } from '../../../types/models';
import { useGetConfigItemsQuery, useCreateConfigItemMutation, useUpdateConfigItemMutation, useDeleteConfigItemMutation } from '../../../store/api';
import { useDataItems } from '../../../hooks/useDataItems';
import DataItemSelect from '../../../components/common/DataItemSelect';

const { Title } = Typography;
const { TextArea } = Input;

const ProjectConfiguration: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [form] = Form.useForm();
  
  const { items: configTypes } = useDataItems('config_type');
  
  const { data: configItems = [], isLoading: loading, refetch } = useGetConfigItemsQuery({ project_id: projectId });
  const [createConfigItem, { isLoading: isCreating }] = useCreateConfigItemMutation();
  const [updateConfigItem, { isLoading: isUpdating }] = useUpdateConfigItemMutation();
  const [deleteConfigItem] = useDeleteConfigItemMutation();

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: ConfigItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, project_id: projectId };
      
      if (editingItem) {
        await updateConfigItem({ id: editingItem._id, body: payload }).unwrap();
        message.success('配置项更新成功');
      } else {
        await createConfigItem(payload).unwrap();
        message.success('配置项创建成功');
      }
      setModalOpen(false);
      refetch();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingItem ? '更新失败' : (error?.data?.detail || '创建失败'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConfigItem(id).unwrap();
      message.success('配置项已删除');
      refetch();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<ConfigItem> = [
    { title: '配置名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '值', dataIndex: 'value', render: (v: string, r: ConfigItem) => r.is_sensitive ? '***' : v },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '分类', dataIndex: 'category' },
    { title: '敏感', dataIndex: 'is_sensitive', render: (v: boolean) => v ? <Tag color="red">是</Tag> : <Tag>否</Tag> },
    { title: '操作', key: 'action', width: 150, render: (_, record) => (
      <Space>
        <Tooltip title="编辑">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        </Tooltip>
        <Popconfirm title="确定删除此配置项？" onConfirm={() => handleDelete(record._id)}>
          <Tooltip title="删除">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      </Space>
    ) },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, display: 'inline' }}>
          <SettingOutlined style={{ marginRight: 8, color: '#595959' }} />
          配置管理
        </Title>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建配置项
          </Button>
        </div>
        <Table columns={columns} dataSource={configItems} rowKey="_id" loading={loading} pagination={{ pageSize: 15 }} locale={{ emptyText: '暂无数据' }} />
      </Card>

      <Modal
        title={editingItem ? '编辑配置项' : '新建配置项'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="配置名称" rules={[{ required: true, message: '请输入配置名称' }]}>
            <Input placeholder="配置名称" />
          </Form.Item>
          <Form.Item name="value" label="值">
            <TextArea rows={3} placeholder="配置值" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <DataItemSelect category="config_type" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="分类" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={2} placeholder="配置描述" />
          </Form.Item>
          <Form.Item name="is_sensitive" label="敏感配置" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectConfiguration;
