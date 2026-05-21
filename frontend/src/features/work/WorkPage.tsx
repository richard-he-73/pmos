import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { WorkRecord } from '../../types/models';
import { getWorkRecords, createWorkRecord, updateWorkRecord, deleteWorkRecord } from '../../api/modules';

const WorkPage: React.FC = () => {
  const [data, setData] = useState<WorkRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getWorkRecords();
        setData(Array.isArray(res) ? res : []);
      } catch (e) { message.error('获取工时数据失败'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleDelete = async (record: WorkRecord) => {
    try {
      await deleteWorkRecord(record._id);
      message.success('工时记录删除成功');
      fetchData();
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<WorkRecord> = [
    { title: '用户', dataIndex: 'user_id', render: (v: string) => <span className="mono-value">{v?.substring(0, 8)}...</span> },
    { title: '日期', dataIndex: 'date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '工时', dataIndex: 'hours', render: (h: number) => <span className="mono-value">{h}h</span> },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>工作管理（考勤/工时）</h3>
        <Button type="primary" icon={<PlusOutlined />}>新建记录</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default WorkPage;
