# PMOS - 项目管理平台 | 项目架构与实现计划

> 版本: v1.0-alpha  
> 创建日期: 2026-05-21  
> 状态: 规划阶段

---

## 一、项目概述

PMOS (Project Management Operating System) 是面向专业 PMO 领域的企业级项目管理平台,提供项目全生命周期管理、资源调度、风险控制、需求追踪等核心能力。

### 1.1 核心业务模块

| 模块 | 功能描述 | 优先级 |
|------|----------|--------|
| 概览面板 | KPI 仪表盘、预警中心、快捷操作 | P0 |
| 项目管理 | 项目看板、甘特图、预算分析、里程碑 | P0 |
| 资源管理 | 人员管理、资源分配、负载监控 | P0 |
| 计划管理 | 任务计划、排期管理、进度跟踪 | P0 |
| 风险管理 | 风险识别、评估、应对策略 | P1 |
| 沟通管理 | 项目沟通记录、会议纪要 | P1 |
| 需求管理 | 需求收集、评审、追踪、变更 | P1 |
| 开发管理 | 开发任务、代码关联、迭代管理 | P1 |
| 测试管理 | 测试用例、缺陷追踪、测试报告 | P1 |
| 配置管理 | 配置项管理、版本控制 | P2 |
| 演练管理 | 应急演练、预案管理 | P2 |
| 投产管理 | 发布计划、上线审批、回滚预案 | P2 |
| 工作管理 | 考勤、工时统计 | P2 |
| 用户管理 | 角色权限、用户管理 | P0 |
| 系统设置 | 系统配置、通知设置 | P1 |

---

## 二、技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web App   │  │  Mobile H5  │  │   Admin Dashboard   │ │
│  │  (React)    │  │  (响应式)    │  │   (数据可视化)       │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────────┼────────────┘
          │                │                    │
          └────────────────┼────────────────────┘
                           │ HTTPS / WebSocket
┌──────────────────────────┼─────────────────────────────────┐
│                     API Gateway                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Nginx / Traefik (路由、限流、SSL、CORS)               │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────┐
│                    Backend Services                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  FastAPI Application (Python 3.12+)                    │ │
│  │  ├── Auth Service        (认证/授权/JWT)               │ │
│  │  ├── Project Service     (项目核心业务)                 │ │
│  │  ├── Resource Service    (资源调度)                     │ │
│  │  ├── Task Service        (任务/计划)                    │ │
│  │  ├── Risk Service        (风险管理)                     │ │
│  │  ├── Notification Service (通知/消息队列)               │ │
│  │  └── Report Service      (报表/统计)                    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────┐
│                    Data Layer                                │
│  ┌────────────┐  ┌────────────┐  ┌───────────────────────┐ │
│  │  MongoDB   │  │   Redis    │  │  RabbitMQ / Kafka     │ │
│  │ (主数据库)  │  │ (缓存/会话) │  │  (异步任务/事件驱动)    │ │
│  └────────────┘  └────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 前端技术栈

| 技术 | 选型 | 说明 |
|------|------|------|
| 框架 | React 18+ | 函数式组件 + Hooks |
| 构建工具 | Vite 5+ | 快速热更新、ESM 原生支持 |
| 语言 | TypeScript 5+ | 类型安全 |
| UI 组件库 | Ant Design 5+ | 企业级组件库 |
| 样式方案 | Tailwind CSS + CSS Variables | OKLCH 色彩系统 |
| 状态管理 | Redux Toolkit + RTK Query | 全局状态 + 数据请求 |
| 路由 | React Router 6+ | 客户端路由 |
| 图表库 | ECharts 5+ | 数据可视化 |
| 表单 | React Hook Form + Zod | 表单验证 |
| HTTP 客户端 | Axios + RTK Query | API 请求 |
| 日期处理 | dayjs | 轻量日期库 |
| 测试 | Vitest + React Testing Library | 单元测试 |
| 代码规范 | ESLint + Prettier | 代码质量 |

### 2.3 后端技术栈

