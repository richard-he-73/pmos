<template>
  <t-config-provider :theme="themeStore.currentTheme">
    <DesktopLayout v-if="responsiveStore.isDesktop" />
    <MobileLayout v-else />
  </t-config-provider>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useResponsiveStore } from '@/stores/responsive'
import { useThemeStore } from '@/stores/theme'
import DesktopLayout from '@/views/layout/DesktopLayout.vue'
import MobileLayout from '@/views/layout/MobileLayout.vue'

const responsiveStore = useResponsiveStore()
const themeStore = useThemeStore()

onMounted(() => responsiveStore.init())
onUnmounted(() => responsiveStore.destroy())
</script>

<style>
@import './styles/global.css';
</style>
