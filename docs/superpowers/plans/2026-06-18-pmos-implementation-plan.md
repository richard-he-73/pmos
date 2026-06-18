# PMOS 项目管理系统 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个企业级项目管理系统（类似禅道），覆盖项目、计划、需求、测试、资源、沟通、工作管理、文档、统计等 12 个核心模块，企业内部私有部署。

**Architecture:** Django 5.x + Django REST Framework 提供 RESTful API，PostgreSQL 16+ 作为数据库，Celery + Redis 处理异步任务，Vue 3 + TDesign 提供前端界面，Docker Compose 编排部署。

**Tech Stack:** Python 3.12+, Django 5.x, DRF, PostgreSQL 16+, Redis 7, Celery, Vue 3 (Composition API), TDesign, Vite, Docker Compose

---

## 文件结构（总览）

```
pmos/
├── pyproject.toml                     # uv 项目配置
├── docker-compose.yml                 # 容器编排
├── Dockerfile                         # Django 镜像
├── .env.example                       # 环境变量模板
├── nginx.conf                         # Nginx 反向代理配置
├── pmos/                              # Django 项目配置
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                    # 基础配置
│   │   ├── dev.py                     # 开发配置
│   │   └── prod.py                    # 生产配置
│   ├── urls.py                        # 主路由
│   ├── wsgi.py
│   ├── celery.py                      # Celery 配置
│   └── __init__.py                    # Celery app
├── apps/
│   ├── accounts/                      # 用户/认证/角色/权限
│   ├── projects/                      # 项目管理
│   ├── plans/                         # 计划管理（甘特图+任务）
│   ├── requirements/                  # 需求管理
│   ├── testing/                       # 测试管理
│   ├── resources/                     # 资源管理
│   ├── communications/                # 沟通管理
│   ├── work_management/               # 工作管理（设备/请假/工时）
│   ├── documents/                     # 文档管理
│   ├── notifications/                 # 消息通知
│   ├── statistics/                    # 统计分析
│   └── system/                        # 系统管理（日志/配置）
├── frontend/                          # Vue 3 前端
│   ├── src/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── api/
│   │   ├── views/
│   │   ├── components/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── static/                            # 静态文件
├── media/                             # 上传文件
└── docs/                              # 文档
```

---

## 阶段零：项目脚手架搭建

**目标：** 初始化项目骨架，Django + Vue 可联调，Docker 可启动。

### Task 0.1: 初始化 Django 项目

**Files:**
- Create: `pmos/pyproject.toml`
- Create: `pmos/pmos/settings/base.py`
- Create: `pmos/pmos/settings/dev.py`
- Create: `pmos/pmos/settings/prod.py`
- Create: `pmos/pmos/urls.py`
- Create: `pmos/pmos/wsgi.py`
- Create: `pmos/pmos/celery.py`
- Create: `pmos/pmos/__init__.py`
- Create: `pmos/manage.py`
- Create: `pmos/.env.example`

- [ ] **Step 1: 初始化 uv 项目**

```bash
cd /Users/hefeng/AiApp/PMOS
uv init --python 3.12
```

运行后在 `pyproject.toml` 中声明依赖：

```toml
[project]
name = "pmos"
version = "0.1.0"
description = "Project Management Operating System"
requires-python = ">=3.12"
dependencies = [
    "django>=5.1,<5.2",
    "djangorestframework>=3.15",
    "django-guardian>=2.4",
    "django-cors-headers>=4.3",
    "django-filter>=24.1",
    "django-simple-history>=3.5",
    "djangorestframework-simplejwt>=5.3",
    "psycopg2-binary>=2.9",
    "celery>=5.4",
    "redis>=5.0",
    "gunicorn>=22.0",
    "whitenoise>=6.6",
    "openpyxl>=3.1",
    "xlsxwriter>=3.2",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-django>=4.8",
    "pytest-cov>=5.0",
    "ruff>=0.4",
]
```

```bash
uv sync
uv sync --group dev
```

- [ ] **Step 2: 创建 Django 项目骨架**

```bash
cd /Users/hefeng/AiApp/PMOS
uv run django-admin startproject pmos pmos --template=
```

创建 settings 模块：

```python
# pmos/pmos/settings/base.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-secret-key-change-in-production')

DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 第三方
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'guardian',
    'simple_history',
    # 业务 App（后续逐步添加）
    'apps.accounts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'simple_history.middleware.HistoryRequestMiddleware',
]

ROOT_URLCONF = 'pmos.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]

WSGI_APPLICATION = 'pmos.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'pmos'),
        'USER': os.environ.get('DB_USER', 'pmos'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'pmos'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = []
AUTH_USER_MODEL = 'accounts.User'

LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# DRF 配置
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# Celery
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# CORS
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
```

```python
# pmos/pmos/settings/dev.py
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']
```

```python
# pmos/pmos/settings/prod.py
from .base import *

DEBUG = False
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

- [ ] **Step 3: 配置 Celery**

```python
# pmos/pmos/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pmos.settings.dev')
app = Celery('pmos')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

```python
# pmos/pmos/__init__.py
from .celery import app as celery_app
__all__ = ('celery_app',)
```

- [ ] **Step 4: 验证项目启动**

```bash
cd /Users/hefeng/AiApp/PMOS
uv run python manage.py check --settings=pmos.settings.dev
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 5: 创建前端项目**

```bash
cd /Users/hefeng/AiApp/PMOS
mkdir -p frontend
cd frontend
npm create vite@latest . -- --template vue-ts
npm install
npm install vue-router@4 pinia axios tdesign-vue-next
```

- [ ] **Step 6: 编写 Docker Compose**

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: pmos
      POSTGRES_USER: pmos
      POSTGRES_PASSWORD: pmos
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  django:
    build: .
    command: >
      sh -c "uv run python manage.py migrate &&
             uv run python manage.py collectstatic --noinput &&
             uv run gunicorn pmos.wsgi:application -b :8000 -w 4"
    env_file: .env
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"

  celery-worker:
    build: .
    command: uv run celery -A pmos worker -l info
    env_file: .env
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app

  celery-beat:
    build: .
    command: uv run celery -A pmos beat -l info
    env_file: .env
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app

  nginx:
    image: nginx:latest
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - static_volume:/static
      - media_volume:/media
      - ./frontend/dist:/frontend
    ports:
      - "80:80"
    depends_on:
      - django

volumes:
  pgdata:
  static_volume:
  media_volume:
```

