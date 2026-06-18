<template>
  <aside :class="['app-sidebar', { collapsed: store.sidebarCollapsed }]">
    <div class="sidebar-logo">
      <span class="logo-text" v-show="!store.sidebarCollapsed">PMOS</span>
    </div>
    <nav class="sidebar-nav">
      <div
        v-for="item in menuItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="navigate(item.path)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label" v-show="!store.sidebarCollapsed">{{ item.label }}</span>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResponsiveStore } from '@/stores/responsive'

const route = useRoute()
const router = useRouter()
const store = useResponsiveStore()
const currentRoute = computed(() => route.path)

const menuItems = [
  { path: '/dashboard', icon: '📊', label: '首页' },
  { path: '/projects', icon: '📁', label: '项目' },
  { path: '/plans', icon: '📅', label: '计划' },
  { path: '/tasks', icon: '✅', label: '任务' },
  { path: '/requirements', icon: '📝', label: '需求' },
  { path: '/testing', icon: '🧪', label: '测试' },
  { path: '/work', icon: '🔧', label: '工作' },
  { path: '/documents', icon: '📄', label: '文档' },
  { path: '/statistics', icon: '📊', label: '统计' },
  { path: '/system', icon: '⚙️', label: '系统' },
]

function isActive(path: string) {
  if (path === '/dashboard') return currentRoute.value === '/dashboard'
  return currentRoute.value.startsWith(path)
}

function navigate(path: string) {
  router.push(path)
}
</script>

<style scoped>
.app-sidebar {
  height: 100vh;
  overflow-y: auto;
  background: var(--td-bg-color-container, #fff);
  border-right: 1px solid var(--td-border-level-1-color, #e0e0e0);
  transition: width 0.3s;
  width: 240px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.app-sidebar.collapsed { width: 64px; }

.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 700;
  font-size: 18px;
  border-bottom: 1px solid var(--td-border-level-1-color, #e0e0e0);
  flex-shrink: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 4px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  color: var(--td-text-color-primary, #333);
  font-size: 14px;
  transition: background 0.2s;
  margin: 2px 0;
  user-select: none;
}

.nav-item:hover {
  background: var(--td-bg-color-secondary, #f5f5f5);
}

.nav-item.active {
  background: var(--td-brand-color-light, #e8f0fe);
  color: var(--td-brand-color, #0052d9);
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
