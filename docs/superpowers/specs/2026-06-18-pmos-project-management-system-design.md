# PMOS 项目管理系统 — 设计规格文档

> **Project Management Operating System** — 企业级项目管理平台  
> 类似禅道，企业内部私有部署，Python + Vue 技术栈

---

## 1. 项目概述

### 1.1 定位

企业内部私有部署的项目管理系统，覆盖研发团队和行政管理的完整业务流程，包括项目、计划、需求、测试、资源、沟通、工作管理、文档、统计等 12 个核心模块，一期全部上线。

### 1.2 核心约束

| 分类 | 约束 |
|------|------|
| **部署形态** | 企业内部私有部署（单租户） |
| **后端语言** | Python 3.12+ |
| **后端框架** | Django 5.x + Django REST Framework |
| **数据库** | PostgreSQL 16+ |
| **缓存/队列** | Redis（缓存 + Celery Broker） |
| **异步任务** | Celery |
| **Python 管理** | uv（现代 Python 包管理器） |
| **前端框架** | Vue 3 (Composition API) |
| **前端 UI** | TDesign (Vue 3) |
| **响应式设计** | 同时支持 Web 桌面端和移动端浏览器 |
| **明暗主题** | 支持亮色/暗色主题切换，跟随系统偏好 |
| **部署方式** | Docker Compose |
| **目标用户** | 企业内部团队（百人级并发） |
| **安全要求** | 内网部署，操作日志审计 |
| **语言** | 中文为主 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌──────────────────────────────────────────┐
│              Vue 3 SPA                    │
│  (TDesign + Vue Router + Pinia)           │
└──────────────────┬───────────────────────┘
                   │ REST API (JSON)
┌──────────────────▼───────────────────────┐
│           Nginx (反向代理)                 │
├──────────────────────────────────────────┤
│         Django REST Framework            │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐   │
│  │  API    │ │ Django   │ │ Celery  │   │
│  │  Views  │ │  Admin   │ │  Tasks  │   │
│  └────┬────┘ └────┬─────┘ └────┬────┘   │
│       │           │            │         │
│  ┌────▼───────────▼────────────▼─────┐   │
│  │         Service Layer             │   │
│  │  (业务逻辑、权限校验、事务管理)      │   │
│  └────────────────┬──────────────────┘   │
│                   │                       │
│  ┌────────────────▼──────────────────┐  │
│  │      Django ORM / Models           │  │
│  └────────────────┬──────────────────┘  │
└───────────────────┬────────────────────┘
                    │
┌───────────────────▼────────────────────┐
│         PostgreSQL                     │
└────────────────────────────────────────┘

         Redis (Cache + Celery Broker)
```

### 2.2 后端分层

| 层 | 职责 | 技术 |
|----|------|------|
| **API 层** | 请求入口、序列化、校验、权限检查 | DRF ViewSet + Serializer + Permission |
| **Service 层** | 业务逻辑、事务管理、跨模型操作 | 自定义 Service 类 |
| **Model 层** | 数据模型定义、ORM 查询 | Django Models |
| **Task 层** | 异步任务（通知、报表、定时任务） | Celery |

### 2.3 数据流

```
用户操作 → Vue → Pinia → axios → Nginx
    → Django ViewSet → Serializer → Permission Check
    → Service → ORM → PostgreSQL
    → Response → Store Update → UI Re-render

