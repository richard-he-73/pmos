import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { DrillPlan } from '../../types/models';
import { getDrills, createDrill, updateDrill, deleteDrill } from '../../api/modules';

const DrillPage: React.FC = () => {
  const [data, setData] = useState<DrillPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDrills();
        setData(Array.isArray(res) ? res : []);
      } catch (e) { message.error('获取演练数据失败'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleDelete = async (record: DrillPlan) => {
    try {
      await deleteDrill(record._id);
      message.success('演练计划删除成功');
      fetchData();
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
        <h3>演练管理</h3>
        <Button type="primary" icon={<PlusOutlined />}>新建演练</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default DrillPage;
