<template>
  <header class="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
    <div class="flex items-center gap-2">
      <button class="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" @click="$emit('toggle-menu')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <span class="text-sm text-slate-500 dark:text-slate-400">{{ routeName }}</span>
    </div>
    <div class="flex items-center gap-2">
      <button @click="toggleTheme" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" :title="isDark ? '亮色模式' : '暗色模式'">
        <span class="text-lg">{{ isDark ? '☀️' : '🌙' }}</span>
      </button>
      <div class="relative" ref="dropdownRef">
        <button @click="showMenu = !showMenu" class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
          <span class="text-lg">👤</span>
          <span class="hidden sm:inline">{{ authStore.currentUser?.real_name || authStore.currentUser?.username || '用户' }}</span>
        </button>
        <div v-if="showMenu" class="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50" @click="showMenu = false">
          <button class="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">个人中心</button>
          <button class="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-red-500" @click="logout">退出登录</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showMenu = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const routeName = computed(() => {
  const names: Record<string, string> = {
    Login: '登录', Dashboard: '首页', Projects: '项目管理',
    Plans: '计划管理', Tasks: '任务管理', Requirements: '需求管理',
    Testing: '测试管理', Bugs: '缺陷管理', Work: '工作管理',
    Documents: '文档管理', Statistics: '统计分析',
    Notifications: '消息通知', System: '系统管理',
  }
  return names[route.name as string] || ''
})

const isDark = ref(document.documentElement.classList.contains('dark'))

function toggleTheme() {
  document.documentElement.classList.toggle('dark')
  isDark.value = document.documentElement.classList.contains('dark')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function logout() {
  authStore.logout()
  router.push('/login')
}

function handleClick(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) showMenu.value = false
}

onMounted(() => document.addEventListener('click', handleClick))
onUnmounted(() => document.removeEventListener('click', handleClick))
</script>
