<template>
  <t-footer class="mobile-bottom-nav">
    <div
      v-for="item in navItems"
      :key="item.path"
      class="nav-item"
      :class="{ active: route.path.startsWith(item.path) }"
      @click="router.push(item.path)"
    >
      <t-icon :name="item.icon" />
      <span>{{ item.label }}</span>
    </div>
  </t-footer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: '首页' },
  { path: '/projects', icon: 'folder', label: '项目' },
  { path: '/tasks', icon: 'check-circle', label: '任务' },
  { path: '/notifications', icon: 'notification', label: '通知' },
  { path: '/system', icon: 'user', label: '我的' },
]
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--pmos-mobile-bottom-nav-height);
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--pmos-bg-primary);
  border-top: 1px solid var(--pmos-border);
  z-index: 1000;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: var(--pmos-font-size-xs);
  cursor: pointer;
  color: var(--pmos-text-secondary);
}
.nav-item.active { color: var(--td-brand-color, #0052d9); }
</style>
