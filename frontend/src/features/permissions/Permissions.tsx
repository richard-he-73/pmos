import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm, Card, Typography, Tabs, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation, useGetGroupsQuery, useCreateGroupMutation, useUpdateGroupMutation, useDeleteGroupMutation, useGetOperationLogsQuery } from '../../store/api';
import type { Role, UserGroup, OperationLog } from '../../types/models';

const { Title } = Typography;
const { TextArea } = Input;

const Permissions: React.FC = () => {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [roleForm] = Form.useForm();
  const [groupForm] = Form.useForm();

  const { data: roles = [] } = useGetRolesQuery();
  const { data: groups = [] } = useGetGroupsQuery();
  const { data: logs = [], isLoading: loading } = useGetOperationLogsQuery({});
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [createGroup] = useCreateGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();

  const handleSaveRole = async () => {
    try {
      const values = await roleForm.validateFields();
      if (editingRole) { await updateRole({ id: editingRole._id, body: values }).unwrap(); message.success('角色更新成功'); }
      else { await createRole(values).unwrap(); message.success('角色创建成功'); }
      setRoleModalOpen(false);
    } catch (e: any) { if (e?.errorFields) return; message.error(editingRole ? '更新失败' : '创建失败'); }
  };

  const handleSaveGroup = async () => {
    try {
      const values = await groupForm.validateFields();
      if (editingGroup) { await updateGroup({ id: editingGroup._id, body: values }).unwrap(); message.success('分组更新成功'); }
      else { await createGroup(values).unwrap(); message.success('分组创建成功'); }
      setGroupModalOpen(false);
    } catch (e: any) { if (e?.errorFields) return; message.error(editingGroup ? '更新失败' : '创建失败'); }
  };

  const roleColumns: ColumnsType<Role> = [
    { title: '角色名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '权限数', dataIndex: 'permissions', render: (p: string[]) => <Tag>{p?.length || 0}</Tag> },
    { title: '系统角色', dataIndex: 'is_system', render: (v: boolean) => v ? <Tag color="blue">是</Tag> : <Tag>否</Tag> },
    { title: '操作', key: 'action', render: (_, record) => (
      <Space>
        <Tooltip title="编辑">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingRole(record); roleForm.setFieldsValue(record); setRoleModalOpen(true); }} />
        </Tooltip>
        {!record.is_system && <Popconfirm title="确定删除？" onConfirm={async () => { await deleteRole(record._id).unwrap(); message.success('已删除'); }}><Tooltip title="删除"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Tooltip></Popconfirm>}
      </Space>
    )},
  ];

  const groupColumns: ColumnsType<UserGroup> = [
    { title: '分组名称', dataIndex: 'name', render: (n: string) => <span style={{ fontWeight: 600 }}>{n}</span> },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '成员数', dataIndex: 'members', render: (m: string[]) => <Tag>{m?.length || 0}</Tag> },
    { title: '操作', key: 'action', render: (_, record) => (
      <Space>
        <Tooltip title="编辑">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingGroup(record); groupForm.setFieldsValue(record); setGroupModalOpen(true); }} />
        </Tooltip>
        <Popconfirm title="确定删除？" onConfirm={async () => { await deleteGroup(record._id).unwrap(); message.success('已删除'); }}><Tooltip title="删除"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Tooltip></Popconfirm>
      </Space>
    )},
  ];

  const logColumns: ColumnsType<OperationLog> = [
    { title: '用户ID', dataIndex: 'user_id', render: (v: string) => <span className="mono-value">{v?.substring(0, 8)}</span> },
    { title: '操作', dataIndex: 'action', render: (v: string) => <Tag>{v}</Tag> },
    { title: '资源类型', dataIndex: 'resource_type' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: 'IP', dataIndex: 'ip_address', render: (v: string) => <span className="mono-value">{v}</span> },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'success' ? 'success' : 'error'}>{v}</Tag> },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}><Title level={4} style={{ margin: 0 }}>权限管理</Title></div>
      <Tabs defaultActiveKey="roles" items={[
        { key: 'roles', label: '角色管理', children: (
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRole(null); roleForm.resetFields(); setRoleModalOpen(true); }}>新建角色</Button>
            </div>
            <Table columns={roleColumns} dataSource={roles} rowKey="_id" pagination={{ pageSize: 10, showTotal: (t: number) => `共 ${t} 项` }} locale={{ emptyText: '暂无数据' }} />
          </Card>
        )},
        { key: 'groups', label: '用户分组', children: (
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingGroup(null); groupForm.resetFields(); setGroupModalOpen(true); }}>新建分组</Button>
            </div>
            <Table columns={groupColumns} dataSource={groups} rowKey="_id" pagination={{ pageSize: 10, showTotal: (t: number) => `共 ${t} 项` }} locale={{ emptyText: '暂无数据' }} />
          </Card>
        )},
        { key: 'logs', label: '操作日志', children: (
          <Card>
            <Table columns={logColumns} dataSource={logs} rowKey="_id" loading={loading} pagination={{ pageSize: 20, showTotal: (t: number) => `共 ${t} 项` }} locale={{ emptyText: '暂无数据' }} />
          </Card>
        )},
      ]} />
      <Modal title={editingRole ? '编辑角色' : '新建角色'} open={roleModalOpen} onOk={handleSaveRole} onCancel={() => setRoleModalOpen(false)} okText="确定" cancelText="取消">
        <Form form={roleForm} layout="vertical">
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><TextArea rows={2} /></Form.Item>
          <Form.Item name="permissions" label="权限列表"><Select mode="tags" placeholder="输入权限标识后按回车" /></Form.Item>
        </Form>
      </Modal>
      <Modal title={editingGroup ? '编辑分组' : '新建分组'} open={groupModalOpen} onOk={handleSaveGroup} onCancel={() => setGroupModalOpen(false)} okText="确定" cancelText="取消">
        <Form form={groupForm} layout="vertical">
          <Form.Item name="name" label="分组名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><TextArea rows={2} /></Form.Item>
          <Form.Item name="members" label="成员"><Select mode="tags" placeholder="输入成员ID后按回车" /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Permissions;
