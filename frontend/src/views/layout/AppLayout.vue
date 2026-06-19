<template>
  <div class="h-screen flex">
    <Toast />
    <!-- 桌面端侧栏 -->
    <Sidebar class="hidden md:flex" />

    <!-- 主区域 -->
    <div class="flex-1 flex flex-col min-w-0">
      <Topbar @toggle-menu="drawerOpen = !drawerOpen" />
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <router-view />
      </main>
    </div>

    <!-- 移动端底部导航 -->
    <MobileBottomNav class="md:hidden" />

    <!-- 移动端抽屉 -->
    <div v-if="drawerOpen" class="fixed inset-0 z-50 md:hidden" @click="drawerOpen = false">
      <div class="absolute inset-0 bg-black/50" />
      <aside class="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl" @click.stop>
        <div class="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-700">
          <Logo />
        </div>
        <nav class="p-2 space-y-1">
          <a v-for="item in menuItems" :key="item.path" :href="item.path"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
             :class="$route.path.startsWith(item.path) ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
             @click="navigate($event, item.path)">
            <span class="text-lg">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        </nav>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import Logo from '@/components/Logo.vue'
import Toast from '@/components/Toast.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import MobileBottomNav from './MobileBottomNav.vue'

const router = useRouter()
const drawerOpen = ref(false)

function navigate(e: MouseEvent, path: string) {
  e.preventDefault()
  router.push(path)
  drawerOpen.value = false
}

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
</script>
