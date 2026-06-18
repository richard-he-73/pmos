<template>
  <t-aside :class="['app-sidebar', { collapsed: store.sidebarCollapsed }]">
    <div class="sidebar-logo">
      <span class="logo-text" v-show="!store.sidebarCollapsed">PMOS</span>
    </div>
    <t-menu :value="currentRoute" :collapsed="store.sidebarCollapsed">
      <template v-for="item in menuItems" :key="item.path">
        <t-menu-item :value="item.path" :to="item.path">
          <template #icon><t-icon :name="item.icon" /></template>
          {{ item.label }}
        </t-menu-item>
      </template>
    </t-menu>
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
  { path: '/dashboard', icon: 'dashboard', label: '首页' },
  { path: '/projects', icon: 'folder', label: '项目' },
  { path: '/plans', icon: 'timeline', label: '计划' },
  { path: '/tasks', icon: 'check-circle', label: '任务' },
  { path: '/requirements', icon: 'file-text', label: '需求' },
  { path: '/testing', icon: 'bug', label: '测试' },
  { path: '/work', icon: 'tool', label: '工作' },
  { path: '/documents', icon: 'file', label: '文档' },
  { path: '/statistics', icon: 'chart', label: '统计' },
  { path: '/system', icon: 'settings', label: '系统' },
]
</script>

<style scoped>
.app-sidebar {
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s;
}
.app-sidebar.collapsed { width: var(--pmos-sidebar-collapsed-width); }
.sidebar-logo {
  height: var(--pmos-topbar-height);
  display: flex;
  align-items: center;
  padding: 0 var(--pmos-spacing-md);
  font-weight: 700;
  font-size: var(--pmos-font-size-lg);
}
</style>
