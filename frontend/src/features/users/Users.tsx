import { useState, useMemo, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Popconfirm, Card, Typography, Avatar, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, CheckOutlined, StopOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  useGetUsersQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation, 
  useResetPasswordMutation,
  useGetDataDictionariesQuery,
  useInitializeDataDictionariesMutation 
} from '../../store/api';
import { formatDateTime } from '../../utils/formatters';
import { useUser } from '../../contexts/UserContext';
import type { DataDictionary } from '../../types/models';
import { getDepartments, getJobLevels, type Department, type JobLevel } from '../../services/organization';
import { useDataItems } from '../../hooks/useDataItems';
import type { DataItem } from '../../services/dataItem';
import DataItemSelect from '../../components/common/DataItemSelect';
import pinyin from 'pinyin';

const { Title } = Typography;

const DEFAULT_ROLE_NAMES: Record<string, string> = {
  system: '系统管理员',
  operator: '操作员',
};

const Users: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const { currentUser } = useUser();

  const { data: users = [], isLoading, refetch } = useGetUsersQuery();
  const { data: dataDictionaries = [], refetch: refetchDictionaries } = useGetDataDictionariesQuery();
  const [initializeDataDictionaries] = useInitializeDataDictionariesMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();
  const { items: userStatuses } = useDataItems('user_status');
  const { items: systemRoles } = useDataItems('user_role');

  const isAdmin = currentUser?.role === 'system';

  useEffect(() => {
    if (dataDictionaries.length === 0) {
      initializeDataDictionaries()
        .unwrap()
        .then(() => refetchDictionaries())
        .catch(() => {});
    }
  }, [dataDictionaries.length, initializeDataDictionaries, refetchDictionaries]);

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      const [depts, levels] = await Promise.all([
        getDepartments().catch(() => []),
        getJobLevels().catch(() => []),
      ]);
      setDepartments(depts);
      setJobLevels(levels);
    } catch {
      message.error('加载组织数据失败');
    }
  };

  const userRoles = useMemo(() => {
    return systemRoles.sort((a: DataItem, b: DataItem) => 
      (a.sort_order || 0) - (b.sort_order || 0)
    );
  }, [systemRoles]);

  const getRoleColor = (roleValue: string) => {
    const colors: Record<string, string> = {
      system: 'red',
      operator: 'blue',
    };
    return colors[roleValue] || 'default';
  };

  const getRoleName = (roleValue: string) => {
    if (userRoles.length > 0) {
      const role = userRoles.find((r: DataItem) => r.code === roleValue);
      if (role?.name) return role.name;
    }
    return DEFAULT_ROLE_NAMES[roleValue] || roleValue;
  };

  const getDeptName = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || deptId || '-';
  };

  const getJobLevelName = (levelId: string) => {
    const level = jobLevels.find(l => l.id === levelId);
    return level?.name || levelId || '-';
  };

  const handleNameChange = (value: string) => {
    if (value && !editingUser) {
      const pinyinResult = pinyin(value, {
        style: pinyin.STYLE_NORMAL,
      });
      const username = pinyinResult.map(item => item[0]).join('').toLowerCase();
      form.setFieldsValue({ username });
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingUser(record);
    form.setFieldsValue({
      display_name: record.display_name,
      username: record.username,
      email: record.email,
      role: record.role,
      department: record.department,
      position: record.position,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleStatusChange = async (record: any, newStatus: string) => {
    try {
      await updateUser({ id: record.id || record._id, body: { status: newStatus } }).unwrap();
      message.success(`用户状态已${newStatus === 'active' ? '激活' : '停用'}`);
      refetch();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleResetPassword = (record: any) => {
    setResetPasswordUser(record);
    resetPasswordForm.resetFields();
    setResetPasswordModalOpen(true);
  };

  const handleSubmitResetPassword = async () => {
    try {
      const values = await resetPasswordForm.validateFields();
      await resetPassword({
        userId: resetPasswordUser.id || resetPasswordUser._id,
        body: { new_password: values.newPassword }
      }).unwrap();
      message.success('密码重置成功');
      setResetPasswordModalOpen(false);
    } catch (error: any) {
      message.error(error?.data?.detail || '密码重置失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        display_name: values.display_name || values.name,
      };
      if (editingUser) {
        await updateUser({ id: editingUser.id || editingUser._id, body: payload }).unwrap();
        message.success('用户更新成功');
      } else {
        await createUser({
          ...payload,
          status: 'active',
        }).unwrap();
        message.success('用户创建成功');
      }
      setModalOpen(false);
      refetch();
    } catch (error: any) {
      if (error?.errorFields) return;
      console.error('用户操作失败:', error);
      const errorMessage = error?.data?.detail || error?.message || '操作失败';
      message.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      message.success('用户已删除');
      refetch();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: '用户',
      dataIndex: 'display_name',
      width: 200,
      render: (name: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 120,
      render: (role: string) => {
        return <Tag color={getRoleColor(role)}>{getRoleName(role)}</Tag>;
      },
    },
    {
      title: '部门',
      dataIndex: 'department',
      width: 120,
      render: (deptId: string) => getDeptName(deptId),
    },
    {
      title: '职级',
      dataIndex: 'position',
      width: 120,
      render: (position: string) => getJobLevelName(position),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'default', text: '未激活' },
          suspended: { color: 'red', text: '已停用' },
        };
        const info = statusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 200,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          {record.status !== 'active' ? (
            <Tooltip title="激活">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record, 'active')}
              />
            </Tooltip>
          ) : (
            <Tooltip title="停用">
              <Button
                type="text"
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => handleStatusChange(record, 'inactive')}
              />
            </Tooltip>
          )}
          {isAdmin && (
            <Tooltip title="重置密码">
              <Button
                type="text"
                size="small"
                icon={<KeyOutlined />}
                onClick={() => handleResetPassword(record)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定删除此用户？"
            onConfirm={() => handleDelete(record.id || record._id)}
          >
            <Tooltip title="删除">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: Array.isArray(users) ? users.length : 0,
    active: Array.isArray(users) ? users.filter((u: any) => u.status === 'active').length : 0,
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, display: 'inline' }}>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          用户管理
        </Title>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>总用户数</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{stats.total}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>活跃用户</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--color-success)' }}>{stats.active}</div>
        </Card>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增用户
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={Array.isArray(users) ? users : []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={500}
        okText="确定"
        cancelText="取消"
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="display_name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="姓名" onChange={(e) => handleNameChange(e.target.value)} />
          </Form.Item>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="用户名（输入姓名后自动生成）" />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="密码" />
            </Form.Item>
          )}
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效的邮箱' }]}>
            <Input placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="department" label="部门">
            <Select placeholder="请选择部门">
              <Select.Option value="">无</Select.Option>
              {departments.map((dept: Department) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="position" label="职级">
            <Select placeholder="请选择职级">
              <Select.Option value="">无</Select.Option>
              {jobLevels.map((level: JobLevel) => (
                <Select.Option key={level.id} value={level.id}>
                  {level.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="role" 
            label="角色" 
            rules={[{ required: true, message: '请选择角色' }]} 
            initialValue={userRoles[0]?.code || 'operator'}
          >
            <Select placeholder="请选择角色">
              {userRoles.length > 0 ? (
                userRoles.map((role: DataItem) => (
                  <Select.Option key={role.id} value={role.code}>
                    {role.name}
                  </Select.Option>
                ))
              ) : (
                Object.entries(DEFAULT_ROLE_NAMES).map(([value, name]) => (
                  <Select.Option key={value} value={value}>
                    {name}
                  </Select.Option>
                ))
              )}
            </Select>
          </Form.Item>
          {editingUser && (
            <Form.Item name="status" label="状态" rules={[{ required: true }]} initialValue="active">
              <DataItemSelect category="user_status" placeholder="请选择状态" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={`重置密码 - ${resetPasswordUser?.display_name}`}
        open={resetPasswordModalOpen}
        onOk={handleSubmitResetPassword}
        onCancel={() => setResetPasswordModalOpen(false)}
        width={500}
        okText="确认重置"
        cancelText="取消"
        confirmLoading={isResettingPassword}
      >
        <Form form={resetPasswordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
