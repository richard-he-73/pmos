# PMOS — Project Management Operating System

**企业级项目管理平台**，覆盖项目全生命周期管理，包括需求、计划、测试、资源、发布、工作管理等模块。

## 技术栈

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.12+ | 运行时 |
| Django | 5.1+ | Web 框架 |
| Django REST Framework | 3.15+ | REST API |
| PostgreSQL | 16 | 数据库 |
| Celery | 5.x | 异步任务 |
| Redis | 7 | 缓存/消息代理 |
| SimpleJWT | 5.3+ | JWT 认证 |
| django-guardian | 2.4+ | 对象级权限 |

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | UI 框架 |
| TypeScript | 6.0 | 语言 |
| Vite | 8.x | 构建工具 |
| Pinia | 3.x | 状态管理 |
| Vue Router | 5.x | 路由 |
| Tailwind CSS | 4.x | 样式 |
| Axios | 1.x | HTTP 客户端 |

## 项目结构

```
PMOS/
├── pmos/                       # Django 项目配置
├── apps/                       # Django 应用
│   ├── accounts/               # 账号/认证
│   ├── organizations/          # 组织架构
│   ├── projects/               # 项目管理
│   ├── plans/                  # 计划管理（含甘特图）
│   ├── requirements/           # 需求管理
│   ├── testing/                # 测试管理
│   ├── resources/              # 资源管理
│   ├── releases/               # 投产管理
│   ├── work_management/        # 工作管理
│   ├── communications/         # 沟通协作
│   ├── documents/              # 文档管理
│   ├── notifications/          # 消息通知
│   ├── statistics/             # 统计分析
│   └── system/                 # 系统管理
├── frontend/                   # Vue 3 前端
├── docs/                       # 项目文档
├── manage.py                   # Django 管理入口
├── docker-compose.yml          # Docker 编排
└── pyproject.toml              # 项目配置
```

## 快速开始

### 本地开发（uv）

```bash
# 安装依赖
uv sync

# 数据库迁移
uv run python manage.py migrate

# 创建管理员
uv run python manage.py createsuperuser

# 启动开发服务器
uv run python manage.py runserver
```

### 前端

```bash
cd frontend
npm install
npm run dev  # 默认端口 16001
```

### Docker 部署

```bash
# 启动全部服务
docker compose up -d

# 仅启动基础设施（PostgreSQL + Redis）
docker compose up -d postgres redis
```

## 测试

```bash
# 后端测试（38+ 测试用例）
uv run pytest

# 代码检查
uv run ruff check .

# 代码格式化
uv run ruff format .
```

## 功能模块

| 模块 | 说明 | 后端 | 前端 |
|------|------|------|------|
| 账号管理 | 用户、角色、JWT 认证 | ✅ | ✅ |
| 项目管理 | 项目 CRUD、状态管理、合同管理 | ✅ | ✅ |
| 计划管理 | 里程碑/中层/详细计划、甘特图 | ✅ | ✅ |
| 任务管理 | 任务分配、状态追踪 | ✅ | ✅ |
| 需求管理 | 业务需求、软件需求 | ✅ | ✅ |
| 测试管理 | 测试计划、用例、缺陷 | ✅ | ✅ |
| 资源管理 | 咨询人员、项目资源、变更日志 | ✅ | ✅ |
| 投产管理 | 投产演练、投产指挥、投产步骤 | ✅ | ✅ |
| 工作管理 | 设备、请假、工时 | ✅ | ✅ |
| 沟通管理 | 沟通类型、沟通记录 | ✅ | ✅ |
| 文档管理 | 文档分类、文档上传、归档 | ✅ | ✅ |
| 消息通知 | 通知、通知模板 | ✅ | ✅ |
| 组织架构 | 部门、组织成员 | ✅ | ✅ |
| 统计分析 | 项目概览、缺陷趋势、工时统计 | ✅ | ✅ |
| 系统管理 | 系统配置、操作日志、数据备份 | ✅ | ✅ |

## 环境变量

参见 `.env.example`，关键变量：

- `DJANGO_SECRET_KEY` — Django 密钥
- `DB_NAME` / `DB_USER` / `DB_PASSWORD` — 数据库配置
- `CELERY_BROKER_URL` — Celery 消息代理地址
- `CORS_ALLOWED_ORIGINS` — CORS 允许源

## 许可证

MIT