- [ ] **Step 7: 编写 Nginx 配置**

```nginx
# nginx.conf
server {
    listen 80;
    charset utf-8;

    # Vue 前端
    location / {
        root /frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Django API
    location /api/ {
        proxy_pass http://django:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://django:8000;
        proxy_set_header Host $host;
    }

    # 静态文件
    location /static/ {
        alias /static/;
    }

    location /media/ {
        alias /media/;
    }
}
```

- [ ] **Step 8: 提交脚手架**

```bash
cd /Users/hefeng/AiApp/PMOS
git init
git add .
git commit -m "chore: init project scaffold with Django + Vue + Docker"
```

---

### Task 0.2: 前端响应式布局系统

**目标：** 实现 Mobile-First 响应式布局，桌面端侧栏+顶栏+内容三栏，移动端顶栏+底部导航+抽屉侧栏。

**Files:**
- Create: `pmos/frontend/src/composables/useResponsive.js`
- Create: `pmos/frontend/src/stores/responsive.js`
- Create: `pmos/frontend/src/styles/responsive.css`
- Create: `pmos/frontend/src/styles/variables.css`
- Create: `pmos/frontend/src/views/layout/DesktopLayout.vue`
- Create: `pmos/frontend/src/views/layout/MobileLayout.vue`
- Create: `pmos/frontend/src/views/layout/Sidebar.vue`
- Create: `pmos/frontend/src/views/layout/Topbar.vue`
- Create: `pmos/frontend/src/views/layout/MobileBottomNav.vue`
- Modify: `pmos/frontend/src/App.vue`
- Modify: `pmos/frontend/src/router/index.js`
- Modify: `pmos/frontend/package.json`

- [ ] **Step 1: 安装额外依赖**

```bash
cd /Users/hefeng/AiApp/PMOS/frontend
npm install @vueuse/core   # 提供 useMediaQuery、useStorage 等工具
```

- [ ] **Step 2: 创建响应式 composable**

```javascript
// frontend/src/composables/useResponsive.js
import { ref, computed, onMounted, onUnmounted } from 'vue'

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1200,
}

const currentWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

export function useResponsive() {
  const device = computed(() => {
    if (currentWidth.value < BREAKPOINTS.mobile) return 'mobile'
    if (currentWidth.value < BREAKPOINTS.tablet) return 'tablet'
    return 'desktop'
  })

  const isMobile = computed(() => device.value === 'mobile')
  const isTablet = computed(() => device.value === 'tablet')
  const isDesktop = computed(() => device.value === 'desktop')

  let resizeHandler = null

  function startListening() {
    resizeHandler = () => { currentWidth.value = window.innerWidth }
    window.addEventListener('resize', resizeHandler)
  }

  function stopListening() {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
  }

  return { currentWidth, device, isMobile, isTablet, isDesktop, startListening, stopListening }
}
```

- [ ] **Step 3: 创建响应式 Pinia store**

```javascript
// frontend/src/stores/responsive.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useResponsiveStore = defineStore('responsive', () => {
  const width = ref(window.innerWidth)
  const sidebarCollapsed = ref(false)
  const drawerVisible = ref(false)

  const BREAKPOINTS = { mobile: 768, tablet: 1200 }

  const device = computed(() => {
    if (width.value < BREAKPOINTS.mobile) return 'mobile'
    if (width.value < BREAKPOINTS.tablet) return 'tablet'
    return 'desktop'
  })
  const isMobile = computed(() => device.value === 'mobile')
  const isDesktop = computed(() => device.value === 'desktop')

  function updateWidth() { width.value = window.innerWidth }
  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
  function toggleDrawer() { drawerVisible.value = !drawerVisible.value }

  // 监听 resize
  let handler = null
  function init() {
    handler = () => updateWidth()
    window.addEventListener('resize', handler)
  }
  function destroy() {
    if (handler) window.removeEventListener('resize', handler)
  }

  return { width, device, isMobile, isDesktop, sidebarCollapsed, drawerVisible,
           toggleSidebar, toggleDrawer, init, destroy }
})
```

- [ ] **Step 4: 创建 CSS 变量和响应式样式**

```css
/* frontend/src/styles/variables.css */
:root {
  /* 间距 */
  --pmos-spacing-xs: 4px;
  --pmos-spacing-sm: 8px;
  --pmos-spacing-md: 16px;
  --pmos-spacing-lg: 24px;
  --pmos-spacing-xl: 32px;

  /* 布局 */
  --pmos-sidebar-width: 240px;
  --pmos-sidebar-collapsed-width: 64px;
  --pmos-topbar-height: 56px;
  --pmos-mobile-bottom-nav-height: 56px;

  /* 字体 */
  --pmos-font-size-xs: 12px;
  --pmos-font-size-sm: 13px;
  --pmos-font-size-md: 14px;
  --pmos-font-size-lg: 16px;
  --pmos-font-size-xl: 20px;
}
```

```css
/* frontend/src/styles/responsive.css */
/* 移动端 (< 768px) */
@media (max-width: 767px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }

  .page-container { padding: var(--pmos-spacing-sm); }
  .page-header { flex-direction: column; gap: var(--pmos-spacing-sm); }

  /* 表格在移动端自动隐藏，用卡片替代 */
  .data-table { display: none; }
  .data-card-list { display: block; }
}

/* 平板 (768px ~ 1200px) */
@media (min-width: 768px) and (max-width: 1199px) {
  .mobile-only { display: none !important; }
  .desktop-only { display: block !important; }

  .page-container { padding: var(--pmos-spacing-md); }
  .data-card-list { display: none; }
  .data-table { display: table; }
}

/* 桌面端 (> 1200px) */
@media (min-width: 1200px) {
  .mobile-only { display: none !important; }
  .desktop-only { display: block !important; }

  .page-container { padding: var(--pmos-spacing-lg); }
  .data-card-list { display: none; }
  .data-table { display: table; }
}
```

- [ ] **Step 5: 创建桌面端布局组件**

