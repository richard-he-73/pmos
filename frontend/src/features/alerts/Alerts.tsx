import { useState, useEffect } from 'react';
import { Card, Typography, Button, message, Space, Tag, Alert, Tabs, Table, Badge } from 'antd';
import { BellOutlined, LeftCircleOutlined, SettingOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, BugOutlined, FilterOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getAlerts } from '../../api/resources';

const { Title } = Typography;

interface AlertItem {
  id: string;
  type: 'overdue' | 'due_soon' | 'budget_overrun' | 'project_delay' | 'risk' | 'defect';
  level: 'info' | 'warn' | 'crit';
  title: string;
  description: string;
  project_id?: string;
  project_name?: string;
  task_id?: string;
  task_title?: string;
  resource_id?: string;
  resource_name?: string;
  created_at: string;
  acknowledged: boolean;
}

const alertTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  overdue: { label: '超期预警', icon: <ClockCircleOutlined />, color: 'red' },
  due_soon: { label: '即将到期', icon: <SettingOutlined />, color: 'orange' },
  budget_overrun: { label: '预算超支', icon: <DollarOutlined />, color: 'red' },
  project_delay: { label: '项目延期', icon: <LeftCircleOutlined />, color: 'orange' },
  risk: { label: '风险预警', icon: <SettingOutlined />, color: 'purple' },
  defect: { label: '缺陷预警', icon: <BugOutlined />, color: 'red' },
};

const levelConfig: Record<string, { label: string; color: string }> = {
  info: { label: '信息', color: 'blue' },
  warn: { label: '警告', color: 'orange' },
  crit: { label: '严重', color: 'red' },
};

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await getAlerts();
      setAlerts(Array.isArray(res) ? res : []);
    } catch (error) {
      message.error('获取预警信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = activeTab === 'all' 
    ? alerts 
    : alerts.filter((a) => a.type === activeTab);

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter((a) => a.level === 'crit' && !a.acknowledged).length;

  const columns: ColumnsType<AlertItem> = [
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => {
        const config = alertTypeConfig[type];
        return <Tag color={config?.color}>{config?.label}</Tag>;
      },
    },
    {
      title: '级别',
      dataIndex: 'level',
      width: 80,
      render: (level: string) => {
        const config = levelConfig[level];
        return <Badge status={level === 'crit' ? 'error' : level === 'warn' ? 'warning' : 'processing'} text={config?.label} />;
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      render: (title: string, record: AlertItem) => (
        <div>
          <span style={{ fontWeight: record.level === 'crit' ? 700 : 500 }}>{title}</span>
          {!record.acknowledged && <Badge status="error" />}
        </div>
      ),
    },
    {
      title: '项目',
      dataIndex: 'project_name',
      width: 150,
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      dataIndex: 'acknowledged',
      width: 80,
      render: (ack: boolean) => (
        <span style={{ color: ack ? 'var(--color-success)' : 'var(--color-warning)' }}>
          {ack ? '已确认' : '待处理'}
        </span>
      ),
    },
  ];

  const typeTabs = [
    { key: 'all', label: `全部 (${alerts.length})` },
    { key: 'overdue', label: `超期预警 (${alerts.filter((a) => a.type === 'overdue').length})` },
    { key: 'due_soon', label: `即将到期 (${alerts.filter((a) => a.type === 'due_soon').length})` },
    { key: 'budget_overrun', label: `预算超支 (${alerts.filter((a) => a.type === 'budget_overrun').length})` },
    { key: 'project_delay', label: `项目延期 (${alerts.filter((a) => a.type === 'project_delay').length})` },
    { key: 'risk', label: `风险预警 (${alerts.filter((a) => a.type === 'risk').length})` },
    { key: 'defect', label: `缺陷预警 (${alerts.filter((a) => a.type === 'defect').length})` },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>预警中心</Title>
        <Space>
          <Button icon={<FilterOutlined />}>筛选</Button>
          <Button icon={<SyncOutlined />} onClick={fetchAlerts} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-accent-light)' }}>
            <BellOutlined style={{ color: 'var(--color-accent)' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value mono-value">{alerts.length}</div>
            <div className="stat-label">预警总数</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-danger-light)' }}>
            <LeftCircleOutlined style={{ color: 'var(--color-danger)' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value mono-value" style={{ color: 'var(--color-danger)' }}>{criticalCount}</div>
            <div className="stat-label">严重预警</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-light)' }}>
            <SettingOutlined style={{ color: 'var(--color-warning)' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value mono-value" style={{ color: 'var(--color-warning)' }}>{unacknowledgedCount}</div>
            <div className="stat-label">待处理</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-light)' }}>
            <CheckCircleOutlined style={{ color: 'var(--color-success)' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value mono-value" style={{ color: 'var(--color-success)' }}>{alerts.length - unacknowledgedCount}</div>
            <div className="stat-label">已确认</div>
          </div>
        </Card>
      </div>

      {criticalCount > 0 && (
        <Alert
          message={`有 ${criticalCount} 个严重预警需要处理`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={typeTabs.map((tab) => ({ key: tab.key, label: tab.label }))}>
          <div style={{ padding: 16 }}>
            {filteredAlerts.length > 0 ? (
              <Table
                columns={columns}
                dataSource={filteredAlerts}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                size="small"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
                <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                <div>暂无预警信息</div>
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </>
  );
};

export default Alerts;