import { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Table, Button, Modal, Form, Input, Select, Tag, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Communication, ConfigItem, DrillPlan, DeploymentPlan, WorkRecord } from '../../types/models';

const { Title } = Typography;
const { TextArea } = Input;

const CommunicationModule: React.FC = () => {
  const [data, setData] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Communication | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { getCommunications, createCommunication, updateCommunication, deleteCommunication } = await import('../../api/modules');
      const res = await getCommunications();
      setData(Array.isArray(res) ? res : []);
    } catch (e) { message.error('获取数据失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const columns: ColumnsType<Communication> = [
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
    { title: '日期', dataIndex: 'date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '参与人数', dataIndex: 'participants', render: (p: string[]) => p?.length || 0 },
    { title: '地点', dataIndex: 'location', width: 120 },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新建记录</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

const ConfigModule: React.FC = () => {
  const [data, setData] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { getConfigItems } = await import('../../api/modules');
        const res = await getConfigItems();
        setData(Array.isArray(res) ? res : []);
      } catch (e) { message.error('获取配置失败'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const columns: ColumnsType<ConfigItem> = [
    { title: '配置名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '值', dataIndex: 'value', render: (v: string, r: ConfigItem) => r.is_sensitive ? '***' : v },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
    { title: '分类', dataIndex: 'category' },
    { title: '敏感', dataIndex: 'is_sensitive', render: (v: boolean) => v ? <Tag color="red">是</Tag> : <Tag>否</Tag> },
  ];

  return (
    <Card>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 15 }} />
    </Card>
  );
};

const DrillModule: React.FC = () => {
  const [data, setData] = useState<DrillPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { getDrills } = await import('../../api/modules');
        const res = await getDrills();
        setData(Array.isArray(res) ? res : []);
      } catch (e) { message.error('获取演练数据失败'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const columns: ColumnsType<DrillPlan> = [
    { title: '演练名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
    { title: '计划日期', dataIndex: 'scheduled_date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '参与人数', dataIndex: 'participants', render: (p: string[]) => p?.length || 0 },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />}>新建演练</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

const DeploymentModule: React.FC = () => {
  const [data, setData] = useState<DeploymentPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { getDeployments } = await import('../../api/modules');
        const res = await getDeployments();
        setData(Array.isArray(res) ? res : []);
      } catch (e) { message.error('获取投产数据失败'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const columns: ColumnsType<DeploymentPlan> = [
    { title: '投产名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '版本', dataIndex: 'version', render: (v: string) => <Tag>{v}</Tag> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
    { title: '计划日期', dataIndex: 'scheduled_date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '结果', dataIndex: 'result', ellipsis: true },
  ];

  return (
    <Card>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

const WorkModule: React.FC = () => {
  const [data, setData] = useState<WorkRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { getWorkRecords } = await import('../../api/modules');
        const res = await getWorkRecords();
        setData(Array.isArray(res) ? res : []);
      } catch (e) { message.error('获取工时数据失败'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const columns: ColumnsType<WorkRecord> = [
    { title: '用户', dataIndex: 'user_id', render: (v: string) => <span className="mono-value">{v?.substring(0, 8)}</span> },
    { title: '日期', dataIndex: 'date', render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '工时', dataIndex: 'hours', render: (h: number) => <span className="mono-value">{h}h</span> },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
  ];

  return (
    <Card>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

interface Phase2ModulesProps {
  defaultModule?: string;
}

const Phase2Modules: React.FC<Phase2ModulesProps> = ({ defaultModule = 'communication' }) => (
  <>
    <Title level={4} style={{ marginBottom: 16 }}>Phase 2 业务模块</Title>
    <Tabs defaultActiveKey={defaultModule} items={[
      { key: 'communication', label: '沟通管理', children: <CommunicationModule /> },
      { key: 'configuration', label: '配置管理', children: <ConfigModule /> },
      { key: 'drill', label: '演练管理', children: <DrillModule /> },
      { key: 'deployment', label: '投产管理', children: <DeploymentModule /> },
      { key: 'work', label: '工作管理', children: <WorkModule /> },
    ]} />
  </>
);

export default Phase2Modules;