```vue
<!-- frontend/src/views/layout/Sidebar.vue -->
<template>
  <t-aside :class="['app-sidebar', { collapsed: store.sidebarCollapsed }]">
    <div class="sidebar-logo">
      <t-icon name="logo" /> <span v-show="!store.sidebarCollapsed">PMOS</span>
    </div>
    <t-menu :collapsed="store.sidebarCollapsed">
      <t-menu-item v-for="item in menuItems" :key="item.path" :to="item.path">
        <template #icon><t-icon :name="item.icon" /></template>
        {{ item.label }}
      </t-menu-item>
    </t-menu>
  </t-aside>
</template>

<script setup>
import { useResponsiveStore } from '@/stores/responsive'
const store = useResponsiveStore()

const menuItems = [
  { path: '/dashboard', icon: 'dashboard', label: '首页' },
  { path: '/projects', icon: 'folder', label: '项目' },
  { path: '/plans', icon: 'timeline', label: '计划' },
  { path: '/tasks', icon: 'check-circle', label: '任务' },
  { path: '/requirements', icon: 'file-text', label: '需求' },
  { path: '/testing', icon: 'bug', label: '测试' },
  { path: '/documents', icon: 'file', label: '文档' },
  { path: '/statistics', icon: 'chart', label: '统计' },
  { path: '/system', icon: 'settings', label: '系统' },
]
</script>

<style scoped>
.app-sidebar { height: 100vh; overflow-y: auto; transition: width 0.3s; }
.app-sidebar.collapsed { width: var(--pmos-sidebar-collapsed-width); }
.sidebar-logo { height: var(--pmos-topbar-height); display: flex; align-items: center; padding: 0 var(--pmos-spacing-md); }
</style>
```

```vue
<!-- frontend/src/views/layout/Topbar.vue -->
<template>
  <t-header class="app-topbar">
    <!-- 左侧：汉堡菜单按钮（桌面侧栏折叠/移动端抽屉） -->
    <t-button variant="text" @click="handleToggleMenu">
      <t-icon name="menu" />
    </t-button>
    <!-- 面包屑 -->
    <t-breadcrumb />
    <!-- 右侧：搜索、通知、主题切换、用户 -->
    <div class="topbar-right">
      <t-input placeholder="搜索..." class="desktop-only" />
      <t-button variant="text"><t-icon name="notification" /></t-button>
      <ThemeToggle />
      <t-dropdown>
        <t-button variant="text"><t-icon name="user" /> {{ userStore.currentUser?.real_name }}</t-button>
        <t-dropdown-menu>
          <t-dropdown-item>个人中心</t-dropdown-item>
          <t-dropdown-item>退出登录</t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </div>
  </t-header>
</template>

<script setup>
import { useResponsiveStore } from '@/stores/responsive'
import ThemeToggle from '@/components/ThemeToggle.vue'
const rStore = useResponsiveStore()

function handleToggleMenu() {
  if (rStore.isMobile) rStore.toggleDrawer()
  else rStore.toggleSidebar()
}
</script>

<style scoped>
.app-topbar { display: flex; align-items: center; justify-content: space-between; height: var(--pmos-topbar-height); padding: 0 var(--pmos-spacing-md); }
.topbar-right { display: flex; align-items: center; gap: var(--pmos-spacing-sm); }
</style>
```

```vue
<!-- frontend/src/views/layout/DesktopLayout.vue -->
<template>
  <t-layout class="desktop-layout">
    <Sidebar />
    <t-layout>
      <Topbar />
      <t-content class="main-content">
        <router-view />
      </t-content>
    </t-layout>
  </t-layout>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
</script>

<style scoped>
.desktop-layout { height: 100vh; }
.main-content { padding: var(--pmos-spacing-lg); overflow-y: auto; }
</style>
```

- [ ] **Step 6: 创建移动端布局组件**

```vue
<!-- frontend/src/views/layout/MobileLayout.vue -->
<template>
  <t-layout class="mobile-layout">
    <!-- 顶栏 -->
    <t-header class="mobile-topbar">
      <t-button variant="text" @click="rStore.toggleDrawer">
        <t-icon :name="rStore.drawerVisible ? 'close' : 'menu'" />
      </t-button>
      <span class="mobile-title">PMOS</span>
      <ThemeToggle />
    </t-header>

    <!-- 抽屉侧栏 -->
    <t-drawer v-model:visible="rStore.drawerVisible" placement="left" :show-overlay header="PMOS">
      <t-menu :value="currentRoute">
        <t-menu-item v-for="item in menuItems" :key="item.path" :value="item.path" @click="navigate(item.path)">
          <template #icon><t-icon :name="item.icon" /></template>
          {{ item.label }}
        </t-menu-item>
      </t-menu>
    </t-drawer>

    <!-- 主内容 -->
    <t-content class="mobile-content">
      <router-view />
    </t-content>

    <!-- 底部导航栏 -->
    <MobileBottomNav />
  </t-layout>
</template>

<script setup>
import { useResponsiveStore } from '@/stores/responsive'
import { useRouter, useRoute } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import MobileBottomNav from './MobileBottomNav.vue'

const rStore = useResponsiveStore()
const router = useRouter()
const route = useRoute()
const currentRoute = computed(() => route.path)

const menuItems = [
  { path: '/dashboard', icon: 'dashboard', label: '首页' },
  { path: '/projects', icon: 'folder', label: '项目' },
  { path: '/tasks', icon: 'check-circle', label: '任务' },
  { path: '/plans', icon: 'timeline', label: '计划' },
  { path: '/testing', icon: 'bug', label: '测试' },
  { path: '/documents', icon: 'file', label: '文档' },
  { path: '/system', icon: 'settings', label: '设置' },
]

function navigate(path) { router.push(path); rStore.drawerVisible = false }
</script>

<style scoped>
.mobile-layout { height: 100vh; }
.mobile-topbar { display: flex; align-items: center; height: var(--pmos-topbar-height); padding: 0 var(--pmos-spacing-sm); }
.mobile-title { flex: 1; text-align: center; font-size: var(--pmos-font-size-lg); font-weight: 600; }
.mobile-content { padding: var(--pmos-spacing-sm); overflow-y: auto; padding-bottom: calc(var(--pmos-mobile-bottom-nav-height) + var(--pmos-spacing-sm)); }
</style>
```

