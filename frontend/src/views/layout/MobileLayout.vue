<template>
  <t-layout class="mobile-layout">
    <t-header class="mobile-topbar">
      <t-button variant="text" @click="rStore.toggleDrawer">
        <t-icon :name="rStore.drawerVisible ? 'close' : 'menu'" />
      </t-button>
      <span class="mobile-title">PMOS</span>
      <ThemeToggle />
    </t-header>

    <t-drawer
      v-model:visible="rStore.drawerVisible"
      placement="left"
      show-overlay
      header="PMOS"
    >
      <t-menu :value="currentRoute">
        <template v-for="item in menuItems" :key="item.path">
          <t-menu-item :name="item.path" :value="item.path" @click="navigate(item.path)">
            <template #icon><t-icon :name="item.icon" /></template>
            {{ item.label }}
          </t-menu-item>
        </template>
      </t-menu>
    </t-drawer>

    <t-content class="mobile-content">
      <router-view />
    </t-content>

    <MobileBottomNav />
  </t-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useResponsiveStore } from '@/stores/responsive'
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

function navigate(path: string) {
  router.push(path)
  rStore.drawerVisible = false
}
</script>

<style scoped>
.mobile-layout { height: 100vh; }
.mobile-topbar {
  display: flex;
  align-items: center;
  height: var(--pmos-topbar-height);
  padding: 0 var(--pmos-spacing-sm);
  border-bottom: 1px solid var(--pmos-border);
}
.mobile-title {
  flex: 1;
  text-align: center;
  font-size: var(--pmos-font-size-lg);
  font-weight: 600;
}
.mobile-content {
  padding: var(--pmos-spacing-sm);
  overflow-y: auto;
  padding-bottom: calc(var(--pmos-mobile-bottom-nav-height) + var(--pmos-spacing-sm));
}
</style>