异步: ViewSet → Celery Task → Redis → Worker → DB
```

---

## 3. 模块划分

### 3.1 Django App 结构

```
pmos/                          # 项目配置
├── pmos/                      # Django settings/urls/wsgi
├── apps/
│   ├── accounts/              # 用户、认证、角色、权限
│   ├── projects/              # 项目管理
│   ├── plans/                 # 计划管理（甘特图+任务）
│   ├── requirements/          # 需求管理（业务需求/软件需求）
│   ├── testing/               # 测试管理（计划/用例/执行/缺陷）
│   ├── resources/             # 资源管理（人员进出）
│   ├── communications/        # 沟通管理
│   ├── work_management/       # 设备管理、请假销假、工时
│   ├── documents/             # 文档管理
│   ├── statistics/            # 统计分析
│   ├── notifications/         # 消息通知
│   └── system/                # 系统管理（日志、配置）
├── static/
├── media/
└── frontend/                  # Vue 3 前端项目
```

### 3.2 模块功能清单

| 模块 | 子功能 | 核心模型 |
|------|--------|---------|
| **accounts** | 用户 CRUD、认证(JWT)、角色管理、权限分配 | User, Role, Permission, UserProjectRole |
| **projects** | 项目创建/详情/列表/关闭，项目成员管理 | Project, ProjectMember |
| **plans** | 里程碑计划、分组计划、详细计划，甘特图，任务管理 | Milestone, PlanGroup, Plan, Task |
| **requirements** | 业务需求、软件需求，版本规划，优先级排期 | BusinessRequirement, SoftwareRequirement |
| **testing** | 测试计划、测试用例、测试执行、缺陷管理 | TestPlan, TestCase, TestRun, Bug |
| **resources** | 项目人员信息、人员进出项目管理 | ProjectResource, ResourceChangeLog |
| **communications** | 沟通类型配置、沟通记录管理 | CommType, CommRecord |
| **work_management** | 设备登记/借还、请假申请/审批/销假、工时登记 | Equipment, Leave, Timesheet |
| **documents** | 文档分类、文档 CRUD、附件上传 | Document, DocumentCategory |
| **statistics** | 项目进度、工作统计、缺陷统计、工时统计 | (聚合查询/视图) |
| **notifications** | 通知生成/推送、已读管理、通知模板 | Notification, NotificationTemplate |
| **system** | 操作日志审计、系统参数配置 | OperationLog, SystemConfig |

---

## 4. 数据库设计

### 4.1 核心模型关系

```
Project 1──N Plan (里程碑/分组/详细计划)
                  │
                  N
                  Task
                  │
Requirement 1──N TestCase 1──N TestRun 1──N Bug
                  │                      │
                  └──────────────────────┘
                  
Project 1──N Communication
Project 1──N Document
Project 1──N Timesheet
User   1──N Timesheet, Leave
```

### 4.2 关键模型定义

#### accounts

```
User (extends AbstractUser)
├── id, username, email, password, is_active
├── profile: UserProfile (real_name, phone, avatar, position, department)

Role
├── id, name, code (admin|manager|member|viewer)
├── permissions: M2M(Permission)

UserProjectRole         ← 对象级权限（用户在项目中的角色）
├── user → User
├── project → Project
└── role → Role
```

#### projects

```
Project
├── id, name, code, description
├── status (planning|active|closed)
├── start_date, end_date
├── owner → User
└── members → ProjectMember[]

ProjectMember
├── user → User, project → Project
├── role → Role
├── join_date, leave_date
└── status (active|inactive)
```

#### plans

```
Plan (多级计划: 里程碑/分组/详细)
├── id, name, type (milestone|group|detail)
├── parent → Plan (自引用), project → Project
├── start_date, end_date, actual_end_date
├── status (draft|in_progress|completed|delayed)
├── progress (0-100), assignee → User
└── sort_order

Task
├── id, name, description
├── plan → Plan, project → Project
├── status (todo|in_progress|done|closed)
├── priority (urgent|high|medium|low)
├── assignee → User
├── start_date, due_date
├── est_hours, actual_hours
├── parent → Task (子任务)
└── sort_order
```

#### testing

```
TestPlan
├── id, name, version, status
├── project → Project, assignee → User
├── start_date, end_date
└── test_cases → M2M(TestCase)

TestCase
├── id, name, precondition, steps, expected_result
├── type (functional|performance|security)
├── priority, status, module
├── requirement → SoftwareRequirement
└── test_runs → TestRun[]

TestRun
├── id, test_case → TestCase, test_plan → TestPlan
├── executor → User
├── result (pass|fail|blocked|untested)
├── actual_result, notes
└── bugs → Bug[]

Bug
├── id, title, description
├── severity (critical|major|minor|trivial)
├── status (new|confirmed|in_progress|resolved|closed)
├── source (test|external|production)
├── reporter → User, assignee → User
├── related_test_run → TestRun
├── related_requirement → SoftwareRequirement
└── resolution (fixed|duplicate|not_a_bug|deferred)
```

---

## 5. API 设计

### 5.1 路由规范

```
/api/v1/{module}/
  GET    /             列表（分页+过滤+排序+搜索）
  POST   /             创建
  GET    /{id}/        详情
  PATCH  /{id}/        部分更新
  DELETE /{id}/        删除
  GET    /{id}/actions/ 对象级操作
