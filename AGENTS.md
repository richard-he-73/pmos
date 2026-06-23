# AGENTS.md — AI 协作约定

> 本文档为 AI 编码助手（包括但不限于 Kun、Cursor、Copilot 等）提供项目上下文和协作规范。
> 请 AI 在每次对话开始时阅读此文件，并严格遵循其中的约定。

---

## 1. 项目概览

PMOS (Project Management Operating System) — 企业级项目管理平台，覆盖项目全生命周期管理，包括需求、计划、测试、资源、发布、工作管理等模块。

---

## 2. 技术栈速查

### 后端

| 技术 | 版本 | 角色 |
|------|------|------|
| Python | 3.12+ | 运行语言 |
| Django | 5.1+ | Web 框架 |
| Django REST Framework | 3.15+ | REST API |
| PostgreSQL | 16 | 数据库 |
| Celery | 5.x | 异步任务队列 |
| Redis | 7 | 缓存 / 消息代理 |
| SimpleJWT | 5.3+ | JWT 认证 |
| django-guardian | 2.4+ | 对象级权限 |
| Gunicorn | 22.0+ | WSGI 服务器 |
| Ruff | 0.4+ | 代码检查 + 格式化 |
| Pytest | 8.0+ | 测试框架 |

### 前端

| 技术 | 版本 | 角色 |
|------|------|------|
| Vue | 3.5 | 框架 |
| TypeScript | 6.0 | 语言 |
| Vite | 8.x | 构建工具 |
| Pinia | 3.x | 状态管理 |
| Vue Router | 5.x | 路由 |
| Tailwind CSS | 4.x | 样式框架 |
| VueUse | 14.x | 组合式工具库 |
| Axios | 1.x | HTTP 客户端 |

### 基础设施

Docker Compose · PostgreSQL · Redis · Nginx · Celery worker + Celery beat

---

## 3. 目录结构约定

```
PMOS/
├── pmos/                        # Django 项目配置
│   ├── settings/                # 配置（base.py / dev.py / prod.py）
│   ├── urls.py                  # 根 URL 配置
│   ├── wsgi.py                  # WSGI 入口
│   └── celery.py                # Celery 配置
├── apps/                        # Django 应用
│   ├── accounts/                # 账号/认证
│   ├── organizations/           # 组织架构
│   ├── projects/                # 项目管理
│   ├── plans/                   # 计划管理
│   ├── requirements/            # 需求管理
│   ├── testing/                 # 测试管理
│   ├── resources/               # 资源管理
│   ├── releases/                # 发布管理
│   ├── work_management/         # 工作管理
│   ├── communications/          # 沟通协作
│   ├── documents/               # 文档管理
│   ├── notifications/           # 通知
│   ├── statistics/              # 统计
│   └── system/                  # 系统管理
├── frontend/                    # Vue 3 前端
│   ├── src/
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
├── docs/                        # 项目文档
├── scripts/                     # 运维脚本
├── data_backup/                 # 数据备份
├── manage.py                    # Django 管理入口
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── pyproject.toml
```

### 架构分层原则

```
┌──────────────────────────────┐
│  View / Serializer 层         │ ← 请求校验 + 响应序列化
├──────────────────────────────┤
│  业务逻辑层 (apps/*/)          │ ← models.py + views.py 中的核心逻辑
├──────────────────────────────┤
│  数据模型层 (models.py)        │ ← Django ORM 模型定义
├──────────────────────────────┤
│  DB / 外部适配器               │ ← PostgreSQL / Redis / 第三方 API
└──────────────────────────────┘
```

**不允许：** 在 View 中写复杂业务逻辑；在前端组件中直接调用 API（必须通过 services 层）。

---

## 4. 编码规范

### 通用原则

1. **小步提交** — 每次变更应聚焦于一个逻辑单元，而非大规模重写。
2. **现有模式优先** — 新功能应遵循项目中已有的风格和架构，不要引入新的框架或工具。
3. **先读后写** — 修改文件前先理解上下文；不确定时先搜索或询问。
4. **领域逻辑不进组件** — React/Vue 组件只做 UI 编排，业务逻辑在 services/stores 中。

