import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BellOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getNotifications, updateNotification, deleteNotification, markAllRead, getUnreadCount } from '../../api/notifications';
import type { Notification } from '../../types/models';

const { Title } = Typography;

const Notifications: React.FC = () => {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, count] = await Promise.all([getNotifications(), getUnreadCount()]);
      setData(Array.isArray(res) ? res : []);
      setUnreadCount((count as any)?.unread_count || 0);
    } catch (error) { message.error('获取通知失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMarkRead = async (id: string) => {
    try { await updateNotification(id, { is_read: true }); message.success('已标记为已读'); fetchData(); }
    catch (error) { message.error('操作失败'); }
  };

  const handleMarkAllRead = async () => {
    try { await markAllRead(); message.success('全部已标记为已读'); fetchData(); }
    catch (error) { message.error('操作失败'); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteNotification(id); message.success('通知已删除'); fetchData(); }
    catch (error) { message.error('删除失败'); }
  };

  const typeColorMap: Record<string, string> = { info: 'blue', warning: 'orange', error: 'red', success: 'green', system: 'purple' };

  const columns: ColumnsType<Notification> = [
    { title: '标题', dataIndex: 'title', ellipsis: true, render: (title: string, record: Notification) => (
      <Space>
        {!record.is_read && <BellOutlined style={{ color: 'var(--color-accent)' }} />}
        <span style={{ fontWeight: record.is_read ? 400 : 600, color: record.is_read ? 'var(--color-muted)' : 'inherit' }}>{title}</span>
      </Space>
    )},
    { title: '类型', dataIndex: 'type', width: 100, render: (type: string) => <Tag color={typeColorMap[type]}>{type}</Tag> },
    { title: '状态', dataIndex: 'is_read', width: 80, render: (read: boolean) => <Tag color={read ? 'default' : 'processing'}>{read ? '已读' : '未读'}</Tag> },
    { title: '来源', dataIndex: 'source_type', width: 100 },
    { title: '操作', key: 'action', width: 150, render: (_, record) => (
      <Space>
        {!record.is_read && <Button type="link" size="small" onClick={() => handleMarkRead(record._id)}>标为已读</Button>}
        <Button type="link" size="small" onClick={() => { setSelectedNotif(record); setDetailModalOpen(true); }}>详情</Button>
        <Popconfirm title="删除通知？" onConfirm={() => handleDelete(record._id)}><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )},
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>通知中心 {unreadCount > 0 && <Tag color="red">{unreadCount} 未读</Tag>}</Title>
        <Button onClick={handleMarkAllRead}>全部标记为已读</Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 10, showTotal: (t: number) => `共 ${t} 项` }} />
      </Card>
      <Modal title="通知详情" open={detailModalOpen} onCancel={() => setDetailModalOpen(false)} footer={null}>
        {selectedNotif && (
          <div style={{ padding: '16px 0' }}>
            <h3 style={{ marginTop: 0 }}>{selectedNotif.title}</h3>
            <p>{selectedNotif.content}</p>
            <div style={{ display: 'flex', gap: 16, color: 'var(--color-muted)', fontSize: 12 }}>
              <span>类型: {selectedNotif.type}</span>
              <span>状态: {selectedNotif.is_read ? '已读' : '未读'}</span>
              <span>时间: {selectedNotif.created_at}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Notifications;