```

### 5.2 主要 API 端点

| 模块 | 端点 | 说明 |
|------|------|------|
| auth | `POST /api/v1/auth/login/` | 登录获取 JWT |
| auth | `POST /api/v1/auth/refresh/` | 刷新 Token |
| users | `/api/v1/users/` | 用户 CRUD |
| roles | `/api/v1/roles/` | 角色管理 |
| projects | `/api/v1/projects/` | 项目 CRUD |
| projects | `/api/v1/projects/{id}/members/` | 项目成员 |
| projects | `/api/v1/projects/{id}/stats/` | 项目统计 |
| plans | `/api/v1/plans/?project={id}` | 计划列表 |
| plans | `/api/v1/plans/{id}/` | 计划详情含甘特图数据 |
| tasks | `/api/v1/tasks/?plan={id}` | 任务列表 |
| tasks | `PATCH /api/v1/tasks/{id}/status/` | 变更状态 |
| tasks | `PATCH /api/v1/tasks/{id}/move/` | 拖拽排序 |
| requirements | `/api/v1/requirements/` | 需求管理 |
| test-plans | `/api/v1/test-plans/` | 测试计划 |
| test-cases | `/api/v1/test-cases/` | 测试用例 |
| test-runs | `/api/v1/test-runs/` | 测试执行 |
| bugs | `/api/v1/bugs/` | 缺陷管理 |
| communications | `/api/v1/communications/` | 沟通记录 |
| equipments | `/api/v1/equipments/` | 设备管理 |
| leaves | `/api/v1/leaves/` | 请假销假 |
| timesheets | `/api/v1/timesheets/` | 工时管理 |
| documents | `/api/v1/documents/` | 文档管理 |
| notifications | `/api/v1/notifications/` | 我的通知 |
| statistics | `/api/v1/statistics/` | 统计报表 |
| system/logs | `/api/v1/system/logs/` | 操作日志 |
| system/config | `/api/v1/system/config/` | 系统配置 |

### 5.3 通用响应格式

```json
// 列表
{
  "count": 100,
  "next": "http://.../api/v1/projects/?page=2",
  "previous": null,
  "results": [...]
}

// 详情
{ "id": 1, "name": "...", ... }

// 错误
{ "detail": "错误信息", "code": "error_code" }
```

---

## 6. 权限设计

### 6.1 三层权限模型

```
系统级权限 (Django Permission)
├── 全局操作: add_project, change_user, delete_role
└── Django admin 自带管理

角色级权限 (Role)
├── 系统管理员: 所有权限
├── 项目管理员: 管理项目设置、成员
├── 项目成员: 查看项目、创建/编辑任务
└── 只读用户: 查看项目和数据

对象级权限 (django-guardian)
├── UserProjectRole: 用户在特定项目中的角色
└── 实现: `assign_perm('view_project', user, project)`
```

### 6.2 权限检查流程

```
用户请求 → DRF @permission_classes
  → 超级管理员? → 直接放行
  → 有全局权限? → 放行
  → 有对象级权限? (guardian) → 放行
  → 否则 → 403 Forbidden
```

---

## 7. 前端架构

### 7.1 技术选型

| 组件 | 选择 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| HTTP | axios + 拦截器（Token 注入/刷新） |
| UI 库 | TDesign (Vue 3) |
| 响应式方案 | TDesign 响应式布局 + CSS Grid/Flexbox + 移动端适配层 |
| 主题方案 | TDesign CSS Variables + `prefers-color-scheme` + localStorage 持久化 |
| 甘特图 | 自研或 dhtmlx-gantt / vue-ganttastic（移动端简化版） |
| 富文本 | TinyMCE / Tiptap |
| 构建 | Vite |

### 7.2 响应式设计与主题切换

#### 响应式设计策略

采用 **Mobile-First + 渐进增强** 策略，按三个断点适配：

| 断点 | 宽度 | 设备 | 布局特征 |
|------|------|------|---------|
| **mobile** | < 768px | 手机/小平板 | 单列布局，顶部导航栏，侧栏抽屉式，表格卡片化，底部导航栏 |
| **tablet** | 768px ~ 1200px | 平板/小屏笔记本 | 双列布局，侧栏可折叠，内容区域自适应 |
| **desktop** | > 1200px | 桌面显示器 | 三栏布局（侧栏+导航+内容），全功能甘特图和看板 |

**具体实现：**

```
移动端布局 (mobile):
┌─────────────┐
│ 顶栏 (汉堡菜单) │
├─────────────┤
│ 内容区 (全宽) │
│ 表格→卡片列表 │
├─────────────┤
│ 底部导航栏   │
│ 首页|项目|工作|我的 │
└─────────────┘

