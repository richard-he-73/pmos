<template>
  <t-config-provider :theme="themeStore.currentTheme">
    <!-- 登录页：无布局 -->
    <router-view v-if="isLoginPage" />
    <!-- 其他页：响应式布局 -->
    <DesktopLayout v-else-if="responsiveStore.isDesktop" />
    <MobileLayout v-else />
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
</style>
