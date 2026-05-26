import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Card, Descriptions, Button, Spin, Tag, Progress, Space, Typography, Result, Modal, Select, Input, message, Table, Form, DatePicker, InputNumber, Tree, Input as AntInput } from 'antd';
import { FolderOutlined, SwapOutlined, PlusOutlined, UserOutlined, TeamOutlined, SnippetsOutlined, DashboardOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatDateTime } from '../../utils/formatters';
import { 
  useGetProjectQuery, 
  useGetDetailTasksQuery, 
  useGetResourcesQuery, 
  useAddTeamMemberMutation, 
  useRemoveTeamMemberMutation,
  useGetDataDictionariesQuery,
  useGetProjectStatusFlowQuery,
  useTransitionProjectStatusMutation
} from '../../store/api';
import { TeamMemberCard } from '../../components/common/TeamMemberCard';
import { OrgStructureCard } from '../../components/common/OrgStructureCard';
import type { Project, Task, Resource, DataDictionary } from '../../types/models';
import { PROJECT_STATUS, PRIORITY, TASK_STATUS } from '../../utils/constants';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOrgNode, setSelectedOrgNode] = useState('');
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [editOrgNode, setEditOrgNode] = useState<any>(null);
  const [orgForm] = Form.useForm();

  const { data: project, isLoading: projectLoading, refetch } = useGetProjectQuery(id!, { skip: !id });
  const { data: detailTasksData } = useGetDetailTasksQuery(id, { skip: !id });
  const { data: resourcesData } = useGetResourcesQuery('human');
  const { data: dataDictionaries = [] } = useGetDataDictionariesQuery();
  const { data: statusFlowData } = useGetProjectStatusFlowQuery(id!, { skip: !id });
  
  const [addTeamMember] = useAddTeamMemberMutation();
  const [removeTeamMember] = useRemoveTeamMemberMutation();
  const [transitionStatus] = useTransitionProjectStatusMutation();
  
  const detailTasks = (detailTasksData as any) || [];
  const resources = (resourcesData as any) || [];

  const projectRoles: DataDictionary[] = dataDictionaries.filter(d => d.category === 'project_role');
  const orgLevels: DataDictionary[] = dataDictionaries.filter(d => d.category === 'org_level');

  const handleAddTeamMember = async () => {
    if (!id || !selectedMember) return;
    try {
      const payload: any = {
        member_id: selectedMember,
      };
      if (selectedRole) {
        payload.role = selectedRole;
      }
      if (selectedOrgNode) {
        payload.org_node_id = selectedOrgNode;
      }
      await addTeamMember({ projectId: id, memberId: selectedMember, body: payload }).unwrap();
      message.success('团队成员添加成功');
      setTeamModalOpen(false);
      setSelectedMember('');
      setSelectedRole('');
      setSelectedOrgNode('');
      refetch();
    } catch (error) {
      console.error('Error adding team member:', error);
      message.error('添加失败');
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!id) return;
    try {
      await removeTeamMember({ projectId: id, memberId }).unwrap();
      message.success('团队成员移除成功');
      refetch();
    } catch (error) {
      console.error('Error removing team member:', error);
      message.error('移除失败');
    }
  };

  const handleStatusChange = async () => {
    if (!id) return;
    try {
      await transitionStatus({ projectId: id, body: { new_status: newStatus, reason: statusReason } }).unwrap();
      message.success('项目状态更新成功');
      setStatusModalOpen(false);
      setNewStatus('');
      setStatusReason('');
      refetch();
    } catch (error: any) {
      console.error('Error updating status:', error);
      message.error(error?.data?.detail || '状态更新失败');
    }
  };

  const handleOrgSubmit = async () => {
    if (!id) return;
    try {
      const values = await orgForm.validateFields();
      const orgNode: any = {
        id: editOrgNode?.id || `org_${Date.now()}`,
        name: values.name,
        org_level: values.org_level,
        parent_id: values.parent_id || null,
      };
      
      const currentOrgStructure = project?.org_structure || [];
      let newOrgStructure;
      
      if (editOrgNode) {
        newOrgStructure = currentOrgStructure.map((o: any) => 
          o.id === editOrgNode.id ? orgNode : o
        );
      } else {
        newOrgStructure = [...currentOrgStructure, orgNode];
      }
      
      await updateProject({ id, body: { org_structure: newOrgStructure } }).unwrap();
      message.success(editOrgNode ? '组织节点更新成功' : '组织节点添加成功');
      setOrgModalOpen(false);
      setEditOrgNode(null);
      orgForm.resetFields();
      refetch();
    } catch (error) {
      console.error('Error saving org node:', error);
      message.error('保存失败');
    }
  };

  const handleRemoveOrgNode = async (nodeId: string) => {
    if (!id) return;
    try {
      const currentOrgStructure = project?.org_structure || [];
      const newOrgStructure = currentOrgStructure.filter((o: any) => o.id !== nodeId);
      await updateProject({ id, body: { org_structure: newOrgStructure } }).unwrap();
      message.success('组织节点删除成功');
      refetch();
    } catch (error) {
      console.error('Error removing org node:', error);
      message.error('删除失败');
    }
  };

  const teamTab = (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>团队成员 ({project?.team_members?.length || 0})</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setTeamModalOpen(true)}>添加成员</Button>
      </div>
      {project?.team_members?.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {project.team_members.map((memberId) => {
            const member = resources.find((r: Resource) => r._id === memberId);
            const memberRole = project.team_members_with_roles?.find(m => m.member_id === memberId);
            const orgNode = memberRole?.org_node_id 
              ? project.org_structure?.find((o: any) => o.id === memberRole.org_node_id) 
              : null;
            return (
              <TeamMemberCard
                key={memberId}
                memberId={memberId}
                name={member?.name || memberId}
                role={memberRole?.role ? (projectRoles.find(r => r.value === memberRole.role)?.name || memberRole.role) : undefined}
                orgNode={orgNode?.name}
                type={member?.type}
                onRemove={handleRemoveTeamMember}
              />
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
          <UserOutlined style={{ fontSize: 48, marginBottom: 12 }} />
          <div>暂无团队成员</div>
          <div style={{ fontSize: 12 }}>点击上方按钮添加成员</div>
        </div>
      )}
    </Card>
  );

  const orgTab = (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>组织架构</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditOrgNode(null);
          orgForm.resetFields();
          setOrgModalOpen(true);
        }}>添加节点</Button>
      </div>
      {project?.org_structure?.length ? (
        <OrgStructureCard
          nodes={project.org_structure}
          levelNames={orgLevels.reduce((acc, level) => {
            acc[level.value] = level.name;
            return acc;
          }, {})}
          onEdit={(node) => {
            setEditOrgNode(node);
            orgForm.setFieldsValue({
              name: node.name,
              org_level: node.org_level,
              parent_id: node.parent_id,
            });
            setOrgModalOpen(true);
          }}
          onDelete={handleRemoveOrgNode}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
          <TeamOutlined style={{ fontSize: 48, marginBottom: 12 }} />
          <div>暂无组织架构</div>
          <div style={{ fontSize: 12 }}>点击上方按钮添加组织节点</div>
        </div>
      )}
    </Card>
  );

  const projectOverviewTab = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={2}>{project?.name}</Title>
          <Text type="secondary">{project?.code}</Text>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DashboardOutlined style={{ fontSize: 20, color: 'var(--color-accent)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>项目状态</div>
              <div style={{ fontWeight: 600 }}>{PROJECT_STATUS[project?.status as keyof typeof PROJECT_STATUS] || project?.status}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'oklch(60% 0.15 170 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TeamOutlined style={{ fontSize: 20, color: 'oklch(58% 0.16 145)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>团队成员</div>
              <div style={{ fontWeight: 600 }}>{project?.team_members?.length || 0} 人</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'oklch(55% 0.14 250 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SnippetsOutlined style={{ fontSize: 20, color: 'oklch(55% 0.14 250)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>任务数量</div>
              <div style={{ fontWeight: 600 }}>{detailTasks.length} 项</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'oklch(70% 0.12 80 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarOutlined style={{ fontSize: 20, color: 'oklch(70% 0.12 80)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>预算总额</div>
              <div style={{ fontWeight: 600 }}>{project?.budget?.total ? `¥${project.budget.total.toLocaleString()}` : '-'}</div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 16 }}>
        <Card title="项目信息">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="项目编号">{project?.code}</Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={PRIORITY[project?.priority as keyof typeof PRIORITY]?.color || 'default'}>
                {PRIORITY[project?.priority as keyof typeof PRIORITY]?.label || '未知'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">{dayjs(project?.start_date).format('YYYY-MM-DD')}</Descriptions.Item>
            <Descriptions.Item label="结束日期">{project?.end_date ? dayjs(project.end_date).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>{formatDateTime(project?.created_at)}</Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{project?.description || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="状态变更">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 4 }}>当前状态</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color={PROJECT_STATUS[project?.status as keyof typeof PROJECT_STATUS]?.color || 'default'}>
                  {PROJECT_STATUS[project?.status as keyof typeof PROJECT_STATUS] || project?.status}
                </Tag>
                <Button type="text" icon={<SwapOutlined />} onClick={() => setStatusModalOpen(true)}>变更</Button>
              </div>
            </div>
            {project?.status_reason && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 4 }}>变更原因</div>
                <div style={{ fontSize: 12, background: 'var(--color-bg-secondary)', padding: 8, borderRadius: 4 }}>
                  {project?.status_reason}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const budgetTab = (
    <Card>
      <Title level={5} style={{ marginBottom: 16 }}>预算概览</Title>
      {project?.budget ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            <Card>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 4 }}>总预算</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>¥{project?.budget?.total?.toLocaleString()}</div>
            </Card>
            <Card>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 4 }}>已使用</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>¥{project?.budget?.used?.toLocaleString()}</div>
            </Card>
            <Card>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 4 }}>剩余预算</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>¥{(project?.budget?.total! - project?.budget?.used!).toLocaleString()}</div>
            </Card>
          </div>
          <Card>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>预算使用进度</div>
            <Progress 
              percent={Math.round((project?.budget?.used! / project?.budget?.total!) * 100)} 
              strokeColor={{
                '0%': '#10b981',
                '50%': '#f59e0b',
                '100%': '#ef4444',
              }}
              showInfo={false}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
              <span>已使用 {Math.round((project?.budget?.used! / project?.budget?.total!) * 100)}%</span>
              <span>剩余 {Math.round(((project?.budget?.total! - project?.budget?.used!) / project?.budget?.total!) * 100)}%</span>
            </div>
          </Card>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
          <DollarOutlined style={{ fontSize: 48, marginBottom: 12 }} />
          <div>暂无预算信息</div>
        </div>
      )}
    </Card>
  );

  if (projectLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <Result
        status="404"
        title="项目不存在"
        subTitle="您访问的项目不存在或已被删除"
        extra={
          <Button type="primary" onClick={() => navigate('/projects')}>
            返回项目列表
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, display: 'inline' }}>
          <FolderOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {project?.name}
        </Title>
      </div>

      <Tabs
        defaultActiveKey="overview"
        items={[
          { 
            key: 'overview', 
            label: <span><DashboardOutlined /> 项目概览</span>, 
            children: projectOverviewTab
          },
          { 
            key: 'budget', 
            label: <span><DollarOutlined /> 项目预算</span>, 
            children: budgetTab
          },
          { 
            key: 'org', 
            label: <span><TeamOutlined /> 组织架构</span>, 
            children: orgTab
          },
          { 
            key: 'team', 
            label: <span><UserOutlined /> 团队成员</span>, 
            children: teamTab
          },
        ]}
      />

      <Modal
        title="添加团队成员"
        open={teamModalOpen}
        onOk={handleAddTeamMember}
        onCancel={() => { 
          setTeamModalOpen(false); 
          setSelectedMember('');
          setSelectedRole('');
          setSelectedOrgNode('');
        }}
        okText="确认添加"
        okButtonProps={{ disabled: !selectedMember }}
      >
        <Form layout="vertical">
          <Form.Item label="选择成员" required>
            <Select
              style={{ width: '100%' }}
              value={selectedMember || undefined}
              onChange={setSelectedMember}
              placeholder="请选择要添加的成员"
              options={resources
                .filter((r: Resource) => !project?.team_members?.includes(r._id))
                .map((r: Resource) => ({ label: r.name, value: r._id }))}
            />
          </Form.Item>
          <Form.Item label="项目角色">
            <Select
              style={{ width: '100%' }}
              value={selectedRole || undefined}
              onChange={setSelectedRole}
              placeholder="请选择项目角色"
              allowClear
              options={projectRoles.map(r => ({ label: r.name, value: r.value }))}
            />
          </Form.Item>
          <Form.Item label="组织节点">
            <Select
              style={{ width: '100%' }}
              value={selectedOrgNode || undefined}
              onChange={setSelectedOrgNode}
              placeholder="请选择组织节点"
              allowClear
              options={
                project?.org_structure?.map((o: any) => ({
                  label: o.name,
                  value: o.id,
                })) || []
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editOrgNode ? '编辑组织节点' : '添加组织节点'}
        open={orgModalOpen}
        onOk={handleOrgSubmit}
        onCancel={() => {
          setOrgModalOpen(false);
          setEditOrgNode(null);
          orgForm.resetFields();
        }}
        okText="确认保存"
      >
        <Form form={orgForm} layout="vertical">
          <Form.Item label="节点名称" name="name" rules={[{ required: true, message: '请输入节点名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="组织层级" name="org_level" rules={[{ required: true, message: '请选择组织层级' }]}>
            <Select placeholder="请选择组织层级">
              {orgLevels.map(level => (
                <Select.Option key={level.value} value={level.value}>{level.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="上级节点" name="parent_id">
            <Select placeholder="请选择上级节点（可选）" allowClear>
              {project?.org_structure?.filter((o: any) => o.id !== editOrgNode?.id).map((o: any) => (
                <Select.Option key={o.id} value={o.id}>{o.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="变更项目状态"
        open={statusModalOpen}
        onOk={handleStatusChange}
        onCancel={() => {
          setStatusModalOpen(false);
          setNewStatus('');
          setStatusReason('');
        }}
        okText="确认变更"
        okButtonProps={{ disabled: !newStatus }}
      >
        <Form layout="vertical">
          <Form.Item label="当前状态" style={{ marginBottom: 16 }}>
            <Tag color={PROJECT_STATUS[project?.status as keyof typeof PROJECT_STATUS]?.color || 'default'}>
              {PROJECT_STATUS[project?.status as keyof typeof PROJECT_STATUS]?.label || project?.status}
            </Tag>
          </Form.Item>
          <Form.Item label="目标状态" required>
            <Select
              value={newStatus}
              onChange={setNewStatus}
              placeholder="请选择目标状态"
              options={statusFlowData?.allowed_transitions?.map((t: any) => ({
                label: `${PROJECT_STATUS[t.status]?.label || t.status}${t.description ? ` - ${t.description}` : ''}`,
                value: t.status,
              })) || []}
            />
          </Form.Item>
          <Form.Item label="变更原因">
            <TextArea rows={3} value={statusReason} onChange={(e) => setStatusReason(e.target.value)} placeholder="请输入变更原因（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