桌面端布局 (desktop):
┌──────┬──────────────┐
│ 侧栏 │ 顶栏 (面包屑+搜索+通知+主题) │
│ 项目 ├──────────────┤
│ 计划 │ 内容区                     │
│ 需求 │ 表格/看板/甘特图           │
│ 测试 │                            │
│ ...  │                            │
└──────┴────────────────────────────┘
```

**关键适配手段：**
- **TDesign 响应式组件** — `t-layout`、`t-row`/`t-col` 的响应式断点
- **CSS Media Queries** — 自定义断点，配合 CSS Grid 自适应
- **表格→卡片** — 桌面端用表格（`t-table`），移动端自动切换为卡片列表（`t-card` + `t-list`）
- **甘特图响应式** — 桌面端全功能，移动端显示简化摘要 + 可展开详情
- **导航抽屉** — 桌面端侧栏固定显示，移动端用 `t-drawer` 弹出
- **Vue Router 守卫** — 根据设备尺寸动态调整路由参数（如列表页每页条数）

#### 明暗主题切换策略

采用 **CSS Variables + TDesign 主题体系** 实现，分三层：

```
第一层：CSS 自定义属性
└── :root { --pmos-bg: #fff; --pmos-text: #333; ... }
└── [data-theme="dark"] { --pmos-bg: #1a1a2e; --pmos-text: #e0e0e0; ... }

第二层：TDesign 主题覆盖
└── tdesign-vue-next 提供 design-tokens（CSS Variables）
└── 调用 td.reset() / td.setTheme() 切换暗色模式

第三层：组件级样式
└── 每个 Vue 组件使用 var(--pmos-xxx) 引用主题变量
└── 使用 TDesign 内置深色模式兼容
```

**主题切换流程：**

```
用户点击主题切换按钮
  → Pinia store (useThemeStore)
    → toggleTheme()
      → document.documentElement.dataset.theme = 'dark' | 'light'
      → localStorage.setItem('pmos-theme', 'dark' | 'light')
      → TDesign 调用 setTheme('dark' | 'light') 更新组件主题
      
初始化时：
  → 检查 localStorage 是否有存储的主题
  → 若无，检查 window.matchMedia('prefers-color-scheme: dark')
  → 若都无，默认亮色
  → 监听系统主题变化 (matchMedia.addEventListener)
```

**涉及文件：**

```
frontend/src/
├── styles/
│   ├── variables.css         # CSS 自定义属性（主题色、间距、字体）
│   ├── theme-light.css       # 亮色主题变量
│   ├── theme-dark.css        # 暗色主题变量
│   ├── responsive.css        # 响应式断点和布局 mixins
│   └── global.css            # 全局样式引入上述文件
├── stores/
│   └── theme.js              # 主题状态管理（Pinia）
├── components/
│   └── ThemeToggle.vue       # 主题切换按钮组件
└── composables/
    └── useTheme.js           # 主题逻辑 composable（初始化、切换、监听）
```

### 7.3 目录结构

```
frontend/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   ├── index.js
│   │   └── modules/             # 按模块划分路由
│   ├── stores/
│   │   ├── auth.js              # 认证状态
│   │   ├── theme.js             # 主题状态（亮/暗）
│   │   ├── responsive.js        # 响应式状态（当前断点/设备类型）
│   │   ├── project.js           # 当前项目上下文
│   │   └── app.js               # 全局状态
│   ├── composables/
│   │   ├── useTheme.js          # 主题切换逻辑
│   │   ├── useResponsive.js     # 响应式断点检测
│   │   └── useMobileNav.js      # 移动端导航控制
│   ├── styles/
│   │   ├── variables.css        # CSS 自定义属性
│   │   ├── theme-light.css      # 亮色主题变量
│   │   ├── theme-dark.css       # 暗色主题变量
│   │   ├── responsive.css       # 响应式断点
│   │   └── global.css           # 全局样式
│   ├── api/
│   │   ├── request.js           # axios 封装
│   │   └── modules/             # 按模块 API 定义
│   ├── views/
│   │   ├── layout/              # 布局组件
│   │   │   ├── DesktopLayout.vue   # 桌面端布局（侧栏+顶栏+内容）
│   │   │   ├── MobileLayout.vue    # 移动端布局（顶栏+内容+底部导航）
│   │   │   ├── Sidebar.vue         # 侧栏导航
│   │   │   ├── Topbar.vue          # 顶栏（含主题切换、搜索、通知）
│   │   │   └── MobileBottomNav.vue # 移动端底部导航栏
│   │   ├── dashboard/           # 首页
│   │   ├── project/
│   │   ├── plan/                # 甘特图页面
│   │   ├── task/                # 看板视图
│   │   ├── requirement/
│   │   ├── test/
│   │   ├── bug/
│   │   ├── communication/
│   │   ├── work/                # 设备/请假/工时
│   │   ├── document/
│   │   ├── statistics/
│   │   ├── notification/
│   │   └── system/              # 用户/角色/日志/设置
│   ├── components/
│   │   ├── ThemeToggle.vue      # 主题切换按钮
│   │   ├── MobileNavBar.vue     # 移动端顶部导航栏
│   │   ├── ResponsiveTable.vue  # 自适应表格（桌面表格/移动卡片）
│   │   ├── GanttChart.vue       # 甘特图（桌面全功能/移动简化）
│   │   ├── KanbanBoard.vue      # 看板
│   │   ├── RichEditor.vue
│   │   ├── FileUploader.vue
│   │   └── common/              # 通用组件
│   └── utils/
│       ├── filters.js
│       ├── constants.js
│       └── helpers.js
└── vite.config.js
```

---

## 8. 部署架构

### 8.1 Docker Compose 部署

```yaml
services:
  nginx:
    image: nginx:latest
    ports: ["80:80", "443:443"]
    volumes: [./nginx.conf, ./frontend/dist, ./static, ./media]

  django:
    build: .
    env_file: .env
    command: gunicorn pmos.wsgi:application -w 4 -b :8000
    depends_on: [postgres, redis]

  celery-worker:
    build: .
    command: celery -A pmos worker -l info
    depends_on: [redis, postgres]

  celery-beat:
    build: .
    command: celery -A pmos beat -l info
    depends_on: [redis]

  postgres:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    env_file: .env

  redis:
    image: redis:7-alpine
```

### 8.2 环境依赖

| 依赖 | 用途 |
|------|------|
| Django 5.x | Web 框架 |
| djangorestframework | REST API |
| django-guardian | 对象级权限 |
| django-cors-headers | CORS |
| django-filter | API 过滤 |
| django-simple-history | 操作审计日志 |
| djangorestframework-simplejwt | JWT 认证 |
| psycopg2-binary | PostgreSQL 驱动 |
| celery | 异步任务 |
| redis | 缓存 + Broker |
| gunicorn | WSGI 服务器 |
| whitenoise | 静态文件服务 |
| openpyxl | Excel 导出 |
| xlsxwriter | 报表生成 |

---

## 9. 开发计划

### 9.1 阶段划分（全部一期交付）

| 阶段 | 内容 | 估算工时 |
|------|------|---------|
| **Phase 1** | 项目骨架：accounts + system + Docker 化 | 2 周 |
| **Phase 2** | 核心业务：projects + plans(gantt) + tasks | 4 周 |
| **Phase 3** | 质量体系：requirements + testing + bugs | 4 周 |
| **Phase 4** | 辅助功能：resources + communications + documents | 3 周 |
| **Phase 5** | 行政管理：equipment + leave + timesheet | 2 周 |
| **Phase 6** | 收尾：notifications + statistics + 联调测试 | 2 周 |
| **上线** | 部署、培训、文档 | 1 周 |
| **总计** | **12 模块** | **约 18 周（4-5 个月）** |

### 9.2 关键里程碑

| 里程碑 | 产出 |
|--------|------|
| M1 (Week 2) | 基础框架可用，用户登录+角色权限 |
| M2 (Week 6) | 项目+甘特图+任务功能上线可测 |
| M3 (Week 10) | 需求+测试+缺陷链路打通 |
| M4 (Week 15) | 所有功能开发完成 |
| M5 (Week 18) | 全量功能测试通过，部署上线 |

---

## 10. 质量要求

- **操作日志**：核心数据的增删改操作记录可追溯
- **数据校验**：前后端双重校验，Django Serializer + Pydantic 级校验
- **错误处理**：统一的错误响应格式
- **API 文档**：DRF 自动生成的可浏览 API
- **权限验证**：每个 API 端点都有权限控制
- **前端**：TDesign 提供一致的企业风格 UI

---

*本文档是 PMOS 项目管理系统的完整设计规格，经过与用户的迭代确认形成。*
