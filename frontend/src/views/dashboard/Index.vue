<template>
  <div>
    <h1 class="text-2xl font-bold mb-1">欢迎回来，{{ username }}</h1>
    <p class="text-slate-500 dark:text-slate-400 mb-6">{{ time }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="s in stats" :key="s.label"
           class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-md transition"
           @click="router.push(s.path)">
        <div class="flex items-center gap-3">
          <span class="text-2xl">{{ s.icon }}</span>
          <div>
            <div class="text-2xl font-bold">{{ s.value }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h2 class="text-lg font-semibold mb-4">我的项目</h2>
      <div v-if="projects.length === 0" class="text-center py-8 text-slate-400">暂无项目数据</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th class="text-left py-3 px-3 font-medium">编号</th><th class="text-left py-3 px-3 font-medium">名称</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">状态</th><th class="text-left py-3 px-3 font-medium hidden md:table-cell">创建时间</th>
          </tr></thead>
          <tbody>
            <tr v-for="p in projects" :key="p.id" class="border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30" @click="router.push('/projects/' + p.id)">
              <td class="py-2.5 px-2 font-mono text-xs">{{ p.code }}</td>
              <td class="py-2.5 px-2 font-medium">{{ p.name }}</td>
              <td class="py-2.5 px-2 hidden sm:table-cell"><span :class="statusClass(p.status)">{{ statusText(p.status) }}</span></td>
              <td class="py-2.5 px-2 hidden md:table-cell text-slate-400 text-xs">{{ p.created_at?.slice(0, 10) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getProjects } from '@/api/modules/projects'
import { getProjectOverview } from '@/api/modules/statistics'
const router = useRouter()
const authStore = useAuthStore()
const username = computed(() => authStore.currentUser?.real_name || authStore.currentUser?.username || '用户')
const time = ref(new Date().toLocaleString('zh-CN'))
const projects = ref<any[]>([])
const stats = ref([{ icon: '📁', label: '项目总数', value: '0', path: '/projects' }, { icon: '✅', label: '待完成任务', value: '0', path: '/tasks' }, { icon: '🐛', label: '未关闭缺陷', value: '0', path: '/bugs' }, { icon: '📊', label: '系统概览', value: '0', path: '/statistics' }])
function statusClass(s: string) { return { planning: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20', active: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20', pending_acceptance: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20', closed: 'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800' }[s] + ' px-2 py-0.5 rounded text-xs' }
function statusText(s: string) { return { planning: '计划中', active: '进行中', pending_acceptance: '待验收', closed: '已结项' }[s] || s }
onMounted(async () => {
  try {
    const [ov, pj] = await Promise.all([getProjectOverview(), getProjects({ limit: 10 }).catch(() => null)])
    if (ov?.data?.total !== undefined) stats.value[0].value = String(ov.data.total)
    if (pj?.data?.results) projects.value = pj.data.results
  } catch {}
})
</script>