| 技术 | 选型 | 说明 |
|------|------|------|
| 运行时 | Python 3.12+ | 使用 uv 管理环境 |
| Web 框架 | FastAPI | 异步高性能 API |
| 数据库驱动 | Motor (异步 MongoDB) | 异步操作 |
| 缓存 | redis-py (async) | Redis 客户端 |
| 认证 | PyJWT + Passlib | JWT 认证 |
| 数据验证 | Pydantic V2 | 数据模型验证 |
| 任务队列 | Celery + RabbitMQ | 异步任务 |
| 日志 | Loguru | 结构化日志 |
| 测试 | pytest + httpx | API 测试 |
| 文档 | FastAPI 自动生成 OpenAPI | API 文档 |

### 2.4 基础设施

| 组件 | 选型 | 说明 |
|------|------|------|
| 容器 | Docker + Docker Compose | 本地开发/部署 |
| 编排 | Kubernetes (生产) | 容器编排 |
| CI/CD | GitHub Actions | 自动化流水线 |
| 监控 | Prometheus + Grafana | 指标监控 |
| 日志 | ELK Stack (可选) | 日志聚合 |
| 反向代理 | Nginx | 静态资源 + API 代理 |

---

## 三、项目目录结构

### 3.1 整体结构

```
PMOS/
├── frontend/                    # 前端项目
│   ├── public/                  # 静态资源
│   ├── src/
│   │   ├── api/                 # API 请求层
│   │   │   ├── client.ts        # Axios 实例配置
│   │   │   ├── auth.ts          # 认证 API
│   │   │   ├── projects.ts      # 项目 API
│   │   │   ├── resources.ts     # 资源 API
│   │   │   ├── tasks.ts         # 任务 API
│   │   │   ├── risks.ts         # 风险 API
│   │   │   └── ...              # 其他模块 API
│   │   ├── assets/              # 静态资源 (图片、字体)
│   │   ├── components/          # 公共组件
│   │   │   ├── layout/          # 布局组件
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── common/          # 通用组件
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── ModuleCard.tsx
│   │   │   │   ├── StatusPill.tsx
│   │   │   │   ├── ChartCard.tsx
│   │   │   │   └── AlertCard.tsx
│   │   │   ├── charts/          # 图表组件
│   │   │   │   ├── DonutChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   └── LineChart.tsx
│   │   │   └── form/            # 表单组件
│   │   ├── features/            # 功能模块 (按领域划分)
│   │   │   ├── dashboard/       # 概览面板
│   │   │   ├── projects/        # 项目管理
│   │   │   ├── resources/       # 资源管理
│   │   │   ├── planning/        # 计划管理
│   │   │   ├── risks/           # 风险管理
│   │   │   ├── communication/   # 沟通管理
│   │   │   ├── requirements/    # 需求管理
│   │   │   ├── development/     # 开发管理
│   │   │   ├── testing/         # 测试管理
│   │   │   ├── configuration/   # 配置管理
│   │   │   ├── drill/           # 演练管理
│   │   │   ├── deployment/      # 投产管理
│   │   │   └── work/            # 工作管理
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── store/               # Redux Store
│   │   │   ├── index.ts         # Store 配置
│   │   │   ├── slices/          # Redux Slices
│   │   │   └── services/        # RTK Query Services
│   │   ├── styles/              # 全局样式
│   │   │   ├── tokens.css       # Design Tokens (OKLCH)
│   │   │   ├── global.css       # 全局样式
│   │   │   └── theme.ts         # Ant Design 主题配置
│   │   ├── types/               # TypeScript 类型定义
│   │   │   ├── api.d.ts
│   │   │   ├── models.d.ts
│   │   │   └── index.d.ts
│   │   ├── utils/               # 工具函数
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── routes/              # 路由配置
│   │   │   ├── index.tsx
│   │   │   └── protected.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.development
│   ├── .env.production
│   └── .eslintrc.cjs
│
├── backend/                     # 后端项目
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI 入口
│   │   ├── config.py            # 配置管理
│   │   ├── dependencies.py      # 依赖注入
│   │   ├── models/              # 数据模型 (MongoDB)
│   │   │   ├── base.py          # 基础模型
│   │   │   ├── user.py          # 用户模型
│   │   │   ├── project.py       # 项目模型
│   │   │   ├── task.py          # 任务模型
│   │   │   ├── resource.py      # 资源模型
│   │   │   ├── risk.py          # 风险模型
│   │   │   ├── requirement.py   # 需求模型
│   │   │   └── ...              # 其他模型
│   │   ├── schemas/             # Pydantic 数据验证
│   │   │   ├── auth.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   └── ...
│   │   ├── services/            # 业务逻辑层
│   │   │   ├── auth_service.py
│   │   │   ├── project_service.py
│   │   │   ├── task_service.py
│   │   │   └── ...
│   │   ├── api/                 # API 路由层
│   │   │   ├── __init__.py
│   │   │   ├── v1/              # API 版本控制
│   │   │   │   ├── auth.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── tasks.py
│   │   │   │   └── ...
│   │   │   └── deps.py
│   │   ├── core/                # 核心功能
│   │   │   ├── security.py      # 安全 (JWT/密码)
│   │   │   ├── database.py      # 数据库连接
│   │   │   ├── cache.py         # 缓存管理
│   │   │   └── events.py        # 应用事件
│   │   └── workers/             # 异步任务
│   │       ├── celery_app.py
│   │       ├── tasks.py
│   │       └── schedulers.py
│   ├── tests/                   # 测试文件
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_projects.py
│   │   └── ...
│   ├── pyproject.toml           # uv 项目配置
│   ├── uv.lock
│   ├── Dockerfile
│   └── .env.example
│
├── infrastructure/              # 基础设施配置
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   ├── nginx.conf
│   │   └── Dockerfile.*
│   ├── k8s/                     # Kubernetes 配置
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   └── monitoring/
│       ├── prometheus.yml
│       └── grafana/
│
├── docs/                        # 项目文档 (已有)
│   ├── SPEC.md                  # 技术栈约束
│   ├── DESIGN_PMOS.md           # PMOS 设计规范
│   ├── DESIGN_Stripe.md         # 设计灵感参考
│   ├── API.md                   # API 文档 (待生成)
│   └── DATABASE.md              # 数据库设计文档
│
├── design/                      # UI 原型 (已有)
│   └── *.html
│
├── scripts/                     # 辅助脚本
│   ├── init-db.ts               # 数据库初始化
│   └── seed-data.py             # 测试数据填充
│
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI 流程
│       └── deploy.yml           # 部署流程
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 四、数据库设计

### 4.1 核心数据模型

#### User (用户)
```typescript
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}
```

#### Project (项目)
```typescript
interface Project {
  _id: ObjectId;
  code: string;              // 项目编号 (e.g., PRJ-2024-001)
  name: string;
  description: string;
  owner_id: ObjectId;        // 项目负责人
  stakeholders: ObjectId[];  // 项目干系人
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: Date;
  end_date?: Date;
  budget: {
    total: number;
    used: number;
    currency: string;
  };
  progress: number;          // 0-100
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
```

#### Task (任务)
```typescript
interface Task {
  _id: ObjectId;
  project_id: ObjectId;
  parent_task_id?: ObjectId;  // 支持子任务
  title: string;
  description: string;
  assignee_id?: ObjectId;
  reporter_id: ObjectId;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'feature' | 'bug' | 'task' | 'milestone';
  estimate_hours?: number;
  actual_hours?: number;
  start_date?: Date;
  due_date?: Date;
  completed_at?: Date;
  dependencies: ObjectId[];   // 前置任务
  tags: string[];
  attachments: string[];
  created_at: Date;
  updated_at: Date;
}
```

#### Resource (资源)
```typescript
interface Resource {
  _id: ObjectId;
  name: string;               // 资源名称
  type: 'human' | 'equipment' | 'budget';
  category: string;           // 分类 (e.g., 开发、测试、设计)
  capacity: number;           // 可用容量 (人天/小时)
  allocated: number;          // 已分配容量
  availability: 'available' | 'busy' | 'unavailable';
  skills?: string[];          // 技能标签
  cost_per_hour?: number;
  created_at: Date;
  updated_at: Date;
}
```

#### Risk (风险)
```typescript
interface Risk {
  _id: ObjectId;
  project_id: ObjectId;
  title: string;
  description: string;
  category: 'technical' | 'schedule' | 'budget' | 'resource' | 'external';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  severity: number;           // 1-10, 自动计算
  status: 'identified' | 'assessed' | 'mitigating' | 'closed';
  owner_id: ObjectId;
  mitigation_plan: string;
  contingency_plan?: string;
  triggered_at?: Date;
  closed_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

#### Requirement (需求)
```typescript
interface Requirement {
  _id: ObjectId;
  project_id: ObjectId;
  code: string;               // 需求编号 (e.g., REQ-001)
  title: string;
  description: string;
  type: 'functional' | 'non_functional' | 'business' | 'technical';
  status: 'draft' | 'reviewing' | 'approved' | 'in_progress' | 'done' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;             // 需求来源
  acceptance_criteria: string[];
  related_tasks: ObjectId[];
  version: number;
  created_at: Date;
  updated_at: Date;
}
```

### 4.2 集合索引策略

```javascript
// 主要索引
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1, status: 1 });

db.projects.createIndex({ code: 1 }, { unique: true });
db.projects.createIndex({ owner_id: 1 });
db.projects.createIndex({ status: 1, priority: 1 });
db.projects.createIndex({ start_date: 1, end_date: 1 });

db.tasks.createIndex({ project_id: 1 });
db.tasks.createIndex({ assignee_id: 1 });
db.tasks.createIndex({ status: 1, priority: 1 });
db.tasks.createIndex({ due_date: 1 });
db.tasks.createIndex({ project_id: 1, status: 1 });

db.risks.createIndex({ project_id: 1 });
db.risks.createIndex({ status: 1, severity: -1 });

db.requirements.createIndex({ project_id: 1 });
db.requirements.createIndex({ code: 1 }, { unique: true });
db.requirements.createIndex({ status: 1, priority: 1 });
```

---

## 五、API 设计规范

### 5.1 RESTful API 约定

```
# 版本前缀
/api/v1/

# 资源操作
GET    /api/v1/projects           # 获取项目列表
GET    /api/v1/projects/{id}      # 获取项目详情
POST   /api/v1/projects           # 创建项目
PUT    /api/v1/projects/{id}      # 更新项目
DELETE /api/v1/projects/{id}      # 删除项目

# 嵌套资源
GET    /api/v1/projects/{id}/tasks          # 获取项目任务列表
POST   /api/v1/projects/{id}/tasks          # 创建项目任务
GET    /api/v1/projects/{id}/risks          # 获取项目风险列表

# 特殊操作
POST   /api/v1/projects/{id}/archive        # 归档项目
POST   /api/v1/projects/{id}/clone          # 克隆项目
GET    /api/v1/projects/stats               # 获取项目统计
```

### 5.2 统一响应格式

```json
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": { ... }
}

// 分页响应
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}

// 错误响应
{
  "code": 400,
  "message": "Validation error",
  "errors": [
    { "field": "name", "message": "Name is required" }
  ]
}
```

### 5.3 认证与安全

```python
# 认证方式: JWT Bearer Token
# Headers:
Authorization: Bearer <token>

# Token 结构:
{
  "sub": "user_id",
  "role": "admin",
  "permissions": ["project:read", "project:write"],
  "exp": 1700000000,
  "iat": 1699996400
}

# 密码策略:
# - 最小长度 8 字符
# - 包含大小写字母、数字、特殊字符
# - bcrypt 哈希存储
```

---

## 六、分阶段开发计划

### Phase 1: 项目基础搭建 (Week 1-2)

**目标**: 完成项目框架搭建,跑通开发流程

#### 前端
- [x] 初始化 React + TypeScript + Vite 项目
- [x] 配置 Tailwind CSS + Design Tokens (OKLCH)
- [x] 集成 Ant Design 并定制主题
- [x] 配置 Redux Toolkit + RTK Query
- [x] 搭建基础布局 (Header + Sidebar + Main)
- [x] 实现路由框架
- [x] 开发公共组件 (KPICard, ModuleCard, StatusPill, etc.)
- [x] 配置代码规范 (ESLint + Prettier)

#### 后端
- [x] 初始化 FastAPI 项目 (uv + pyproject.toml)
- [x] 配置 MongoDB 连接 (Motor)
- [x] 配置 Redis 连接
- [x] 实现基础数据模型 (User, Project)
- [x] 实现 JWT 认证 (注册/登录/刷新)
- [x] 配置 CORS、错误处理
- [x] 实现基础 CRUD API
- [x] 配置 Pydantic V2 数据验证

#### 基础设施
- [x] Docker Compose 环境 (MongoDB + Redis)
- [x] 前端/后端 Dockerfile
- [x] 本地开发环境启动脚本
- [x] CI/CD 基础流程 (GitHub Actions)

### Phase 2: 核心功能开发 (Week 3-5)

**目标**: 实现项目管理核心功能

#### 项目管理模块
- [ ] 项目列表 (表格/卡片视图)
- [ ] 项目创建/编辑/删除
- [ ] 项目详情页 (Tabs: 概览/任务/风险/预算)
- [ ] 项目搜索与筛选
- [ ] 项目克隆功能
- [ ] 项目状态流转

#### 任务管理模块
- [ ] 任务 CRUD 操作
- [ ] 任务列表 (表格/看板视图)
- [ ] 任务分配与状态更新
- [ ] 任务优先级管理
- [ ] 任务依赖关系
- [ ] 子任务支持

#### 资源管理模块
- [ ] 资源列表与详情
- [ ] 资源分配管理
- [ ] 资源负载监控
- [ ] 资源冲突检测

#### 概览面板
- [ ] KPI 数据聚合
- [ ] 预警中心 (三级预警)
- [ ] 快捷操作入口
- [ ] 图表展示 (ECharts)

### Phase 3: 高级功能开发 (Week 6-8)

**目标**: 实现 PMO 高级管理功能

#### 风险管理
- [ ] 风险识别与评估
- [ ] 风险矩阵可视化
- [ ] 风险应对策略
- [ ] 风险预警与通知

#### 需求管理
- [ ] 需求收集与评审
- [ ] 需求追踪矩阵
- [ ] 需求变更管理
- [ ] 需求与任务关联

#### 开发管理
- [ ] 开发任务看板
- [ ] 代码仓库集成 (可选)
- [ ] 迭代管理
- [ ] 代码审查记录

#### 测试管理
- [ ] 测试用例管理
- [ ] 缺陷追踪
- [ ] 测试报告生成
- [ ] 测试覆盖率统计

### Phase 4: 报表与可视化 (Week 9-10)

**目标**: 实现数据分析和可视化

#### 数据可视化
- [ ] 项目状态分布图 (环形图)
- [ ] 任务优先级分布 (条形图)
- [ ] 项目进度趋势 (折线图)
- [ ] 资源利用率 (热力图)
- [ ] 预算使用情况 (仪表盘)

#### 甘特图
- [ ] 项目甘特图实现
- [ ] 任务时间轴展示
- [ ] 依赖关系可视化
- [ ] 关键路径标识

#### 报表导出
- [ ] PDF 报表导出
- [ ] Excel 导出
- [ ] 自定义报表模板
- [ ] 定时报表发送

### Phase 5: 系统完善与优化 (Week 11-12)

**目标**: 完善系统功能,优化性能

#### 用户与权限
- [ ] 角色权限管理 (RBAC)
- [ ] 用户分组管理
- [ ] 操作日志审计
- [ ] 登录安全 (2FA 可选)

#### 通知系统
- [ ] 站内消息中心
- [ ] 邮件通知
- [ ] 实时推送 (WebSocket)
- [ ] 通知偏好设置

#### 性能优化
- [ ] API 响应缓存 (Redis)
- [ ] 数据库查询优化
- [ ] 前端懒加载与代码分割
- [ ] 图片资源优化
- [ ] 大数据列表虚拟滚动

#### 其他模块
- [ ] 沟通管理
- [ ] 配置管理
- [ ] 演练管理
- [ ] 投产管理
- [ ] 工作管理 (考勤/工时)

### Phase 6: 测试与部署 (Week 13-14)

**目标**: 系统测试与生产部署

#### 测试
- [ ] 单元测试 (Vitest + pytest)
- [ ] 集成测试
- [ ] E2E 测试 (Playwright)
- [ ] 性能测试
- [ ] 安全测试

#### 部署
- [ ] Kubernetes 部署配置
- [ ] 环境配置管理 (dev/staging/prod)
- [ ] 数据库迁移脚本
- [ ] 监控与告警配置
- [ ] 日志聚合配置

#### 文档
- [ ] API 文档 (OpenAPI)
- [ ] 用户手册
- [ ] 部署文档
- [ ] 开发文档

---

## 七、关键设计决策

### 7.1 前端架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 项目结构 | Feature-based | 按业务领域组织,便于维护和扩展 |
| 状态管理 | Redux Toolkit | 成熟的生态系统,适合复杂企业应用 |
| 样式方案 | Tailwind + CSS Variables | 快速开发 + Design Token 复用 |
| 组件库 | Ant Design 5 | 企业级组件丰富,支持 Design Token |
| 数据获取 | RTK Query | 内置缓存,减少样板代码 |

### 7.2 后端架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 数据库 | MongoDB | 灵活的数据模型,适合项目管理多变结构 |
| ORM | 原生 Motor + Pydantic | 直接控制查询,Pydantic 提供类型验证 |
| 认证 | JWT | 无状态,适合前后端分离架构 |
| 异步任务 | Celery + RabbitMQ | 成熟的分布式任务队列 |
| API 设计 | RESTful | 成熟规范,生态完善 |

### 7.3 设计系统决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 色彩空间 | OKLCH | 感知均匀,更好的色彩控制 |
| 主色调 | 绿色 oklch(58% 0.16 145) | 专业、清新、符合 PMO 场景 |
| 布局 | Header + Sidebar + Main | 经典企业管理布局 |
| 图表 | ECharts | 功能丰富,支持自定义主题 |
| 字体 | 系统字体栈 | 无需加载外部字体,性能优先 |

---

## 八、开发规范

### 8.1 前端规范

```typescript
// 组件命名: PascalCase (UserProfile.tsx)
// 文件命名: kebab-case (user-profile.tsx) - 非组件
// Hook 命名: use + camelCase (useProjectData)

// 组件结构:
export const ProjectCard: React.FC<ProjectCardProps> = ({ ... }) => {
  // 1. Hooks
  const dispatch = useAppDispatch();
  
  // 2. State
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 3. Effects
  useEffect(() => { ... }, []);
  
  // 4. Handlers
  const handleAction = () => { ... };
  
  // 5. Render
  return <div>...</div>;
};

// API 请求使用 RTK Query:
export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    createProject: builder.mutation<Project, CreateProjectInput>({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});
```

### 8.2 后端规范

```python
# API 路由结构:
@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取项目列表,支持分页和筛选"""
    ...

# Service 层:
class ProjectService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.projects
    
    async def create(self, data: ProjectCreate) -> Project:
        project = Project(**data.model_dump())
        result = await self.collection.insert_one(project.to_mongo())
        project.id = result.inserted_id
        return project

# 模型定义:
class Project(BaseModel):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    code: str
    name: str
    status: ProjectStatus
    # ...
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
```

### 8.3 Git 提交规范

```
feat: 新增项目克隆功能
fix: 修复任务分配权限校验问题
docs: 更新 API 文档
style: 调整 KPI 卡片样式
refactor: 重构数据库连接模块
test: 添加项目服务单元测试
chore: 更新依赖版本

格式: <type>(<scope>): <subject>

type: feat|fix|docs|style|refactor|test|chore|perf
scope: 可选,模块名称
subject: 简短描述
```

---

## 九、环境变量配置

### 9.1 前端环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:18001
VITE_WS_URL=ws://localhost:18001
VITE_APP_NAME=PMOS
VITE_PORT=16001

# .env.production
VITE_API_BASE_URL=/api
VITE_WS_URL=wss://${window.location.host}
VITE_APP_NAME=PMOS
```

### 9.2 后端环境变量

```bash
# .env.example
# Application
APP_NAME=PMOS Backend
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-here
API_PREFIX=/api/v1
HOST=0.0.0.0
PORT=18001

# Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=pmos

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Celery
CELERY_BROKER_URL=amqp://guest:guest@localhost:5672/
CELERY_RESULT_BACKEND=redis://localhost:6379/1
```

---

## 十、部署架构

### 10.1 Docker Compose (开发环境)

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "16001:16001"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_BASE_URL=http://backend:18001
      - VITE_PORT=16001
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "18001:18001"
    volumes:
      - ./backend:/app
    environment:
      - MONGODB_URL=mongodb://mongo:27017
      - REDIS_URL=redis://redis:6379/0
      - PORT=18001
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  mongo_data:
```

### 10.2 生产部署 (Kubernetes)

```yaml
# 简要架构:
# - Ingress (Nginx) -> Frontend Service (3 replicas)
#                    -> Backend Service (3 replicas)
#                    -> API Gateway
#
# - StatefulSet: MongoDB Replica Set (3 nodes)
# - StatefulSet: Redis Sentinel (3 nodes)
# - Deployment: RabbitMQ Cluster
#
# - Monitoring: Prometheus + Grafana
# - Logging: Fluentd + Elasticsearch
```

---

## 十一、风险控制

### 11.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| MongoDB 性能瓶颈 | 高 | 合理设计索引,使用聚合管道优化查询 |
| 前端状态管理复杂度高 | 中 | 使用 RTK Query 简化数据流 |
| 权限系统复杂度 | 中 | 采用 RBAC 模型,预留 ABAC 扩展空间 |
| 实时通知性能 | 中 | WebSocket 连接池,消息队列削峰 |

### 11.2 项目风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 需求变更频繁 | 高 | 模块化设计,预留扩展点 |
| 开发周期延误 | 中 | 分阶段交付,优先级排序 |
| 团队技术栈不熟悉 | 中 | 提前技术预研,编写详细文档 |

---

## 十二、下一步行动

1. **确认技术方案** - 审核本文档,确认技术选型
2. **初始化项目** - 搭建前后端基础框架
3. **Design Token 实现** - 将 DESIGN_PMOS.md 转化为代码
4. **核心组件开发** - 实现 Layout 和公共组件
5. **API 开发** - 实现用户认证和项目 CRUD

---

## 附录

### A. 设计资源
- [design/dashboard.html](file:///Users/hefeng/AiApp/PMOS/design/dashboard.html) - 概览面板原型
- [design/project-management.html](file:///Users/hefeng/AiApp/PMOS/design/project-management.html) - 项目管理原型
- [docs/DESIGN_PMOS.md](file:///Users/hefeng/AiApp/PMOS/docs/DESIGN_PMOS.md) - PMOS 设计规范
- [docs/SPEC.md](file:///Users/hefeng/AiApp/PMOS/docs/SPEC.md) - 技术栈约束

### B. 参考资源
- Ant Design 5: https://ant.design/
- FastAPI: https://fastapi.tiangolo.com/
- Redux Toolkit: https://redux-toolkit.js.org/
- RTK Query: https://redux-toolkit.js.org/rtk-query/overview
- Motor (MongoDB): https://motor.readthedocs.io/

### C. 相关文档
- API 设计参考: OpenAPI 3.0 Specification
- 安全最佳实践: OWASP Top 10
- 数据库设计规范: MongoDB Schema Design Patterns