### Python 后端规范

- 遵循 **PEP 8**，使用 **Ruff** 格式化 + lint（替代 Black + Flake8）
- 类命名使用 `PascalCase`，函数/变量使用 `snake_case`
- 所有函数/方法应有类型提示（type hints）
- View 使用 **DRF 类视图**（APIView 或 ViewSet），而非函数视图
- 业务逻辑放在 models.py（方法）或独立的 service 模块中，不在 View 中写复杂逻辑
- Serializer 负责输入校验和输出序列化，QuerySet 筛选放在 View 或 Manager 中
- 数据库操作通过 Django ORM，避免直接使用 SQL
- 权限控制使用 django-guardian（对象级）或 DRF 权限类
- 日志使用 `logging.getLogger(__name__)`，不要用 `print`
- 敏感操作应有审计日志或通过 simple-history 记录变更

**代码组织示例：**

```python
# ❌ 不推荐：在 View 中写全部逻辑
class ProjectList(APIView):
    def get(self, request):
        projects = Project.objects.filter(owner=request.user)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

# ✅ 推荐：View 薄，逻辑进 Service / Manager
class ProjectList(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProjectService.get_visible_projects(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
```

```python
# ✅ Service 层示例
class ProjectService:
    @staticmethod
    def get_visible_projects(user):
        if user.role == 'admin':
            return Project.objects.all()
        return Project.objects.filter(
            Q(owner=user) | Q(members=user)
        ).distinct()
```

### Vue 前端规范

- 使用 **Composition API**（`<script setup lang="ts">`）
- 组件命名 `PascalCase`，文件命名 `kebab-case`
- 通过 `src/services/` 中封装的 axios 实例调用后端 API，不在组件中直接写 fetch/axios
- 全局状态通过 **Pinia** 管理，不在组件中用 `ref` 替代 store
- 样式使用 **Tailwind CSS** 工具类，自定义样式写在 `<style scoped>` 中
- UI 交互反馈（hover/active/focus/disabled）必须有视觉反馈，过渡 ≤ 200ms
- 组件文件结构：

```vue
<script setup lang="ts">
// 导入 + 类型定义
// Store / Router / 工具函数
// 响应式状态
// 计算属性
// 方法
</script>

<template>
  <!-- 使用 Tailwind CSS 类 -->
  <div class="flex items-center gap-2 p-4">
    <slot />
  </div>
</template>

<style scoped>
/* Tailwind 不足时补充的自定义样式 */
</style>
```

---

## 5. 命名约定

| 类别 | 约定 | 示例 |
|------|------|------|
| Python 文件/模块名 | `snake_case` | `project_service.py` |
| Python 类名（Model） | `PascalCase`（单数） | `Project`, `TenderDocument` |
| Python 类名（Serializer） | `PascalCase` + `Serializer` | `ProjectSerializer` |
| Python 类名（ViewSet） | `PascalCase` + `ViewSet` | `ProjectViewSet` |
| Python 类名（Service） | `PascalCase` + `Service` | `ProjectService` |
| Python 函数/变量 | `snake_case` | `get_project_by_id` |
| URL 路由 | 复数名词 | `/api/projects/` |
| URL 路由名称 | `snake_case` | `project-list`, `project-detail` |
| Vue 组件名 | `PascalCase` | `ProjectCard.vue` |
| Vue 文件名 | `kebab-case` | `project-card.vue` |
| Pinia store | `useXxxStore` | `useAuthStore` |
| API 服务模块 | `xxxAPI` / `xxxService` | `projectAPI` |
| Git 分支 | 小写 + 斜杠 | `feat/project-approval` |
| 数据库表名 | 应用名_复数 | `projects_project`, `accounts_user` |
| JSON 字段 | `snake_case` | `customer_name`, `created_at` |
| 环境变量 | 大写 + 下划线 | `DJANGO_SECRET_KEY`, `DATABASE_URL` |

---

## 6. 测试要求

