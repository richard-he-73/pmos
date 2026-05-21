import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, message, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { ConfigItem } from '../../types/models';
import { getConfigItems } from '../../api/modules';

const ConfigurationPage: React.FC = () => {
  const [data, setData] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getConfigItems();
        setData(Array.isArray(res) ? res : []);
      } catch (e) { message.error('获取配置数据失败'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const columns: ColumnsType<ConfigItem> = [
    { title: '配置名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '值', dataIndex: 'value', render: (v: string, r: ConfigItem) => r.is_sensitive ? '***' : v },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '分类', dataIndex: 'category' },
    { title: '敏感', dataIndex: 'is_sensitive', render: (v: boolean) => v ? <Tag color="red">是</Tag> : <Tag>否</Tag> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>配置管理</h3>
        <Button type="primary">新建配置项</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 15 }} />
    </Card>
  );
};

export default ConfigurationPage;
