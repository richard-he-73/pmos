<template>
  <div class="app-root">
    <Sidebar class="layout-desktop" />
    <div class="right-panel">
      <Topbar @toggle-menu="drawerVisible = !drawerVisible" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <MobileBottomNav class="layout-mobile" />
    <t-drawer v-model:visible="drawerVisible" placement="left" show-overlay header="PMOS">
      <t-menu :value="$route.path">
        <template v-for="item in menuItems" :key="item.path">
          <t-menu-item :name="item.path" :value="item.path" @click="navigate(item.path)">
            <template #icon><t-icon :name="item.icon" /></template>
            {{ item.label }}
          </t-menu-item>
        </template>
      </t-menu>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import MobileBottomNav from './MobileBottomNav.vue'

const router = useRouter()
const drawerVisible = ref(false)

function navigate(path: string) {
  router.push(path)
  drawerVisible.value = false
}

const menuItems = [
  { path: '/dashboard', icon: 'dashboard', label: '首页' },
  { path: '/projects', icon: 'folder', label: '项目' },
  { path: '/tasks', icon: 'check-circle', label: '任务' },
  { path: '/plans', icon: 'timeline', label: '计划' },
  { path: '/testing', icon: 'bug', label: '测试' },
  { path: '/documents', icon: 'file', label: '文档' },
  { path: '/system', icon: 'settings', label: '设置' },
]
</script>

<style>
.app-root {
  height: 100vh;
  display: flex;
  flex-direction: row;
}
.right-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
@media (min-width: 768px) { .layout-desktop { display: flex; } .layout-mobile { display: none; } }
@media (max-width: 767px) { .layout-desktop { display: none; } .layout-mobile { display: flex; } }
</style>