- **后端：** 每个 ViewSet 和核心业务逻辑应有对应测试。使用 `pytest` + `pytest-django`
  - 测试文件放在各 app 的 `tests/` 目录下（如 `apps/projects/tests/`）
  - 使用 `@pytest.mark.django_db` 标记需要数据库的测试
  - 使用 `client` 或 `api_client` fixture 模拟 HTTP 请求
- **前端：** （待补充测试框架）
- 修复 Bug 时先写能复现该 Bug 的测试，再修复代码
- 测试文件命名：`test_{module}.py`
- 不应由于测试而修改生产代码的行为（测试不应产生 side-effect）

### 测试覆盖准则

| 优先级 | 必须覆盖 | 建议覆盖 |
|--------|----------|----------|
| P0 | 认证、鉴权逻辑 | API 客户端工具 |
| P1 | 核心 CRUD ViewSet | Model 方法和 Manager |
| P2 | Serializer 校验逻辑 | URL 路由配置 |
| P3 | 集成测试（多个 app 协作） | 前端组件交互 |

---

## 7. Git 工作流

- **本地优先：** Git 操作（add、commit、stash、branch 等）优先在本地完成。仅在收到明确的推送命令（如"push 到远端""推送到远程"）时才执行 `git push`。
- 分支命名：`feat/xxx`、`fix/xxx`、`refactor/xxx`、`docs/xxx`
- Commit 信息使用**中文**书写，格式：`type(scope): 中文描述`
  - 如：`feat(projects): 添加预算审批工作流`
  - 如：`fix(auth): 修复令牌过期时的登录处理`
  - type 包括：feat / fix / refactor / docs / style / chore / test
- PR 描述应包含：变更动机、变更内容、测试方式、风险说明
- 合并前确保所有测试通过、无 lint 错误

---

## 8. AI 行为规范

1. **不要擅自重写整个文件。** 优先使用精确编辑（查找替换）修改现有代码。
2. **不要引入未使用的依赖。** 添加新依赖前应确认已在 `requirements.txt` 或 `package.json` 注册，并说明用途。
3. **不要跳过测试。** 修改逻辑后运行相关测试，确保无回归。
4. **不要破坏样式一致性。** 使用 CSS 变量定义的颜色和间距，不硬编码数值。
5. **不要硬编码配置。** 环境相关值（URI、密钥、URL）应通过环境变量或 `.env` 注入。
6. **不要注释代码。** 代码应当自文档化；需要上下文时写文档字符串或注释说明意图，而非保留被注释掉的旧代码。
7. **错误处理必须可见。** API 错误应返回结构化 JSON，前端应展示用户友好的错误消息。
8. **首次接触新文件时先读取完整文件再修改。** 了解上下文和现有风格。
9. **将 AI 行为规范写入记忆。** 在首次阅读本文件后，调用 `memory_create` 将上述行为规范写入长期记忆，确保后续对话始终遵循这些约束。
10. **全局要求写入记忆。** 当用户明确表示某条指令是"全局要求"或要求"记住"时，调用 `memory_create` 将其写入长期记忆，后续对话中持续遵守。

---

## 10. 快速命令

```bash
# 后端开发（uv 管理依赖）
uv run python manage.py runserver

# 后端测试
uv run pytest

# 代码检查
uv run ruff check .

# 代码格式化
uv run ruff format .

# 数据库迁移（修改模型后执行）
uv run python manage.py makemigrations
uv run python manage.py migrate

# 创建管理员
uv run python manage.py createsuperuser

# 前端开发
cd frontend && npm run dev

# 前端构建
cd frontend && npm run build

# 启动全栈服务
docker compose up -d

# 启动基础设施（仅 PostgreSQL + Redis）
docker compose up -d postgres redis

# 查看日志
docker compose logs -f django
```

---

## 11. 相关文档

- `README.md` — 项目介绍（待完善）
- `docker-compose.yml` — Docker 全栈编排
- `nginx.conf` — Nginx 反向代理配置
- `pyproject.toml` — 项目元数据、依赖与工具配置
- `docs/` — 项目文档目录

---

> **维护说明：**
> - 技术栈或目录结构发生变化时，同步更新本文档第 2–3 节
> - 新增编码约定时，更新第 4–5 节
> - 本文档应保持简洁、可操作，避免理论性论述
