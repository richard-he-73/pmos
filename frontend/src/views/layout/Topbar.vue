<template>
  <t-header class="app-topbar">
    <div class="topbar-left">
      <t-button variant="text" @click="handleToggleMenu">
        <t-icon name="menu" />
      </t-button>
      <t-breadcrumb class="desktop-only" />
    </div>
    <div class="topbar-right">
      <t-input placeholder="搜索..." class="desktop-only" style="width: 220px" />
      <t-button variant="text"><t-icon name="notification" /></t-button>
      <ThemeToggle />
      <t-dropdown>
        <t-button variant="text">
          <t-icon name="user" /> {{ authStore.currentUser?.real_name || authStore.currentUser?.username || '用户' }}
        </t-button>
        <template #dropdown>
          <t-dropdown-menu>
            <t-dropdown-item>个人中心</t-dropdown-item>
            <t-dropdown-item @click="handleLogout">退出登录</t-dropdown-item>
          </t-dropdown-menu>
        </template>
      </t-dropdown>
    </div>
  </t-header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useResponsiveStore } from '@/stores/responsive'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const rStore = useResponsiveStore()
const authStore = useAuthStore()

function handleToggleMenu() {
  if (rStore.isMobile) rStore.toggleDrawer()
  else rStore.toggleSidebar()
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--pmos-topbar-height);
  padding: 0 var(--pmos-spacing-md);
  border-bottom: 1px solid var(--pmos-border);
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--pmos-spacing-sm);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--pmos-spacing-sm);
}
</style>
