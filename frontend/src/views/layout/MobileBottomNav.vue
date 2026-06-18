<template>
  <footer class="fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around z-40 text-xs">
    <a v-for="item in navItems" :key="item.path" :href="item.path"
       class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
       :class="$route.path.startsWith(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'"
       @click="go($event, item.path)">
      <span class="text-lg">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </a>
  </footer>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const navItems = [
  { path: '/dashboard', icon: '🏠', label: '首页' },
  { path: '/projects', icon: '📁', label: '项目' },
  { path: '/tasks', icon: '✅', label: '任务' },
  { path: '/notifications', icon: '🔔', label: '通知' },
  { path: '/system', icon: '⚙️', label: '设置' },
]
function go(e: MouseEvent, path: string) { e.preventDefault(); router.push(path) }
</script>