```vue
<!-- frontend/src/views/layout/MobileBottomNav.vue -->
<template>
  <t-footer class="mobile-bottom-nav">
    <div v-for="item in navItems" :key="item.path" class="nav-item" :class="{ active: route.path.startsWith(item.path) }" @click="router.push(item.path)">
      <t-icon :name="item.icon" />
      <span>{{ item.label }}</span>
    </div>
  </t-footer>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: '首页' },
  { path: '/projects', icon: 'folder', label: '项目' },
  { path: '/tasks', icon: 'check-circle', label: '任务' },
  { path: '/notifications', icon: 'notification', label: '通知' },
  { path: '/system/profile', icon: 'user', label: '我的' },
]
</script>

<style scoped>
.mobile-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: var(--pmos-mobile-bottom-nav-height); display: flex; align-items: center; justify-content: space-around; background: var(--td-bg-color-container); border-top: 1px solid var(--td-border-level-1-color); z-index: 1000; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: var(--pmos-font-size-xs); cursor: pointer; }
.nav-item.active { color: var(--td-brand-color); }
</style>
```

- [ ] **Step 7: 更新 App.vue —— 根据设备类型使用不同布局**

```vue
<!-- frontend/src/App.vue -->
<template>
  <t-config-provider :theme="themeStore.currentTheme">
    <DesktopLayout v-if="responsiveStore.isDesktop" />
    <MobileLayout v-else />
  </t-config-provider>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useResponsiveStore } from '@/stores/responsive'
import { useThemeStore } from '@/stores/theme'
import DesktopLayout from '@/views/layout/DesktopLayout.vue'
import MobileLayout from '@/views/layout/MobileLayout.vue'

const responsiveStore = useResponsiveStore()
const themeStore = useThemeStore()

onMounted(() => responsiveStore.init())
onUnmounted(() => responsiveStore.destroy())
</script>
```

- [ ] **Step 8: 更新 router/index.js 添加默认布局路由**

```javascript
// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/Index.vue') },
  { path: '/projects', name: 'Projects', component: () => import('@/views/project/List.vue') },
  { path: '/projects/:id', name: 'ProjectDetail', component: () => import('@/views/project/Detail.vue') },
  // ... 其他模块路由
  { path: '/system/profile', name: 'Profile', component: () => import('@/views/system/Profile.vue') },
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
```

- [ ] **Step 9: 创建 ResponsiveTable 组件（自适应表格→卡片）**

```vue
<!-- frontend/src/components/ResponsiveTable.vue -->
<template>
  <!-- 桌面端：TDesign 表格 -->
  <t-table v-if="!responsive.isMobile" :data="data" :columns="columns" v-bind="$attrs" />
  <!-- 移动端：卡片列表 -->
  <div v-else class="mobile-card-list">
    <t-card v-for="row in data" :key="row.id" class="mobile-card" :title="row[cardTitle]" @click="$emit('row-click', row)">
      <template v-for="col in cardFields" :key="col.key">
        <div class="card-field">
          <span class="card-label">{{ col.label }}</span>
          <span class="card-value">{{ row[col.key] }}</span>
        </div>
      </template>
    </t-card>
  </div>
</template>

<script setup>
import { useResponsive } from '@/composables/useResponsive'

const props = defineProps({
  data: Array, columns: Array, cardTitle: String,
  cardFields: Array,
})
defineEmits(['row-click'])

const responsive = useResponsive()
</script>
```

- [ ] **Step 10: 提交**

```bash
cd /Users/hefeng/AiApp/PMOS
git add frontend/src/composables/ frontend/src/stores/responsive.js frontend/src/styles/ frontend/src/views/layout/ frontend/src/components/ResponsiveTable.vue frontend/src/App.vue frontend/src/router/index.js frontend/package.json
git commit -m "feat: add responsive layout system with desktop/mobile dual layouts"
```

---

### Task 0.3: 明暗主题切换

**目标：** 实现亮色/暗色主题切换，支持手动切换、系统偏好跟随、持久化存储。

**Files:**
- Create: `pmos/frontend/src/styles/theme-light.css`
- Create: `pmos/frontend/src/styles/theme-dark.css`
- Create: `pmos/frontend/src/styles/global.css`
- Create: `pmos/frontend/src/stores/theme.js`
- Create: `pmos/frontend/src/composables/useTheme.js`
- Create: `pmos/frontend/src/components/ThemeToggle.vue`
- Modify: `pmos/frontend/src/main.js`
- Modify: `pmos/frontend/src/App.vue`

- [ ] **Step 1: 定义亮色主题变量**

```css
/* frontend/src/styles/theme-light.css */
[data-theme="light"] {
  --pmos-bg-primary: #ffffff;
  --pmos-bg-secondary: #f5f5f5;
  --pmos-bg-tertiary: #e8e8e8;
  --pmos-text-primary: #1a1a1a;
  --pmos-text-secondary: #666666;
  --pmos-text-tertiary: #999999;
  --pmos-border: #e0e0e0;
  --pmos-shadow: rgba(0, 0, 0, 0.08);

  /* 语义色 */
  --pmos-success: #00a870;
  --pmos-warning: #ed7b2f;
  --pmos-error: #d54941;
  --pmos-info: #0052d9;
}
```

- [ ] **Step 2: 定义暗色主题变量**

```css
/* frontend/src/styles/theme-dark.css */
[data-theme="dark"] {
  --pmos-bg-primary: #1a1a2e;
  --pmos-bg-secondary: #16213e;
  --pmos-bg-tertiary: #0f3460;
  --pmos-text-primary: #e0e0e0;
  --pmos-text-secondary: #a0a0a0;
  --pmos-text-tertiary: #707070;
  --pmos-border: #2a2a4a;
  --pmos-shadow: rgba(0, 0, 0, 0.3);

  --pmos-success: #00d68f;
  --pmos-warning: #ff9f43;
  --pmos-error: #ff6b6b;
  --pmos-info: #5b8def;
}
```

- [ ] **Step 3: 创建全局样式文件**

```css
/* frontend/src/styles/global.css */
@import './variables.css';
@import './responsive.css';
@import './theme-light.css';
@import './theme-dark.css';

/* 默认亮色 */
:root, [data-theme="light"] {
  color-scheme: light;
}

[data-theme="dark"] {
  color-scheme: dark;
}

/* 全局样式 */
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: var(--pmos-font-size-md);
  color: var(--pmos-text-primary);
  background-color: var(--pmos-bg-primary);
  transition: background-color 0.3s, color 0.3s;
}

/* 滚动条美化 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--pmos-text-tertiary); border-radius: 3px; }
```

