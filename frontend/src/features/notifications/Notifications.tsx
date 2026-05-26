import { useState } from 'react';
import { Table, Button, Modal, Tag, message, Space, Popconfirm, Card, Typography, Tooltip } from 'antd';
import { DeleteOutlined, BellOutlined, CheckOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkNotificationReadMutation, useDeleteNotificationMutation, useMarkAllNotificationsReadMutation } from '../../store/api';
import type { Notification } from '../../types/models';

const { Title } = Typography;

const Notifications: React.FC = () => {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const { data: notifications = [], isLoading: loading, refetch } = useGetNotificationsQuery();
  const { data: unreadCountData } = useGetUnreadCountQuery();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markAllNotificationsRead] = useMarkAllNotificationsReadMutation();

  const unreadCount = (unreadCountData as any)?.unread_count || 0;

  const handleMarkRead = async (id: string) => {
    try { await markNotificationRead(id).unwrap(); message.success('已标记为已读'); }
    catch (error) { message.error('操作失败'); }
  };

  const handleMarkAllRead = async () => {
    try { await markAllNotificationsRead().unwrap(); message.success('全部已标记为已读'); }
    catch (error) { message.error('操作失败'); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteNotification(id).unwrap(); message.success('通知已删除'); }
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
        {!record.is_read && <Tooltip title="标为已读"><Button type="text" size="small" icon={<CheckOutlined />} onClick={() => handleMarkRead(record._id)} /></Tooltip>}
        <Tooltip title="详情"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedNotif(record); setDetailModalOpen(true); }} /></Tooltip>
        <Popconfirm title="删除通知？" onConfirm={() => handleDelete(record._id)}><Tooltip title="删除"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Tooltip></Popconfirm>
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
        <Table columns={columns} dataSource={notifications} rowKey="_id" loading={loading} pagination={{ pageSize: 10, showTotal: (t: number) => `共 ${t} 项` }} locale={{ emptyText: '暂无数据' }} />
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
