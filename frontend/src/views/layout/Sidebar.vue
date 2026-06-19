<template>
  <aside class="w-60 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
    <div class="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-700 font-bold text-xl text-blue-600">
      PMOS
    </div>
    <nav class="flex-1 p-2 space-y-1 overflow-y-auto">
      <a v-for="item in menuItems" :key="item.path" :href="item.path"
         class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
         :class="isActive(item.path) ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
         @click="go($event, item.path)">
        <span class="text-lg">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </a>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const menuItems = [
  { path: '/dashboard', icon: '📊', label: '首页' },
  { path: '/projects', icon: '📁', label: '项目' },
  { path: '/organization', icon: '🏛️', label: '组织' },
  { path: '/resource', icon: '👥', label: '资源' },
  { path: '/plans', icon: '📅', label: '计划' },
  { path: '/tasks', icon: '✅', label: '任务' },
  { path: '/requirements', icon: '📝', label: '需求' },
  { path: '/testing', icon: '🧪', label: '测试' },
  { path: '/work', icon: '🔧', label: '工作' },
  { path: '/documents', icon: '📄', label: '文档' },
  { path: '/statistics', icon: '📊', label: '统计' },
  { path: '/system', icon: '⚙️', label: '系统' },
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
