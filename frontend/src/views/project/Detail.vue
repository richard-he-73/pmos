<template>
  <div v-if="project">
    <button @click="router.back()" class="text-sm text-blue-600 mb-3">&larr; 返回</button>
    <div class="flex items-center gap-3 mb-6">
      <h1 class="text-xl font-bold">{{ project.name }}</h1>
      <span class="px-2 py-0.5 rounded text-xs" :class="stCls(project.status)">{{ stTxt(project.status) }}</span>
      <span class="text-sm text-slate-400">{{ project.code }}</span>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-4">
        <Card title="基本信息">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="text-slate-400">负责人</span><p>{{ project.owner_name }}</p></div>
            <div><span class="text-slate-400">状态</span><p>{{ stTxt(project.status) }}</p></div>
            <div><span class="text-slate-400">开始日期</span><p>{{ project.start_date || '-' }}</p></div>
            <div><span class="text-slate-400">结束日期</span><p>{{ project.end_date || '-' }}</p></div>
            <div class="col-span-2"><span class="text-slate-400">描述</span><p>{{ project.description || '暂无描述' }}</p></div>
          </div>
        </Card>
      </div>
      <Card title="项目统计">
        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-blue-600">{{ stats.tasks.total }}</div><div class="text-xs text-slate-400">任务</div></div>
          <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-green-600">{{ stats.tasks.completed }}</div><div class="text-xs text-slate-400">已完成</div></div>
          <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-orange-600">{{ stats.bugs.total }}</div><div class="text-xs text-slate-400">缺陷</div></div>
          <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-red-600">{{ stats.bugs.open }}</div><div class="text-xs text-slate-400">未关闭</div></div>
        </div>
      </Card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import { getProject } from '@/api/modules/projects'
import { getProjectDetailStats } from '@/api/modules/statistics'
const route = useRoute()
const router = useRouter()
const project = ref<any>(null)
const stats = ref({ tasks: { total: 0, completed: 0 }, bugs: { total: 0, open: 0 } })
function stCls(s: string) { return { planning: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20', active: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20', closed: 'text-slate-500 bg-slate-50' }[s] || '' }
function stTxt(s: string) { return { planning: '规划中', active: '进行中', closed: '已结束' }[s] || s }
onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const [pr, st] = await Promise.all([getProject(id), getProjectDetailStats(id).catch(() => null)])
    project.value = pr.data
    if (st) stats.value = st.data
  } catch {}
})
</script>
