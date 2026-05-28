import { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Select, Switch, Button, message, Tabs, Space, Modal, Tag, Table, Spin, Popconfirm } from 'antd';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getDataItems, createDataItem, updateDataItem, deleteDataItem, initializeDataItems, DATA_ITEM_CATEGORIES, type DataItem } from '../../services/dataItem';

const { Title } = Typography;
const { TextArea } = Input;

interface DataItemTabProps {
  category: string;
  categoryName: string;
}

const DataItemTab: React.FC<DataItemTabProps> = ({ category, categoryName }) => {
  const [items, setItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DataItem | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadItems();
  }, [category]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getDataItems(category);
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
      try {
        await initializeDataItems();
        const data = await getDataItems(category);
        setItems(data);
      } catch (initError) {
        message.error('加载数据项失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: DataItem) => {
    setEditingItem(item ? { ...item } : null);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
      form.setFieldsValue({ is_active: true, sort_order: items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 10 : 10 });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem && editingItem.id) {
        await updateDataItem(category, editingItem.id, values);
        message.success('数据项已更新');
      } else {
        await createDataItem(category, values);
        message.success('数据项已创建');
      }
      handleCloseModal();
      await loadItems();
    } catch (error: any) {
      message.error(error?.data?.detail || error?.message || '保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDataItem(category, id);
      message.success('数据项已删除');
      await loadItems();
    } catch (error: any) {
      message.error(error?.data?.detail || error?.message || '删除失败');
    }
  };

  const columns: ColumnsType<DataItem> = [
    { title: '编码', dataIndex: 'code', width: 120, sorter: (a, b) => a.code.localeCompare(b.code) },
    { title: '名称', dataIndex: 'name', width: 150 },
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
    { title: '排序', dataIndex: 'sort_order', width: 80, sorter: (a, b) => a.sort_order - b.sort_order },
    {
      title: '状态',
      dataIndex: 'is_active',
      width: 80,
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'gray'}>{isActive ? '启用' : '禁用'}</Tag>
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: DataItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>编辑</Button>
          <Popconfirm
            title="确定删除此数据项？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          新增{categoryName}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={loading}
        defaultSortOrder="ascend"
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 个${categoryName}` }}
        locale={{ emptyText: `暂无${categoryName}数据` }}
      />

      <Modal
        title={editingItem?.id ? `编辑${categoryName}` : `新增${categoryName}`}
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="back" onClick={handleCloseModal}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleSave}>保存</Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="编码" name="code" rules={[{ required: true, message: '请输入编码' }]}>
            <Input placeholder="请输入编码" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>
          <Form.Item label="排序" name="sort_order" rules={[{ required: true, message: '请输入排序号' }]}>
            <Input type="number" placeholder="请输入排序号" />
          </Form.Item>
          <Form.Item label="启用" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DataItemTab;
