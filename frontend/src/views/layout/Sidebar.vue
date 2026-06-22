<template>
  <aside class="w-60 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
    <div class="h-14 flex items-center gap-2 px-4 border-b border-slate-200 dark:border-slate-700">
      <Logo />
    </div>
    <div v-if="activeProjectName" class="px-3 py-2 mx-2 mt-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <div class="text-xs text-slate-400">当前项目</div>
      <div class="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">{{ activeProjectName }}</div>
    </div>
    <nav class="flex-1 p-2 space-y-1 overflow-y-auto">
      <a v-for="item in menuItems" :key="item.path" :href="item.path"
         class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors"
         :class="isActive(item.path) ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
         @click="go($event, item.path)">
        <span class="text-lg">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </a>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Logo from '@/components/Logo.vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const activeProjectName = computed(() => projectStore.activeProjectName)

const menuItems = [
  { path: '/dashboard', icon: '📊', label: '首页' },
  { path: '/projects', icon: '📁', label: '项目管理' },
  { path: '/organization', icon: '🏛️', label: '组织架构' },
  { path: '/resource', icon: '👥', label: '资源管理' },
  { path: '/plans', icon: '📅', label: '计划管理' },
  { path: '/tasks', icon: '✅', label: '任务管理' },
  { path: '/requirements', icon: '📝', label: '需求管理' },
  { path: '/testing', icon: '🧪', label: '测试管理' },
  { path: '/releases', icon: '🚀', label: '投产管理' },
  { path: '/communication', icon: '💬', label: '沟通管理' },
  { path: '/issues', icon: '⚠️', label: '问题风险' },
  { path: '/work', icon: '🔧', label: '工作管理' },
  { path: '/documents', icon: '📄', label: '文档管理' },
  { path: '/statistics', icon: '📊', label: '统计分析' },
  { path: '/notifications', icon: '🔔', label: '消息通知' },
  { path: '/system', icon: '⚙️', label: '系统管理' },
]

function isActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

function go(e: MouseEvent, path: string) {
  e.preventDefault()
  router.push(path)
}
</script>
