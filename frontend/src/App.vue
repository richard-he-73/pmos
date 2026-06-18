<template>
  <t-config-provider :theme="themeStore.currentTheme">
    <!-- 登录页：无布局 -->
    <div v-if="isLoginPage" class="login-wrapper">
      <router-view />
    </div>
    <!-- 其他页：响应式布局（CSS 控制显示/隐藏，避免 JS 条件闪烁） -->
    <div v-else class="app-layouts">
      <DesktopLayout class="layout-desktop" />
      <MobileLayout class="layout-mobile" />
    </div>
  </t-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useResponsiveStore } from '@/stores/responsive'
import { useThemeStore } from '@/stores/theme'
import DesktopLayout from '@/views/layout/DesktopLayout.vue'
import MobileLayout from '@/views/layout/MobileLayout.vue'

const route = useRoute()
const responsiveStore = useResponsiveStore()
const themeStore = useThemeStore()

const isLoginPage = computed(() => route.name === 'Login')

onMounted(() => responsiveStore.init())
onUnmounted(() => responsiveStore.destroy())
</script>

<style>
@import './styles/global.css';

/* 桌面端 > 768px */
@media (min-width: 768px) {
  .layout-desktop { display: flex; }
  .layout-mobile { display: none; }
}

/* 移动端 <= 768px */
@media (max-width: 767px) {
  .layout-desktop { display: none; }
  .layout-mobile { display: flex; }
}

.login-wrapper {
  min-height: 100vh;
}
</style>
