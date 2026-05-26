import { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Select, Switch, Button, message, Tabs, Space, Modal, Tag, Table, Avatar, Popconfirm, InputNumber, Spin, Checkbox } from 'antd';
import { SaveOutlined, UserOutlined, BellOutlined, IeOutlined, AlertOutlined, GlobalOutlined, PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, DatabaseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useUser } from '../../contexts/UserContext';
import { 
  useChangePasswordMutation,
  useGetDataDictionariesQuery,
  useCreateDataDictionaryMutation,
  useUpdateDataDictionaryMutation,
  useDeleteDataDictionaryMutation,
  useInitializeDataDictionariesMutation
} from '../../store/api';
import { settingsApi, type Role, type UserGroup, type NotificationSettings, type SecuritySettings, type AppearanceSettings } from '../../api/settings';
import type { DataDictionary } from '../../types/models';

const { Title } = Typography;
const { TextArea } = Input;

const CATEGORY_NAMES: Record<string, string> = {
  'user_role': '用户角色',
  'project_role': '项目角色',
  'org_level': '组织层级',
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [dictCategoryFilter, setDictCategoryFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const { currentUser, setCurrentUser } = useUser();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [changePassword] = useChangePasswordMutation();

  // Data Dictionaries
  const { data: dataDictionaries = [], isLoading: dictLoading, refetch: refetchDictionaries } = useGetDataDictionariesQuery();
  const [createDataDictionary] = useCreateDataDictionaryMutation();
  const [updateDataDictionary] = useUpdateDataDictionaryMutation();
  const [deleteDataDictionary] = useDeleteDataDictionaryMutation();
  const [initializeDataDictionaries] = useInitializeDataDictionariesMutation();

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotification: true,
    inAppNotification: true,
    browserNotification: false,
    taskReminder: true,
    riskAlert: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginNotification: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'light',
    accentColor: '#1890ff',
    fontSize: 'medium',
    compactLayout: false,
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [activePermTab, setActivePermTab] = useState('roles');

  const [dictModalOpen, setDictModalOpen] = useState(false);
  const [editingDict, setEditingDict] = useState<DataDictionary | null>(null);
  const [dictForm] = Form.useForm();

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setSettingsLoading(true);
    try {
      const [profile, notifications, security, appearance, rolesData, groupsData] = await Promise.all([
        settingsApi.getUserProfile().catch(() => ({
          username: currentUser?.username || '',
          display_name: currentUser?.display_name || '',
          email: currentUser?.email || '',
          phone: '',
          department: '',
          position: '',
          bio: '',
        })),
        settingsApi.getNotificationSettings().catch(() => ({
          emailNotification: true,
          inAppNotification: true,
          browserNotification: false,
          taskReminder: true,
          riskAlert: true,
        })),
        settingsApi.getSecuritySettings().catch(() => ({
          twoFactorAuth: false,
          loginNotification: true,
        })),
        settingsApi.getAppearanceSettings().catch(() => ({
          theme: 'light' as const,
          accentColor: '#1890ff',
          fontSize: 'medium' as const,
          compactLayout: false,
        })),
        settingsApi.getRoles().catch(() => []),
        settingsApi.getUserGroups().catch(() => []),
      ]);

      profileForm.setFieldsValue({
        username: profile.username,
        display_name: profile.display_name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        position: profile.position,
        bio: profile.bio,
      });

      setNotificationSettings(notifications);
      setSecuritySettings(security);
      setAppearanceSettings(appearance);
      setRoles(rolesData);
      setGroups(groupsData);

      // Initialize data dictionaries if empty
      if (dataDictionaries.length === 0) {
        await initializeDataDictionaries();
        await refetchDictionaries();
      }
    } catch {
      message.error('加载设置失败');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleOpenDictModal = (dict?: DataDictionary, defaultCategory?: string) => {
    setEditingDict(dict ? { ...dict } : null);
    if (dict) {
      dictForm.setFieldsValue(dict);
    } else {
      dictForm.resetFields();
      const category = defaultCategory || '';
      let sortOrder = 1000;
      if (category) {
        const categoryDicts = dataDictionaries.filter(d => d.category === category);
        if (categoryDicts.length > 0) {
          const maxSortOrder = Math.max(...categoryDicts.map(d => d.sort_order || 0));
          sortOrder = maxSortOrder + 10;
        }
      }
      dictForm.setFieldsValue({ category, sort_order: sortOrder, is_active: true });
    }
    setDictModalOpen(true);
  };

  const handleCloseDictModal = () => {
    setDictModalOpen(false);
    setEditingDict(null);
  };

  const handleSaveDict = async () => {
    try {
      const values = await dictForm.validateFields();
      if (editingDict && editingDict._id) {
        await updateDataDictionary({ id: editingDict._id, body: values });
        message.success('数据字典已更新');
      } else {
        await createDataDictionary(values);
        message.success('数据字典已创建');
      }
      handleCloseDictModal();
    } catch (error: any) {
      message.error(error?.data?.detail || error?.message || '保存失败');
    }
  };

  const handleDeleteDict = async (id: string) => {
    try {
      await deleteDataDictionary(id);
      message.success('数据字典已删除');
    } catch (error: any) {
      message.error(error?.data?.detail || error?.message || '删除失败');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (activeTab === 'profile') {
        const values = await profileForm.validateFields();
        await settingsApi.updateUserProfile(values);
        if (currentUser) {
          setCurrentUser({ ...currentUser, ...values });
        }
        message.success('个人信息已保存');
      } else if (activeTab === 'notification') {
        await settingsApi.updateNotificationSettings(notificationSettings);
        message.success('通知设置已保存');
      } else if (activeTab === 'security') {
        await settingsApi.updateSecuritySettings(securitySettings);
        message.success('安全设置已保存');
      } else if (activeTab === 'appearance') {
        await settingsApi.updateAppearanceSettings(appearanceSettings);
        localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
        message.success('外观设置已保存');
      }
    } catch (error: any) {
      message.error(error?.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error?.data?.detail || '密码修改失败');
    }
  };

  const handleOpenRoleModal = (role?: Role) => {
    setEditingRole(role ? { ...role } : null);
    setRoleModalOpen(true);
  };

  const handleCloseRoleModal = () => {
    setRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleSaveRole = async () => {
    if (!editingRole) return;

    try {
      if (editingRole.id) {
        await settingsApi.updateRole(editingRole.id, editingRole);
        setRoles(roles.map(r => r.id === editingRole.id ? editingRole : r));
        message.success('角色已更新');
      } else {
        const newRole = await settingsApi.createRole(editingRole);
        setRoles([...roles, newRole]);
        message.success('角色已创建');
      }
      handleCloseRoleModal();
    } catch (error: any) {
      message.error(error?.message || '保存失败');
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await settingsApi.deleteRole(id);
      setRoles(roles.filter(r => r.id !== id));
      message.success('角色已删除');
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  const handleOpenGroupModal = (group?: UserGroup) => {
    setEditingGroup(group ? { ...group } : null);
    setGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleSaveGroup = async () => {
    if (!editingGroup) return;

    try {
      if (editingGroup.id) {
        await settingsApi.updateUserGroup(editingGroup.id, editingGroup);
        setGroups(groups.map(g => g.id === editingGroup.id ? editingGroup : g));
        message.success('用户组已更新');
      } else {
        const newGroup = await settingsApi.createUserGroup(editingGroup);
        setGroups([...groups, newGroup]);
        message.success('用户组已创建');
      }
      handleCloseGroupModal();
    } catch (error: any) {
      message.error(error?.message || '保存失败');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await settingsApi.deleteUserGroup(id);
      setGroups(groups.filter(g => g.id !== id));
      message.success('用户组已删除');
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  const roleColumns: ColumnsType<Role> = [
    { title: '角色名称', dataIndex: 'name', width: 150 },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      width: 250
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      width: 100,
      render: (perms: string[]) => perms.includes('all') ? '全部' : perms.length
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'gray'}>{status ? '启用' : '禁用'}</Tag>
      )
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: Role) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenRoleModal(record)}>编辑</Button>
          <Popconfirm
            title="确定删除此角色？"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const groupColumns: ColumnsType<UserGroup> = [
    { title: '用户组名称', dataIndex: 'name', width: 150 },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      width: 200
    },
    {
      title: '成员数量',
      dataIndex: 'members',
      width: 100,
      render: (members: string[]) => members.length
    },
    {
      title: '关联角色',
      dataIndex: 'role_name',
      width: 120,
      render: (roleName: string) => <Tag color="blue">{roleName}</Tag>
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: UserGroup) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenGroupModal(record)}>编辑</Button>
          <Popconfirm
            title="确定删除此用户组？"
            onConfirm={() => handleDeleteGroup(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const dictColumns: ColumnsType<DataDictionary> = [
    { 
      title: '分类', 
      dataIndex: 'category', 
      width: 120, 
      render: (category: string) => {
        const displayName = CATEGORY_NAMES[category] || category;
        return <Tag color="blue">{displayName}</Tag>;
      } 
    },
    { title: '编码', dataIndex: 'code', width: 120 },
    { title: '名称', dataIndex: 'name', width: 150 },
    { title: '值', dataIndex: 'value', width: 100 },
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
    { title: '排序', dataIndex: 'sort_order', width: 80, render: (order: number) => order || '-' },
    {
      title: '状态',
      dataIndex: 'is_active',
      width: 80,
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'gray'}>{isActive ? '启用' : '禁用'}</Tag>
    },
    {
      title: '系统',
      dataIndex: 'is_system',
      width: 80,
      render: (isSystem: boolean) => isSystem ? <Tag color="orange">系统</Tag> : '-'
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: DataDictionary) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenDictModal(record)}>编辑</Button>
          {!record.is_system && (
            <Popconfirm
              title="确定删除此数据字典？"
              onConfirm={() => handleDeleteDict(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      )
    },
  ];

  const profileFormComponent = (
    <Form form={profileForm} layout="vertical">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <Form.Item label="用户名" name="username">
          <Input prefix={<UserOutlined />} placeholder="用户名" disabled />
        </Form.Item>
        <Form.Item label="显示名称" name="display_name" rules={[{ required: true, message: '请输入显示名称' }]}>
          <Input placeholder="显示名称" />
        </Form.Item>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
          <Input prefix={<GlobalOutlined />} type="email" placeholder="邮箱地址" />
        </Form.Item>
        <Form.Item label="电话" name="phone">
          <Input placeholder="手机号码" />
        </Form.Item>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <Form.Item label="部门" name="department">
          <Select placeholder="选择部门">
            <Select.Option value="技术部">技术部</Select.Option>
            <Select.Option value="研发部">研发部</Select.Option>
            <Select.Option value="测试部">测试部</Select.Option>
            <Select.Option value="产品部">产品部</Select.Option>
            <Select.Option value="运维部">运维部</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="职位" name="position">
          <Input placeholder="职位" />
        </Form.Item>
      </div>
      <Form.Item label="简介" name="bio">
        <TextArea rows={4} placeholder="个人简介" />
      </Form.Item>
    </Form>
  );

  const notificationFormComponent = (
    <div>
      <Card title="消息通知" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>邮件通知</div>
              <div style={{ fontSize: 12, color: '#666' }}>接收重要事件的邮件提醒</div>
            </div>
            <Switch
              checked={notificationSettings.emailNotification}
              onChange={(checked) => setNotificationSettings(s => ({ ...s, emailNotification: checked }))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>站内通知</div>
              <div style={{ fontSize: 12, color: '#666' }}>在系统内显示通知消息</div>
            </div>
            <Switch
              checked={notificationSettings.inAppNotification}
              onChange={(checked) => setNotificationSettings(s => ({ ...s, inAppNotification: checked }))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>浏览器推送</div>
              <div style={{ fontSize: 12, color: '#666' }}>允许浏览器发送推送通知</div>
            </div>
            <Switch
              checked={notificationSettings.browserNotification}
              onChange={(checked) => setNotificationSettings(s => ({ ...s, browserNotification: checked }))}
            />
          </div>
        </Form>
      </Card>
      <Card title="事件提醒">
        <Form layout="vertical">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>任务截止提醒</div>
              <div style={{ fontSize: 12, color: '#666' }}>任务截止前24小时提醒</div>
            </div>
            <Switch
              checked={notificationSettings.taskReminder}
              onChange={(checked) => setNotificationSettings(s => ({ ...s, taskReminder: checked }))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>风险预警通知</div>
              <div style={{ fontSize: 12, color: '#666' }}>项目风险状态变更时通知</div>
            </div>
            <Switch
              checked={notificationSettings.riskAlert}
              onChange={(checked) => setNotificationSettings(s => ({ ...s, riskAlert: checked }))}
            />
          </div>
        </Form>
      </Card>
    </div>
  );

  const securityFormComponent = (
    <div>
      <Card title="密码安全" style={{ marginBottom: 16 }}>
        <Form form={passwordForm} layout="vertical">
          <Form.Item label="当前密码" name="currentPassword" rules={[{ required: true, message: '请输入当前密码' }]}>
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item label="新密码" name="newPassword" rules={[{ required: true, message: '请输入新密码' }, { min: 8, message: '密码至少8位' }]}>
            <Input.Password placeholder="请输入新密码（至少8位）" />
          </Form.Item>
          <Form.Item label="确认新密码" name="confirmPassword" rules={[{ required: true, message: '请再次输入新密码' }]}>
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Button type="primary" onClick={handleChangePassword} loading={loading}>修改密码</Button>
        </Form>
      </Card>
      <Card title="安全设置">
        <Form layout="vertical">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>双因素认证</div>
              <div style={{ fontSize: 12, color: '#666' }}>启用后登录需要额外验证</div>
            </div>
            <Switch
              checked={securitySettings.twoFactorAuth}
              onChange={(checked) => {
                setSecuritySettings(s => ({ ...s, twoFactorAuth: checked }));
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>登录通知</div>
              <div style={{ fontSize: 12, color: '#666' }}>新设备登录时发送通知</div>
            </div>
            <Switch
              checked={securitySettings.loginNotification}
              onChange={(checked) => {
                setSecuritySettings(s => ({ ...s, loginNotification: checked }));
              }}
            />
          </div>
        </Form>
      </Card>
    </div>
  );

  const appearanceFormComponent = (
    <div>
      <Card title="主题设置" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="主题模式">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { value: 'light', label: '浅色模式', icon: '☀️' },
                { value: 'dark', label: '深色模式', icon: '🌙' },
                { value: 'auto', label: '跟随系统', icon: '💻' },
              ].map((item) => (
                <div
                  key={item.value}
                  style={{
                    padding: 16,
                    border: `2px solid ${appearanceSettings.theme === item.value ? '#1890ff' : '#d9d9d9'}`,
                    borderRadius: 8,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: appearanceSettings.theme === item.value ? '#e6f7ff' : 'transparent',
                  }}
                  onClick={() => setAppearanceSettings(s => ({ ...s, theme: item.value as 'light' | 'dark' | 'auto' }))}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                  <div>{item.label}</div>
                </div>
              ))}
            </div>
          </Form.Item>
          <Form.Item label="主题色">
            <div style={{ display: 'flex', gap: 12 }}>
              {['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'].map((color) => (
                <button
                  key={color}
                  type="button"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: color,
                    border: appearanceSettings.accentColor === color ? '3px solid #1890ff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: appearanceSettings.accentColor === color ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  }}
                  onClick={() => setAppearanceSettings(s => ({ ...s, accentColor: color }))}
                />
              ))}
            </div>
          </Form.Item>
        </Form>
      </Card>
      <Card title="显示设置">
        <Form layout="vertical">
          <Form.Item label="字体大小">
            <Select
              value={appearanceSettings.fontSize}
              onChange={(value) => setAppearanceSettings(s => ({ ...s, fontSize: value }))}
              style={{ width: 200 }}
            >
              <Select.Option value="small">小</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="large">大</Select.Option>
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>紧凑布局</div>
              <div style={{ fontSize: 12, color: '#666' }}>减少元素间距，显示更多内容</div>
            </div>
            <Switch
              checked={appearanceSettings.compactLayout}
              onChange={(checked) => setAppearanceSettings(s => ({ ...s, compactLayout: checked }))}
            />
          </div>
        </Form>
      </Card>
    </div>
  );

  const permissionTab = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Tabs activeKey={activePermTab} onChange={setActivePermTab} items={[
          { key: 'roles', label: '角色管理', icon: <LockOutlined /> },
          { key: 'groups', label: '用户组管理', icon: <UserOutlined /> },
        ]} />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => activePermTab === 'roles' ? handleOpenRoleModal() : handleOpenGroupModal()}
        >
          {activePermTab === 'roles' ? '添加角色' : '添加用户组'}
        </Button>
      </div>

      {activePermTab === 'roles' ? (
        <Table
          columns={roleColumns}
          dataSource={roles}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{ emptyText: '暂无数据' }}
          loading={settingsLoading}
        />
      ) : (
        <Table
          columns={groupColumns}
          dataSource={groups}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{ emptyText: '暂无数据' }}
          loading={settingsLoading}
        />
      )}
    </div>
  );

  const dictionaryTab = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Select
          value={dictCategoryFilter}
          onChange={setDictCategoryFilter}
          style={{ width: 200 }}
          placeholder="筛选分类"
        >
          <Select.Option value="">全部</Select.Option>
          {[...new Set(dataDictionaries.map(d => d.category))].sort().map(category => (
            <Select.Option key={category} value={category}>
              {CATEGORY_NAMES[category] || category}
            </Select.Option>
          ))}
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenDictModal(undefined, dictCategoryFilter)}
        >
          添加数据字典
        </Button>
      </div>

      <Spin spinning={dictLoading}>
        <Table
          columns={dictColumns}
          dataSource={
            dataDictionaries
              .filter(d => !dictCategoryFilter || d.category === dictCategoryFilter)
              .sort((a, b) => {
                if (a.category !== b.category) {
                  return a.category.localeCompare(b.category);
                }
                return (a.sort_order || 0) - (b.sort_order || 0);
              })
          }
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{ emptyText: '暂无数据字典' }}
        />
      </Spin>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>系统设置</Title>
        <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
          保存设置
        </Button>
      </div>

      <Card loading={settingsLoading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'profile', label: '个人信息', icon: <UserOutlined /> },
          { key: 'notification', label: '通知设置', icon: <BellOutlined /> },
          { key: 'security', label: '安全设置', icon: <IeOutlined /> },
          { key: 'appearance', label: '外观设置', icon: <AlertOutlined /> },
          { key: 'permissions', label: '权限管理', icon: <LockOutlined /> },
          { key: 'dictionary', label: '数据字典', icon: <DatabaseOutlined /> },
        ]} />

        <div style={{ padding: 16 }}>
          {activeTab === 'profile' && profileFormComponent}
          {activeTab === 'notification' && notificationFormComponent}
          {activeTab === 'security' && securityFormComponent}
          {activeTab === 'appearance' && appearanceFormComponent}
          {activeTab === 'permissions' && permissionTab}
          {activeTab === 'dictionary' && dictionaryTab}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
        <Card title="系统信息">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>系统版本</span>
              <span style={{ fontFamily: 'monospace' }}>v1.0.0-alpha</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>最后更新</span>
              <span>2026-05-23 10:30:00.000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>数据存储</span>
              <span>MongoDB</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>前端框架</span>
              <span>React 18</span>
            </div>
          </div>
        </Card>
        <Card title="快速操作">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" style={{ width: '100%' }} onClick={() => message.success('缓存已清理')}>清理缓存</Button>
            <Button style={{ width: '100%' }} onClick={() => message.info('数据导出中...')}>导出数据</Button>
            <Button danger style={{ width: '100%' }} onClick={() => {
              profileForm.resetFields();
              setNotificationSettings({
                emailNotification: true,
                inAppNotification: true,
                browserNotification: false,
                taskReminder: true,
                riskAlert: true,
              });
              setSecuritySettings({
                twoFactorAuth: false,
                loginNotification: true,
              });
              setAppearanceSettings({
                theme: 'light',
                accentColor: '#1890ff',
                fontSize: 'medium',
                compactLayout: false,
              });
              message.success('设置已重置');
            }}>重置设置</Button>
          </Space>
        </Card>
      </div>

      <Modal
        title={editingRole?.id ? '编辑角色' : '添加角色'}
        open={roleModalOpen}
        onCancel={handleCloseRoleModal}
        footer={[
          <Button key="back" onClick={handleCloseRoleModal}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleSaveRole}>保存</Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="角色名称" required>
            <Input
              value={editingRole?.name || ''}
              onChange={(e) => editingRole && setEditingRole({ ...editingRole, name: e.target.value })}
              placeholder="请输入角色名称"
            />
          </Form.Item>
          <Form.Item label="角色描述">
            <TextArea
              value={editingRole?.description || ''}
              onChange={(e) => editingRole && setEditingRole({ ...editingRole, description: e.target.value })}
              placeholder="请输入角色描述"
              rows={3}
            />
          </Form.Item>
          <Form.Item label="权限设置">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { key: 'project:view', label: '查看项目' },
                { key: 'project:edit', label: '编辑项目' },
                { key: 'project:delete', label: '删除项目' },
                { key: 'task:view', label: '查看任务' },
                { key: 'task:edit', label: '编辑任务' },
                { key: 'task:delete', label: '删除任务' },
                { key: 'resource:view', label: '查看资源' },
                { key: 'resource:edit', label: '编辑资源' },
                { key: 'bug:view', label: '查看缺陷' },
                { key: 'bug:edit', label: '编辑缺陷' },
                { key: 'report:view', label: '查看报表' },
                { key: 'admin:manage', label: '系统管理' },
              ].map((perm) => (
                <Checkbox
                  key={perm.key}
                  checked={(editingRole?.permissions || []).includes(perm.key)}
                  onChange={(e) => {
                    if (editingRole) {
                      const newPerms = e.target.checked
                        ? [...editingRole.permissions, perm.key]
                        : editingRole.permissions.filter(p => p !== perm.key);
                      setEditingRole({ ...editingRole, permissions: newPerms });
                    }
                  }}
                >
                  {perm.label}
                </Checkbox>
              ))}
            </div>
          </Form.Item>
          <Form.Item label="状态">
            <Switch
              checked={editingRole?.status ?? true}
              onChange={(e) => editingRole && setEditingRole({ ...editingRole, status: e })}
            />
            <span style={{ marginLeft: 8 }}>{(editingRole?.status ?? true) ? '启用' : '禁用'}</span>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingGroup?.id ? '编辑用户组' : '添加用户组'}
        open={groupModalOpen}
        onCancel={handleCloseGroupModal}
        footer={[
          <Button key="back" onClick={handleCloseGroupModal}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleSaveGroup}>保存</Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="用户组名称" required>
            <Input
              value={editingGroup?.name || ''}
              onChange={(e) => editingGroup && setEditingGroup({ ...editingGroup, name: e.target.value })}
              placeholder="请输入用户组名称"
            />
          </Form.Item>
          <Form.Item label="用户组描述">
            <TextArea
              value={editingGroup?.description || ''}
              onChange={(e) => editingGroup && setEditingGroup({ ...editingGroup, description: e.target.value })}
              placeholder="请输入用户组描述"
              rows={3}
            />
          </Form.Item>
          <Form.Item label="关联角色">
            <Select
              value={editingGroup?.role_id}
              onChange={(value) => {
                if (editingGroup) {
                  const role = roles.find(r => r.id === value);
                  setEditingGroup({
                    ...editingGroup,
                    role_id: value,
                    role_name: role?.name || ''
                  });
                }
              }}
              placeholder="选择角色"
            >
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="组成员（逗号分隔）">
            <Input
              value={editingGroup?.members?.join(', ') || ''}
              onChange={(e) => editingGroup && setEditingGroup({ ...editingGroup, members: e.target.value.split(',').map(m => m.trim()).filter(Boolean) })}
              placeholder="请输入成员名称，用逗号分隔"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingDict?._id ? '编辑数据字典' : '添加数据字典'}
        open={dictModalOpen}
        onCancel={handleCloseDictModal}
        footer={[
          <Button key="back" onClick={handleCloseDictModal}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleSaveDict}>保存</Button>,
        ]}
      >
        <Form form={dictForm} layout="vertical">
          <Form.Item label="分类" name="category" rules={[{ required: true, message: '请输入分类' }]}>
            <Input placeholder="请输入分类，如：project_role" />
          </Form.Item>
          <Form.Item label="编码" name="code" rules={[{ required: true, message: '请输入编码' }]}>
            <Input placeholder="请输入编码" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item label="值" name="value" rules={[{ required: true, message: '请输入值' }]}>
            <Input placeholder="请输入值" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>
          <Form.Item label="排序" name="sort_order">
            <InputNumber min={1} placeholder="请输入排序号" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="启用" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Settings;