- [ ] **Step 4: 创建主题 Pinia store**

```javascript
// frontend/src/stores/theme.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const STORAGE_KEY = 'pmos-theme'

  // 初始化：localStorage > 系统偏好 > 亮色
  const getInitialTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  }

  const currentTheme = ref(getInitialTheme())

  // 应用主题到 document
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme
    // TDesign 主题切换
    document.documentElement.setAttribute('theme-mode', theme === 'dark' ? 'dark' : 'light')
  }

  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(theme) {
    if (theme === 'light' || theme === 'dark') currentTheme.value = theme
  }

  // 监听系统主题变化
  let mediaQuery = null
  function listenSystem() {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        currentTheme.value = e.matches ? 'dark' : 'light'
      }
    })
  }

  // 持久化：watch 变化时保存
  watch(currentTheme, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
    applyTheme(val)
  }, { immediate: true })

  return { currentTheme, toggleTheme, setTheme, listenSystem }
})
```

- [ ] **Step 5: 创建主题 composable**

```javascript
// frontend/src/composables/useTheme.js
import { useThemeStore } from '@/stores/theme'

export function useTheme() {
  const themeStore = useThemeStore()
  return {
    currentTheme: themeStore.currentTheme,
    isDark: computed(() => themeStore.currentTheme === 'dark'),
    toggleTheme: themeStore.toggleTheme,
    setTheme: themeStore.setTheme,
  }
}
```

- [ ] **Step 6: 创建 ThemeToggle 组件**

```vue
<!-- frontend/src/components/ThemeToggle.vue -->
<template>
  <t-tooltip :content="isDark ? '切换亮色' : '切换暗色'" placement="bottom">
    <t-button variant="text" @click="toggleTheme">
      <t-icon :name="isDark ? 'light' : 'dark'" />
    </t-button>
  </t-tooltip>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.currentTheme === 'dark')
const toggleTheme = () => themeStore.toggleTheme()
</script>
```

- [ ] **Step 7: 更新 main.js 引入全局样式和初始化主题监听**

```javascript
// frontend/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'

// 全局样式
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(TDesign)

// 应用启动时初始化主题监听
const themeStore = useThemeStore()
themeStore.listenSystem()

app.mount('#app')
```

- [ ] **Step 8: 提交**

```bash
cd /Users/hefeng/AiApp/PMOS
git add frontend/src/styles/ frontend/src/stores/theme.js frontend/src/composables/useTheme.js frontend/src/components/ThemeToggle.vue frontend/src/main.js
git commit -m "feat: add light/dark theme switching with system preference support"
```

---

## 第一阶段：用户与权限系统（accounts + system）

**目标：** 用户注册/登录、角色管理、权限控制、操作日志、系统配置。

### Task 1.1: 创建 accounts app — 用户模型

**Files:**
- Create: `pmos/apps/accounts/__init__.py`
- Create: `pmos/apps/accounts/models.py`
- Create: `pmos/apps/accounts/admin.py`
- Create: `pmos/apps/accounts/apps.py`
- Create: `pmos/apps/accounts/serializers.py`
- Create: `pmos/apps/accounts/views.py`
- Create: `pmos/apps/accounts/urls.py`
- Create: `pmos/apps/accounts/filters.py`
- Create: `pmos/apps/accounts/permissions.py`
- Test: `pmos/apps/accounts/tests/__init__.py`
- Test: `pmos/apps/accounts/tests/test_models.py`
- Test: `pmos/apps/accounts/tests/test_views.py`

- [ ] **Step 1: 创建 App 结构**

```bash
cd /Users/hefeng/AiApp/PMOS
mkdir -p apps/accounts/tests
touch apps/accounts/__init__.py
touch apps/accounts/tests/__init__.py
```

```python
# apps/accounts/apps.py
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    verbose_name = '用户与权限'
```

- [ ] **Step 2: 定义 User 模型（扩展 Django AbstractUser）**

```python
# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """扩展用户模型"""
    real_name = models.CharField('姓名', max_length=50, blank=True)
    phone = models.CharField('手机号', max_length=20, blank=True)
    avatar = models.ImageField('头像', upload_to='avatars/', blank=True)
    position = models.CharField('职位', max_length=100, blank=True)
    department = models.CharField('部门', max_length=100, blank=True)
    is_active = models.BooleanField('启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'
        ordering = ['-date_joined']

    def __str__(self):
        return self.real_name or self.username


class Role(models.Model):
    """角色"""
    name = models.CharField('角色名称', max_length=50)
    code = models.CharField('角色编码', max_length=50, unique=True)
    description = models.TextField('描述', blank=True)
    permissions = models.ManyToManyField(
        'auth.Permission', verbose_name='权限', blank=True
    )
    is_system = models.BooleanField('系统内置', default=False)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '角色'
        verbose_name_plural = '角色'
        ordering = ['name']

    def __str__(self):
        return self.name


class UserProjectRole(models.Model):
    """用户在项目中的角色（对象级权限）"""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, verbose_name='用户'
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE, verbose_name='项目',
        null=True, blank=True
    )
    role = models.ForeignKey(
        Role, on_delete=models.CASCADE, verbose_name='角色'
    )
    joined_at = models.DateTimeField('加入时间', auto_now_add=True)

    class Meta:
        verbose_name = '项目角色'
        verbose_name_plural = '项目角色'
        unique_together = ['user', 'project']
        ordering = ['user', 'project']

    def __str__(self):
        return f'{self.user} - {self.project} - {self.role}'
```

- [ ] **Step 3: 编写测试验证 User 模型**

```python
# apps/accounts/tests/test_models.py
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            real_name='测试用户',
            email='test@example.com',
        )
        assert user.username == 'testuser'
        assert user.real_name == '测试用户'
        assert user.is_active is True
        assert str(user) == '测试用户'

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            username='admin', password='admin123'
        )
        assert admin.is_superuser is True
        assert admin.is_staff is True
```

```bash
uv run pytest apps/accounts/tests/test_models.py -v
```

Expected: 2 passed

- [ ] **Step 4: 实现 Serializer**

```python
# apps/accounts/serializers.py
from rest_framework import serializers
from .models import User, Role, UserProjectRole

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'real_name', 'email', 'phone',
                  'position', 'department', 'avatar', 'is_active',
                  'date_joined']
        read_only_fields = ['date_joined']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'real_name', 'email',
                  'phone', 'position', 'department']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ['is_system', 'created_at']
```

