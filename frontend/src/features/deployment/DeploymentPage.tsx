import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { DeploymentPlan } from '../../types/models';
import { getDeployments, createDeployment, updateDeployment, deleteDeployment } from '../../api/modules';

const DeploymentPage: React.FC = () => {
  const [data, setData] = useState<DeploymentPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDeployments();
        setData(Array.isArray(res) ? res : []);
      } catch (e) { message.error('获取投产数据失败'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleDelete = async (record: DeploymentPlan) => {
    try {
      await deleteDeployment(record._id);
      message.success('投产计划删除成功');
      fetchData();
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<DeploymentPlan> = [
    { title: '投产名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '版本', dataIndex: 'version', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
    { title: '计划日期', dataIndex: 'scheduled_date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '实际日期', dataIndex: 'actual_date', render: (d: string) => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
    { title: '环境', dataIndex: 'environment', render: (e: string) => <Tag>{e}</Tag> },
    { title: '结果', dataIndex: 'result', ellipsis: true },
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
        <h3>投产管理</h3>
        <Button type="primary" icon={<PlusOutlined />}>新建投产</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default DeploymentPage;
