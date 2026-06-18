<template>
  <t-tooltip :content="isDark ? '切换亮色' : '切换暗色'" placement="bottom">
    <t-button variant="text" @click="toggleTheme">
      <t-icon :name="isDark ? 'light' : 'dark-circle'" />
    </t-button>
  </t-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.currentTheme === 'dark')
const toggleTheme = () => themeStore.toggleTheme()
</script>
