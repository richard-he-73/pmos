<template>
  <t-config-provider :theme="themeStore.currentTheme">
    <router-view />
  </t-config-provider>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<style>
@import './styles/global.css';
</style>
