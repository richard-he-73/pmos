import { useState } from 'react';
import { Card, Typography, Input, Tag, Collapse, Button, message } from 'antd';
import { SearchOutlined, FileTextOutlined, SendOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

const helpCategories = [
  { id: 'getting-started', name: '快速入门', icon: '🚀', count: 5 },
  { id: 'projects', name: '项目管理', icon: '🗂', count: 8 },
  { id: 'tasks', name: '任务管理', icon: '📋', count: 6 },
  { id: 'resources', name: '资源管理', icon: '👥', count: 4 },
  { id: 'reports', name: '报表导出', icon: '📊', count: 3 },
  { id: 'permissions', name: '权限管理', icon: '🔒', count: 4 },
];

const recentArticles = [
  { id: 1, title: '如何创建新项目', category: 'getting-started', views: 1245 },
  { id: 2, title: '任务看板视图使用指南', category: 'tasks', views: 892 },
  { id: 3, title: '资源分配最佳实践', category: 'resources', views: 654 },
  { id: 4, title: '导出项目报表', category: 'reports', views: 523 },
  { id: 5, title: '团队权限设置', category: 'permissions', views: 445 },
];

const faqs = [
  {
    question: '如何创建新项目？',
    answer: '在项目管理页面点击「新建项目」按钮，填写项目名称、描述、状态、优先级等信息，点击确定即可创建。您还可以设置项目预算和标签。',
  },
  {
    question: '任务状态如何流转？',
    answer: '任务状态支持从「待办」到「进行中」再到「已完成」的标准流转。您可以在任务列表中直接点击状态下拉框进行切换，系统会自动记录状态变更历史。',
  },
  {
    question: '如何分配资源到项目？',
    answer: '在资源管理页面选择要分配的资源，点击编辑按钮，在表单中设置资源的可用性和分配情况。系统会自动检测资源冲突并给出预警提示。',
  },
  {
    question: '如何导出数据报表？',
    answer: '在数据导出页面选择要导出的数据类型（项目、任务、风险等），选择导出格式（CSV、JSON），点击导出按钮即可下载报表文件。',
  },
  {
    question: '如何设置用户权限？',
    answer: '在权限管理页面，您可以创建角色、设置角色权限、管理用户组。系统支持细粒度的权限控制，包括查看、编辑、删除等操作权限。',
  },
];

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      message.info(`搜索: ${searchQuery}`);
    }
  };

  const handleFeedback = () => {
    if (feedback.trim()) {
      message.success('反馈已提交，感谢您的意见！');
      setFeedback('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>帮助中心</Title>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Search
            placeholder="搜索帮助文档..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: 500 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <Card title="帮助分类">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {helpCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(activeCategory === category.id ? '' : category.id)}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeCategory === category.id ? 'var(--color-accent-light)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                <span>
                  <span style={{ marginRight: 8 }}>{category.icon}</span>
                  {category.name}
                </span>
                <Tag>{category.count}</Tag>
              </button>
            ))}
          </div>
        </Card>

        <div>
          <Card title="热门文章" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentArticles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  className="article-link"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileTextOutlined style={{ color: 'var(--color-muted)' }} />
                    <span>{article.title}</span>
                  </div>
                  <RightOutlined style={{ color: 'var(--color-muted)' }} />
                </button>
              ))}
            </div>
          </Card>

          <Card title="常见问题" style={{ marginBottom: 16 }}>
            <Collapse defaultActiveKey={['1']}>
              {faqs.map((faq, index) => (
                <Panel key={String(index + 1)} header={faq.question}>
                  <Text>{faq.answer}</Text>
                </Panel>
              ))}
            </Collapse>
          </Card>

          <Card title="意见反馈">
            <Text style={{ marginBottom: 12, display: 'block' }}>
              您的反馈对我们很重要，如有问题或建议，请告诉我们：
            </Text>
            <Input.TextArea
              placeholder="请输入您的反馈内容..."
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<SendOutlined />} onClick={handleFeedback}>
                提交反馈
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Help;