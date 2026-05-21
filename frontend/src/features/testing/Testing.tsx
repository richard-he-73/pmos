import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm, Card, Typography, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getTestCases, createTestCase, updateTestCase, deleteTestCase,
  getDefects, createDefect, updateDefect, deleteDefect,
  getTestReports, createTestReport, updateTestReport, deleteTestReport,
} from '../../api/testing';
import type { TestCase, Defect, TestReport } from '../../types/models';
import { TEST_CASE_STATUS, DEFECT_STATUS, SEVERITY, PRIORITY } from '../../utils/constants';

const { Title } = Typography;
const { TextArea } = Input;

const Testing: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [reports, setReports] = useState<TestReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [testCaseModalOpen, setTestCaseModalOpen] = useState(false);
  const [defectModalOpen, setDefectModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [editingReport, setEditingReport] = useState<TestReport | null>(null);
  const [testCaseForm] = Form.useForm();
  const [defectForm] = Form.useForm();
  const [reportForm] = Form.useForm();

  const fetchTestCases = async () => {
    setLoading(true);
    try {
      const res = await getTestCases();
      setTestCases(Array.isArray(res) ? res : []);
    } catch (error) {
      message.error('获取测试用例列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchDefects = async () => {
    try {
      const res = await getDefects();
      setDefects(Array.isArray(res) ? res : []);
    } catch (error) {
      message.error('获取缺陷列表失败');
    }
  };

  const fetchReports = async () => {
    try {
      const res = await getTestReports();
      setReports(Array.isArray(res) ? res : []);
    } catch (error) {
      message.error('获取测试报告列表失败');
    }
  };

  useEffect(() => {
    fetchTestCases();
    fetchDefects();
    fetchReports();
  }, []);

  const handleCreateTestCase = () => {
    setEditingTestCase(null);
    testCaseForm.resetFields();
    setTestCaseModalOpen(true);
  };

  const handleEditTestCase = (record: TestCase) => {
    setEditingTestCase(record);
    testCaseForm.setFieldsValue(record);
    setTestCaseModalOpen(true);
  };

  const handleSubmitTestCase = async () => {
    try {
      const values = await testCaseForm.validateFields();
      const payload = { ...values, project_id: values.project_id || 'default_project' };

      if (editingTestCase) {
        await updateTestCase(editingTestCase._id, payload);
        message.success('测试用例更新成功');
      } else {
        await createTestCase(payload);
        message.success('测试用例创建成功');
      }
      setTestCaseModalOpen(false);
      fetchTestCases();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingTestCase ? '更新失败' : '创建失败');
    }
  };

  const handleDeleteTestCase = async (id: string) => {
    try {
      await deleteTestCase(id);
      message.success('测试用例已删除');
      fetchTestCases();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreateDefect = () => {
    setEditingDefect(null);
    defectForm.resetFields();
    setDefectModalOpen(true);
  };

  const handleEditDefect = (record: Defect) => {
    setEditingDefect(record);
    defectForm.setFieldsValue(record);
    setDefectModalOpen(true);
  };

  const handleSubmitDefect = async () => {
    try {
      const values = await defectForm.validateFields();
      const payload = {
        ...values,
        project_id: values.project_id || 'default_project',
        reporter_id: 'reporter_id_placeholder',
      };

      if (editingDefect) {
        await updateDefect(editingDefect._id, payload);
        message.success('缺陷更新成功');
      } else {
        await createDefect(payload);
        message.success('缺陷创建成功');
      }
      setDefectModalOpen(false);
      fetchDefects();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingDefect ? '更新失败' : '创建失败');
    }
  };

  const handleDeleteDefect = async (id: string) => {
    try {
      await deleteDefect(id);
      message.success('缺陷已删除');
      fetchDefects();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreateReport = () => {
    setEditingReport(null);
    reportForm.resetFields();
    setReportModalOpen(true);
  };

  const handleEditReport = (record: TestReport) => {
    setEditingReport(record);
    reportForm.setFieldsValue(record);
    setReportModalOpen(true);
  };

  const handleSubmitReport = async () => {
    try {
      const values = await reportForm.validateFields();
      const payload = {
        ...values,
        project_id: values.project_id || 'default_project',
        tester_id: 'tester_id_placeholder',
      };

      if (editingReport) {
        await updateTestReport(editingReport._id, payload);
        message.success('测试报告更新成功');
      } else {
        await createTestReport(payload);
        message.success('测试报告创建成功');
      }
      setReportModalOpen(false);
      fetchReports();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(editingReport ? '更新失败' : '创建失败');
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteTestReport(id);
      message.success('测试报告已删除');
      fetchReports();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const testCaseColumns: ColumnsType<TestCase> = [
    {
      title: '测试用例标题',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
      render: (title: string) => <span style={{ fontWeight: 600 }}>{title}</span>,
    },
    {
      title: '模块',
      dataIndex: 'module',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { draft: 'default', active: 'processing', deprecated: 'error' };
        return <Tag color={colorMap[status] || 'default'}>{TEST_CASE_STATUS[status as keyof typeof TEST_CASE_STATUS] || status}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (priority: string) => {
        const colorMap: Record<string, string> = { low: 'default', medium: 'blue', high: 'orange', critical: 'red' };
        return <Tag color={colorMap[priority] || 'default'}>{PRIORITY[priority as keyof typeof PRIORITY]}</Tag>;
      },
    },
    {
      title: '预期结果',
      dataIndex: 'expected_result',
      ellipsis: true,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space wrap>
          {tags.slice(0, 2).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {tags.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditTestCase(record)} />
          <Popconfirm title="确定删除此测试用例？" onConfirm={() => handleDeleteTestCase(record._id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const defectColumns: ColumnsType<Defect> = [
    {
      title: '缺陷标题',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
      render: (title: string) => <span style={{ fontWeight: 600 }}>{title}</span>,
    },
    {
      title: '严重度',
      dataIndex: 'severity',
      width: 100,
      render: (severity: string) => {
        const colorMap: Record<string, string> = { low: 'default', medium: 'blue', high: 'orange', critical: 'red' };
        return <Tag color={colorMap[severity] || 'default'}>{SEVERITY[severity as keyof typeof SEVERITY]}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { new: 'default', open: 'blue', in_progress: 'processing', resolved: 'success', closed: 'default', rejected: 'error' };
        return <Tag color={colorMap[status] || 'default'}>{DEFECT_STATUS[status as keyof typeof DEFECT_STATUS] || status}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (priority: string) => {
        const colorMap: Record<string, string> = { low: 'default', medium: 'blue', high: 'orange', critical: 'red' };
        return <Tag color={colorMap[priority] || 'default'}>{PRIORITY[priority as keyof typeof PRIORITY]}</Tag>;
      },
    },
    {
      title: '环境',
      dataIndex: 'environment',
      width: 100,
    },
    {
      title: '负责人',
      dataIndex: 'assignee_id',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditDefect(record)} />
          <Popconfirm title="确定删除此缺陷？" onConfirm={() => handleDeleteDefect(record._id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const reportColumns: ColumnsType<TestReport> = [
    {
      title: '报告名称',
      dataIndex: 'name',
      width: 200,
      render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: '总用例数',
      dataIndex: 'total_cases',
      width: 100,
      render: (total: number) => <span className="mono-value">{total}</span>,
    },
    {
      title: '通过/失败/阻塞',
      key: 'stats',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tag color="success">{record.passed}</Tag>
          <Tag color="error">{record.failed}</Tag>
          <Tag color="warning">{record.blocked}</Tag>
        </Space>
      ),
    },
    {
      title: '通过率',
      dataIndex: 'pass_rate',
      width: 100,
      render: (rate: number) => <span className="mono-value">{rate}%</span>,
    },
    {
      title: '缺陷数',
      dataIndex: 'defects_found',
      width: 80,
      render: (count: number) => <span className="mono-value">{count}</span>,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditReport(record)} />
          <Popconfirm title="确定删除此报告？" onConfirm={() => handleDeleteReport(record._id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>测试管理</Title>
      </div>

      <Tabs
        defaultActiveKey="testCases"
        items={[
          {
            key: 'testCases',
            label: '测试用例',
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTestCase}>
                    新建测试用例
                  </Button>
                </div>
                <Table
                  columns={testCaseColumns}
                  dataSource={testCases}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
                  scroll={{ x: 1200 }}
                />
              </Card>
            ),
          },
          {
            key: 'defects',
            label: '缺陷追踪',
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateDefect}>
                    新建缺陷
                  </Button>
                </div>
                <Table
                  columns={defectColumns}
                  dataSource={defects}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
                  scroll={{ x: 1200 }}
                />
              </Card>
            ),
          },
          {
            key: 'reports',
            label: '测试报告',
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateReport}>
                    新建报告
                  </Button>
                </div>
                <Table
                  columns={reportColumns}
                  dataSource={reports}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 项` }}
                  scroll={{ x: 1200 }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={editingTestCase ? '编辑测试用例' : '新建测试用例'}
        open={testCaseModalOpen}
        onOk={handleSubmitTestCase}
        onCancel={() => setTestCaseModalOpen(false)}
        width={600}
      >
        <Form form={testCaseForm} layout="vertical">
          <Form.Item name="title" label="测试用例标题" rules={[{ required: true, message: '请输入测试用例标题' }]}>
            <Input placeholder="请输入测试用例标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="测试用例描述" />
          </Form.Item>
          <Form.Item name="module" label="所属模块">
            <Input placeholder="所属模块" />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="critical">紧急</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="draft">草稿</Select.Option>
              <Select.Option value="active">活跃</Select.Option>
              <Select.Option value="deprecated">已废弃</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="preconditions" label="前置条件">
            <TextArea rows={2} placeholder="前置条件" />
          </Form.Item>
          <Form.Item name="steps" label="测试步骤">
            <Select mode="tags" placeholder="输入测试步骤后按回车" />
          </Form.Item>
          <Form.Item name="expected_result" label="预期结果">
            <TextArea rows={2} placeholder="预期结果" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingDefect ? '编辑缺陷' : '新建缺陷'}
        open={defectModalOpen}
        onOk={handleSubmitDefect}
        onCancel={() => setDefectModalOpen(false)}
        width={600}
      >
        <Form form={defectForm} layout="vertical">
          <Form.Item name="title" label="缺陷标题" rules={[{ required: true, message: '请输入缺陷标题' }]}>
            <Input placeholder="请输入缺陷标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="缺陷描述" />
          </Form.Item>
          <Form.Item name="severity" label="严重度" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="critical">严重</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="critical">紧急</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="new">新建</Select.Option>
              <Select.Option value="open">已打开</Select.Option>
              <Select.Option value="in_progress">修复中</Select.Option>
              <Select.Option value="resolved">已解决</Select.Option>
              <Select.Option value="closed">已关闭</Select.Option>
              <Select.Option value="rejected">已拒绝</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="environment" label="环境">
            <Input placeholder="测试环境" />
          </Form.Item>
          <Form.Item name="steps_to_reproduce" label="复现步骤">
            <TextArea rows={3} placeholder="复现步骤" />
          </Form.Item>
          <Form.Item name="actual_result" label="实际结果">
            <TextArea rows={2} placeholder="实际结果" />
          </Form.Item>
          <Form.Item name="expected_result" label="预期结果">
            <TextArea rows={2} placeholder="预期结果" />
          </Form.Item>
          <Form.Item name="resolution" label="解决方案">
            <TextArea rows={2} placeholder="解决方案" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingReport ? '编辑测试报告' : '新建测试报告'}
        open={reportModalOpen}
        onOk={handleSubmitReport}
        onCancel={() => setReportModalOpen(false)}
        width={600}
      >
        <Form form={reportForm} layout="vertical">
          <Form.Item name="name" label="报告名称" rules={[{ required: true, message: '请输入报告名称' }]}>
            <Input placeholder="测试报告名称" />
          </Form.Item>
          <Form.Item name="total_cases" label="总用例数">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="passed" label="通过数">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="failed" label="失败数">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="blocked" label="阻塞数">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="defects_found" label="缺陷数">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <TextArea rows={3} placeholder="报告摘要" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Testing;