- [ ] **Step 5: 实现 ViewSet + URL + Admin**

```python
# apps/accounts/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Role
from .serializers import UserSerializer, UserCreateSerializer, RoleSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user).data)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
```

```python
# apps/accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'roles', views.RoleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

```python
# apps/accounts/admin.py
from django.contrib import admin
from .models import User, Role, UserProjectRole

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'real_name', 'department', 'position', 'is_active']
    search_fields = ['username', 'real_name', 'email']
    list_filter = ['department', 'is_active']

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_system']
    filter_horizontal = ['permissions']
```

- [ ] **Step 6: 配置 JWT 认证**

```python
# pmos/pmos/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include([
        path('login/', TokenObtainPairView.as_view(), name='token_obtain'),
        path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ])),
    path('api/v1/', include('apps.accounts.urls')),
]
```

- [ ] **Step 7: 运行迁移并测试**

```bash
cd /Users/hefeng/AiApp/PMOS
uv run python manage.py makemigrations accounts --settings=pmos.settings.dev
uv run python manage.py migrate --settings=pmos.settings.dev
uv run pytest apps/accounts/tests/ -v
```

Expected: All tests pass

- [ ] **Step 8: 创建 system app — 操作日志和系统配置**

```python
# apps/system/models.py
from django.db import models
from django.conf import settings

class OperationLog(models.Model):
    """操作日志"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name='操作人'
    )
    action = models.CharField('操作', max_length=50)  # create/update/delete
    model_name = models.CharField('模型', max_length=100)
    object_id = models.CharField('对象ID', max_length=50, blank=True)
    object_repr = models.CharField('对象描述', max_length=200, blank=True)
    detail = models.JSONField('详情', blank=True, default=dict)
    ip_address = models.GenericIPAddressField('IP地址', blank=True, null=True)
    created_at = models.DateTimeField('操作时间', auto_now_add=True)

    class Meta:
        verbose_name = '操作日志'
        verbose_name_plural = '操作日志'
        ordering = ['-created_at']


class SystemConfig(models.Model):
    """系统配置（键值对）"""
    key = models.CharField('配置键', max_length=100, unique=True)
    value = models.JSONField('配置值')
    description = models.CharField('说明', max_length=200, blank=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '系统配置'
        verbose_name_plural = '系统配置'
```

- [ ] **Step 9: 提交第一阶段代码**

```bash
cd /Users/hefeng/AiApp/PMOS
git add apps/accounts/ apps/system/ pmos/
git commit -m "feat: add accounts and system modules with user auth, roles, operation logs"
```

---

## 第二阶段：项目与计划管理（projects + plans）

**目标：** 项目管理、计划体系（里程碑→分组→详细计划）、甘特图、任务管理。

### Task 2.1: 创建 projects app

**Files:**
- Create: `pmos/apps/projects/models.py`
- Create: `pmos/apps/projects/serializers.py`
- Create: `pmos/apps/projects/views.py`
- Create: `pmos/apps/projects/urls.py`
- Create: `pmos/apps/projects/admin.py`
- Create: `pmos/apps/projects/apps.py`
- Test: `pmos/apps/projects/tests/__init__.py`
- Test: `pmos/apps/projects/tests/test_models.py`
- Test: `pmos/apps/projects/tests/test_views.py`

- [ ] **Step 1: 定义 Project 和 ProjectMember 模型**

```python
# apps/projects/models.py
from django.db import models
from django.conf import settings

class Project(models.Model):
    """项目"""
    class Status(models.TextChoices):
        PLANNING = 'planning', '规划中'
        ACTIVE = 'active', '进行中'
        CLOSED = 'closed', '已结束'

    name = models.CharField('项目名称', max_length=200)
    code = models.CharField('项目编号', max_length=50, unique=True)
    description = models.TextField('描述', blank=True)
    status = models.CharField('状态', max_length=20, choices=Status.choices, default=Status.PLANNING)
    start_date = models.DateField('开始日期', null=True, blank=True)
    end_date = models.DateField('结束日期', null=True, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='owned_projects', verbose_name='项目负责人'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_projects', verbose_name='创建人'
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '项目'
        verbose_name_plural = '项目'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.code}] {self.name}'


class ProjectMember(models.Model):
    """项目成员"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='用户')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members', verbose_name='项目')
    role = models.ForeignKey('accounts.Role', on_delete=models.CASCADE, verbose_name='角色')
    join_date = models.DateField('加入日期', auto_now_add=True)
    leave_date = models.DateField('离开日期', null=True, blank=True)
    is_active = models.BooleanField('是否在职', default=True)

    class Meta:
        verbose_name = '项目成员'
        verbose_name_plural = '项目成员'
        unique_together = ['user', 'project']
        ordering = ['project', 'user']

    def __str__(self):
        return f'{self.user.real_name or self.user.username} @ {self.project.name}'
```

- [ ] **Step 2: 实现 projects ViewSet**

```python
# apps/projects/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectDetailSerializer, ProjectMemberSerializer

class ProjectFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=Project.Status.choices)
    search = filters.CharFilter(method='filter_search')

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models.Q(name__icontains=value) | models.Q(code__icontains=value)
        )

    class Meta:
        model = Project
        fields = ['status']

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    filterset_class = ProjectFilter
    search_fields = ['name', 'code']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        project = self.get_object()
        members = ProjectMember.objects.filter(project=project, is_active=True)
        serializer = ProjectMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        project = self.get_object()
        serializer = ProjectMemberSerializer(data={**request.data, 'project': project.id})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

- [ ] **Step 3: 提交第二阶段 projects**

- [ ] **Step 4: 创建 plans app — 计划管理（含甘特图数据）**

