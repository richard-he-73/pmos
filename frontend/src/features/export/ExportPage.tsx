import { useState } from 'react';
import { Card, Row, Col, Select, Button, Typography, message, Tag, Descriptions } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FileTextOutlined, FilePdfOutlined } from '@ant-design/icons';
import {
  useGetProjectsQuery,
  useGetTasksQuery,
  useGetRisksQuery,
  useGetRequirementsQuery,
} from '../../store/api';
import {
  exportProjectsCSV,
  exportProjectsJSON,
  exportTasksCSV,
  exportTasksJSON,
  exportRisksCSV,
  exportRequirementsCSV,
  exportSummaryReport,
} from '../../api/export';

const { Title, Text } = Typography;

const ExportPage: React.FC = () => {
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [taskProjectFilter, setTaskProjectFilter] = useState<string>('');
  
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: tasks = [] } = useGetTasksQuery({});
  const { data: risks = [] } = useGetRisksQuery({});
  const { data: requirements = [] } = useGetRequirementsQuery({});
  
  const stats = { 
    projects: projects.length, 
    tasks: tasks.length, 
    risks: risks.length, 
    requirements: requirements.length 
  };

  const handleExport = async (type: 'projects' | 'tasks' | 'risks' | 'requirements', format: 'csv' | 'json') => {
    try {
      if (type === 'projects') {
        format === 'csv' 
          ? exportProjectsCSV(projectFilter || undefined)
          : exportProjectsJSON(projectFilter || undefined);
      } else if (type === 'tasks') {
        format === 'csv' 
          ? exportTasksCSV(taskProjectFilter || undefined)
          : exportTasksJSON(taskProjectFilter || undefined);
      } else if (type === 'risks') {
        exportRisksCSV();
      } else if (type === 'requirements') {
        exportRequirementsCSV();
      }
      message.success(`${type} 数据导出成功`);
    } catch (error) {
      message.error('导出失败');
    }
  };

  const handleExportSummary = async () => {
    try {
      exportSummaryReport();
      message.success('汇总报表导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  return (
    <>
      <Title level={4} style={{ marginBottom: 16 }}>
        <DownloadOutlined /> 数据导出与报表
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="项目数据导出" extra={<Tag>共 {stats.projects} 个项目</Tag>}>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">筛选：</Text>
              <Select
                style={{ width: 200 }}
                placeholder="按状态筛选"
                allowClear
                value={projectFilter || undefined}
                onChange={(val) => setProjectFilter(val || '')}
                options={[
                  { label: '规划中', value: 'planning' },
                  { label: '进行中', value: 'active' },
                  { label: '已完成', value: 'completed' },
                  { label: '已暂停', value: 'on_hold' },
                  { label: '已归档', value: 'archived' },
                ]}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button icon={<FileExcelOutlined />} onClick={() => handleExport('projects', 'csv')}>导出CSV</Button>
              <Button icon={<FileTextOutlined />} onClick={() => handleExport('projects', 'json')}>导出JSON</Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="任务数据导出" extra={<Tag>共 {stats.tasks} 个任务</Tag>}>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">筛选：</Text>
              <Select
                style={{ width: 200 }}
                placeholder="按项目筛选"
                allowClear
                value={taskProjectFilter || undefined}
                onChange={(val) => setTaskProjectFilter(val || '')}
                options={projects.map((p: any) => ({ label: p.name, value: p._id }))}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button icon={<FileExcelOutlined />} onClick={() => handleExport('tasks', 'csv')}>导出CSV</Button>
              <Button icon={<FileTextOutlined />} onClick={() => handleExport('tasks', 'json')}>导出JSON</Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="风险数据导出" extra={<Tag>共 {stats.risks} 个风险</Tag>}>
            <Button icon={<FileExcelOutlined />} onClick={() => handleExport('risks', 'csv')}>导出风险 CSV</Button>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="需求数据导出" extra={<Tag>共 {stats.requirements} 个需求</Tag>}>
            <Button icon={<FileExcelOutlined />} onClick={() => handleExport('requirements', 'csv')}>导出需求 CSV</Button>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="汇总报表">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="项目汇总报表">
                <Button type="primary" icon={<FilePdfOutlined />} onClick={handleExportSummary}>
                  下载 PDF 报表
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ExportPage;
