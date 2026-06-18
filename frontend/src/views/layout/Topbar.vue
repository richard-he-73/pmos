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
          <t-icon name="user" /> {{ '用户' }}
        </t-button>
        <template #dropdown>
          <t-dropdown-menu>
            <t-dropdown-item>个人中心</t-dropdown-item>
            <t-dropdown-item>退出登录</t-dropdown-item>
          </t-dropdown-menu>
        </template>
      </t-dropdown>
    </div>
  </t-header>
</template>

<script setup lang="ts">
import { useResponsiveStore } from '@/stores/responsive'
import ThemeToggle from '@/components/ThemeToggle.vue'

const rStore = useResponsiveStore()

function handleToggleMenu() {
  if (rStore.isMobile) rStore.toggleDrawer()
  else rStore.toggleSidebar()
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