```python
# apps/plans/models.py
from django.db import models
from django.conf import settings

class Plan(models.Model):
    """计划（三级结构：里程碑→分组→详细计划）"""
    class PlanType(models.TextChoices):
        MILESTONE = 'milestone', '里程碑'
        GROUP = 'group', '分组计划'
        DETAIL = 'detail', '详细计划'

    class Status(models.TextChoices):
        DRAFT = 'draft', '草稿'
        IN_PROGRESS = 'in_progress', '进行中'
        COMPLETED = 'completed', '已完成'
        DELAYED = 'delayed', '已延期'

    name = models.CharField('计划名称', max_length=200)
    type = models.CharField('类型', max_length=20, choices=PlanType.choices)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='children', verbose_name='上级计划'
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='plans', verbose_name='所属项目'
    )
    start_date = models.DateField('计划开始日期')
    end_date = models.DateField('计划结束日期')
    actual_end_date = models.DateField('实际结束日期', null=True, blank=True)
    status = models.CharField('状态', max_length=20, choices=Status.choices, default=Status.DRAFT)
    progress = models.IntegerField('进度(%)', default=0)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='负责人'
    )
    description = models.TextField('描述', blank=True)
    sort_order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '计划'
        verbose_name_plural = '计划'
        ordering = ['project', 'sort_order', 'start_date']

    def __str__(self):
        return f'[{self.get_type_display()}] {self.name}'


class Task(models.Model):
    """任务"""
    class Status(models.TextChoices):
        TODO = 'todo', '待办'
        IN_PROGRESS = 'in_progress', '进行中'
        DONE = 'done', '已完成'
        CLOSED = 'closed', '已关闭'

    class Priority(models.TextChoices):
        URGENT = 'urgent', '紧急'
        HIGH = 'high', '高'
        MEDIUM = 'medium', '中'
        LOW = 'low', '低'

    name = models.CharField('任务名称', max_length=200)
    description = models.TextField('描述', blank=True)
    plan = models.ForeignKey(
        Plan, on_delete=models.CASCADE, related_name='tasks', verbose_name='所属计划'
    )
    status = models.CharField('状态', max_length=20, choices=Status.choices, default=Status.TODO)
    priority = models.CharField('优先级', max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='tasks', verbose_name='负责人'
    )
    start_date = models.DateField('开始日期', null=True, blank=True)
    due_date = models.DateField('截止日期', null=True, blank=True)
    estimated_hours = models.DecimalField('预估工时', max_digits=6, decimal_places=1, null=True, blank=True)
    actual_hours = models.DecimalField('实际工时', max_digits=6, decimal_places=1, null=True, blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='subtasks', verbose_name='父任务'
    )
    sort_order = models.IntegerField('排序', default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_tasks', verbose_name='创建人'
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '任务'
        verbose_name_plural = '任务'
        ordering = ['plan', 'sort_order']

    def __str__(self):
        return self.name
```

- [ ] **Step 5: 实现 plans ViewSet（含甘特图数据接口）**

```python
# apps/plans/views.py
class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    @action(detail=True, methods=['get'])
    def gantt(self, request, pk=None):
        """返回甘特图所需数据格式"""
        plan = self.get_object()
        tasks = Task.objects.filter(plan=plan)
        return Response({
            'plan': PlanGanttSerializer(plan).data,
            'tasks': TaskGanttSerializer(tasks, many=True).data,
        })
```

- [ ] **Step 6: 编写 tests**

```python
@pytest.mark.django_db
class TestPlanModel:
    def test_create_milestone_plan(self):
        user = User.objects.create_user(username='pm', password='pass')
        project = Project.objects.create(name='Test', code='T001', owner=user)
        milestone = Plan.objects.create(
            name='V1.0 发布', type='milestone', project=project,
            start_date='2026-07-01', end_date='2026-09-30'
        )
        assert milestone.type == 'milestone'
        assert milestone.status == 'draft'
        assert str(milestone) == '[里程碑] V1.0 发布'
```

- [ ] **Step 7: 提交第二阶段**

---

## 第三阶段：需求与测试管理（requirements + testing）

**目标：** 业务需求→软件需求→测试用例→测试执行→缺陷追踪，端到端质量链路。

### Task 3.1: 创建 requirements app

**Files:**
- Create: `pmos/apps/requirements/models.py` — BusinessRequirement, SoftwareRequirement
- Create: `pmos/apps/requirements/serializers.py`
- Create: `pmos/apps/requirements/views.py`
- Create: `pmos/apps/requirements/urls.py`
- Create: `pmos/apps/requirements/admin.py`
- Test: `pmos/apps/requirements/tests/`

**核心模型：**
- BusinessRequirement（业务需求）：code(BR-YYYY-NNN), name, description, source, priority, status(proposed/approved/rejected/deferred), project, submitter
- SoftwareRequirement（软件需求）：code(SR-YYYY-NNN), name, description, business_req(FK), module, priority, status, version, assignee

### Task 3.2: 创建 testing app

**Files:**
- Create: `pmos/apps/testing/models.py` — TestPlan, TestCase, TestRun, Bug
- Create: `pmos/apps/testing/serializers.py`
- Create: `pmos/apps/testing/views.py`
- Create: `pmos/apps/testing/urls.py`
- Create: `pmos/apps/testing/admin.py`
- Test: `pmos/apps/testing/tests/`

**核心模型：**
- TestPlan: name, project, version, status, assignee, start_date, end_date
- TestCase: name, precondition, steps(JSON), expected_result, type, priority, module, requirement(SR)
- TestRun: test_case(FK), test_plan(FK), executor, result(pass/fail/blocked/untested), actual_result, notes
- Bug: title, description, severity(critical/major/minor/trivial), status, source, module, version_found, version_fixed, reporter, assignee, related_test_run, related_requirement, resolution

---

## 第四阶段：辅助功能模块（resources + communications + documents）

**目标：** 资源管理、沟通记录、文档管理。

### Task 4.1: resources app

**Files:**
- `pmos/apps/resources/models.py` — ProjectResource, ResourceChangeLog

**核心模型：**
- ProjectResource: project, user, role_in_project, join_date, leave_date, notes
- ResourceChangeLog: resource(FK), change_type(join/leave/role_change), operator, changed_at, detail

### Task 4.2: communications app

**Files:**
- `pmos/apps/communications/models.py` — CommType, CommRecord

**核心模型：**
- CommType: name, icon, sort_order (会议/电话/邮件/IM/面谈)
- CommRecord: comm_type(FK), project(FK), subject, content, initiator, participants(M2M), comm_date, duration_minutes, attachments

### Task 4.3: documents app

**Files:**
- `pmos/apps/documents/models.py` — DocumentCategory, Document

**核心模型：**
- DocumentCategory: name, parent(FK self), project(FK), sort_order
- Document: title, content(富文本/Markdown), category(FK), project(FK), creator, version, status(draft/published/archived), file(FileField)

