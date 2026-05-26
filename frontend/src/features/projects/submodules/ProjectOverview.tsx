import { Card, Row, Col, Typography, Statistic, Progress, Tag, Space, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined, FolderOpenOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useGetProjectQuery, useGetTasksQuery, useGetRisksQuery } from '../../../store/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProjectOverview: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useGetProjectQuery(projectId!, { skip: !projectId });
  const { data: tasks = [] } = useGetTasksQuery({ project_id: projectId }, { skip: !projectId });
  const { data: risks = [] } = useGetRisksQuery({ project_id: projectId }, { skip: !projectId });

  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  const activeRisks = risks.filter((r: any) => r.status === 'active').length;
  const highRisks = risks.filter((r: any) => r.priority === 'high' || r.priority === 'critical').length;

  if (projectLoading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/projects')}
            style={{ marginRight: 16 }}
          >
            返回项目列表
          </Button>
          <Title level={3} style={{ margin: 0, display: 'inline' }}>
            {project?.name}
          </Title>
        </div>
        <Tag color={project?.status === 'active' ? 'green' : 'blue'}>
          {project?.status === 'active' ? '进行中' : '规划中'}
        </Tag>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="任务总数"
              value={tasks.length}
              prefix={<FolderOpenOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成进度"
              value={progress}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
            <Progress percent={progress} size="small" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃风险"
              value={activeRisks}
              prefix={<WarningOutlined />}
            />
            {highRisks > 0 && (
              <Text type="danger" style={{ fontSize: 12 }}>
                包含 {highRisks} 个高优先级风险
              </Text>
            )}
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={project?.team_members?.length || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="项目信息">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">项目编号：</Text>
                <Text>{project?.code}</Text>
              </div>
              <div>
                <Text type="secondary">开始日期：</Text>
                <Text>{dayjs(project?.start_date).format('YYYY-MM-DD')}</Text>
              </div>
              <div>
                <Text type="secondary">结束日期：</Text>
                <Text>{project?.end_date ? dayjs(project?.end_date).format('YYYY-MM-DD') : '-'}</Text>
              </div>
              <div>
                <Text type="secondary">描述：</Text>
                <Text>{project?.description || '暂无描述'}</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="快速访问">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block onClick={() => navigate(`/projects/${projectId}/tasks`)}>
                查看任务
              </Button>
              <Button block onClick={() => navigate(`/projects/${projectId}/resources`)}>
                查看资源
              </Button>
              <Button block onClick={() => navigate(`/projects/${projectId}/risks`)}>
                查看风险
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectOverview;