<template>
  <t-aside :class="['app-sidebar', { collapsed: store.sidebarCollapsed }]">
    <div class="sidebar-logo">
      <span class="logo-text" v-show="!store.sidebarCollapsed">PMOS</span>
    </div>
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: currentRoute.startsWith(item.path) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label" v-show="!store.sidebarCollapsed">{{ item.label }}</span>
      </router-link>
    </nav>
  </t-aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResponsiveStore } from '@/stores/responsive'

const route = useRoute()
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
</script>

<style scoped>
.app-sidebar {
  height: 100vh;
  overflow-y: auto;
  background: var(--td-bg-color-container, #fff);
  border-right: 1px solid var(--td-border-level-1-color, #e0e0e0);
  transition: width 0.3s;
  width: var(--pmos-sidebar-width);
  display: flex;
  flex-direction: column;
}
.app-sidebar.collapsed {
  width: var(--pmos-sidebar-collapsed-width);
}

.sidebar-logo {
  height: var(--pmos-topbar-height);
  display: flex;
  align-items: center;
  padding: 0 var(--pmos-spacing-md);
  font-weight: 700;
  font-size: var(--pmos-font-size-lg);
  border-bottom: 1px solid var(--td-border-level-1-color, #e0e0e0);
  flex-shrink: 0;
}

.sidebar-nav {
  flex: 1;
  padding: var(--pmos-spacing-xs) 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--pmos-spacing-sm);
  padding: 10px var(--pmos-spacing-md);
  text-decoration: none;
  color: var(--td-text-color-primary, #333);
  font-size: var(--pmos-font-size-md);
  transition: background 0.2s;
  border-radius: 0;
  margin: 2px 0;
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