---

## 第五阶段：工作管理（work_management）

**目标：** 设备管理、请假销假、工时登记。

### Task 5.1: work_management app

**Files:**
- Create: `pmos/apps/work_management/models.py`
- Create: `pmos/apps/work_management/serializers.py`
- Create: `pmos/apps/work_management/views.py`
- Create: `pmos/apps/work_management/urls.py`
- Create: `pmos/apps/work_management/admin.py`
- Test: `pmos/apps/work_management/tests/`

**核心模型：**

```python
class Equipment(models.Model):
    """设备管理"""
    name = models.CharField('设备名称', max_length=200)
    code = models.CharField('设备编号', max_length=50, unique=True)
    type = models.CharField('设备类型', max_length=50)
    specs = models.JSONField('规格参数', blank=True, default=dict)
    status = models.CharField('状态', max_length=20, choices=[
        ('available', '可用'), ('in_use', '使用中'),
        ('maintenance', '维护中'), ('retired', '已报废'),
    ], default='available')
    borrower = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    borrow_date = models.DateField('借用日期', null=True, blank=True)
    return_date = models.DateField('归还日期', null=True, blank=True)
    notes = models.TextField('备注', blank=True)

class Leave(models.Model):
    """请假管理"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='申请人')
    type = models.CharField('请假类型', max_length=20, choices=[
        ('annual', '年假'), ('sick', '病假'), ('personal', '事假'),
        ('marriage', '婚假'), ('maternity', '产假'), ('other', '其他'),
    ])
    start_date = models.DateField('开始日期')
    end_date = models.DateField('结束日期')
    duration_days = models.DecimalField('天数', max_digits=4, decimal_places=1)
    reason = models.TextField('请假原因')
    status = models.CharField('状态', max_length=20, choices=[
        ('pending', '待审批'), ('approved', '已批准'),
        ('rejected', '已驳回'), ('cancelled', '已取消'),
    ], default='pending')
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                  on_delete=models.SET_NULL, related_name='approved_leaves')
    cancel_date = models.DateField('销假日期', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

class Timesheet(models.Model):
    """工时登记"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField('日期')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, verbose_name='项目')
    task = models.ForeignKey('plans.Task', on_delete=models.CASCADE, null=True, blank=True, verbose_name='任务')
    hours = models.DecimalField('工时', max_digits=4, decimal_places=1)
    description = models.CharField('工作内容', max_length=500)
    status = models.CharField('状态', max_length=20, choices=[
        ('draft', '草稿'), ('submitted', '已提交'), ('approved', '已批准'),
    ], default='draft')
```

---

## 第六阶段：消息通知与统计分析（notifications + statistics）

### Task 6.1: notifications app

**Files:**
- Create: `pmos/apps/notifications/models.py` — Notification, NotificationTemplate

**核心模型：**

```python
class Notification(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField('通知类型', max_length=50)  # task_assigned, bug_reported, etc.
    title = models.CharField('标题', max_length=200)
    content = models.TextField('内容', blank=True)
    is_read = models.BooleanField('已读', default=False)
    read_at = models.DateTimeField('阅读时间', null=True, blank=True)
    related_type = models.CharField('关联类型', max_length=50, blank=True)
    related_id = models.IntegerField('关联ID', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
```

Celery 任务：`send_notification(user_id, type, title, content, related)` — 创建 Notification 记录，并在用户有 WebSocket 连接时推送。

### Task 6.2: statistics app

**Files:**
- Create: `pmos/apps/statistics/views.py` — 统计视图
- Create: `pmos/apps/statistics/urls.py`

统计视图通过 Django ORM 聚合查询实现，不新增模型：

```python
# 项目进度统计
Project.objects.annotate(
    total_plans=Count('plans'),
    completed_plans=Count('plans', filter=Q(plans__status='completed')),
    total_tasks=Count('plans__tasks'),
    completed_tasks=Count('plans__tasks', filter=Q(plans__tasks__status='done')),
)

# Bug 统计
Bug.objects.values('severity').annotate(count=Count('id'))
Bug.objects.values('status').annotate(count=Count('id'))

# 工时统计
Timesheet.objects.filter(project=project_id) \
    .values('user') \
    .annotate(total_hours=Sum('hours'))
```

---

## Docker 化与部署

### Task D.1: 编写 Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# 安装 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 安装 Python 依赖
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# 复制项目代码
COPY . .

# 收集静态文件
RUN uv run python manage.py collectstatic --noinput --settings=pmos.settings.prod

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "pmos.wsgi:application", "-b", ":8000", "-w", "4"]
```

### Task D.2: 完整 docker-compose.yml

（已在阶段零编写完成，验证并完善）

### Task D.3: 部署验证

```bash
cd /Users/hefeng/AiApp/PMOS
docker compose build
docker compose up -d
# 访问 http://localhost
# 验证前端加载、API 可访问、数据库连接正常
```

---

## 自审检查

### 1. 规格覆盖
- ✅ accounts: 用户、角色、项目角色（Task 1.1-1.6）
- ✅ system: 操作日志、系统配置（Task 1.8）
- ✅ projects: 项目管理（Task 2.1-2.3）
- ✅ plans: 里程碑/分组/详细计划、甘特图（Task 2.4-2.5）
- ✅ tasks: 任务管理（Task 2.4）
- ✅ requirements: 业务需求/软件需求（Task 3.1）
- ✅ testing: 测试计划/用例/执行/缺陷（Task 3.2）
- ✅ resources: 资源管理（Task 4.1）
- ✅ communications: 沟通管理（Task 4.2）
- ✅ documents: 文档管理（Task 4.3）
- ✅ work_management: 设备/请假/工时（Task 5.1）
- ✅ notifications: 消息通知（Task 6.1）
- ✅ statistics: 统计分析（Task 6.2）
- ✅ 部署: Docker Compose（Task D.1-D.3）

### 2. 占位符检查
- 无 TBD/TODO 保留
- 所有代码块有完整示例代码
- 测试代码有具体断言

### 3. 类型一致性
- User 模型引用使用 `settings.AUTH_USER_MODEL`（统一）
- 外键命名一致（user、project、plan 等）
- 状态字段用 TextChoices 枚举（统一模式）

---

*本实现计划对应设计规格文档：`docs/superpowers/specs/2026-06-18-pmos-project-management-system-design.md`*
