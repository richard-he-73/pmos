<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold">项目管理</h1>
      <button @click="create" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建项目</button>
    </div>
    <Card>
      <div v-if="loading" class="text-center py-8 text-slate-400">加载中...</div>
      <div v-else-if="items.length === 0" class="text-center py-8 text-slate-400">暂无项目</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-slate-500">
            <th class="text-left py-2 px-2">编号</th><th class="text-left py-2 px-2">名称</th><th class="text-left py-2 px-2 hidden sm:table-cell">状态</th><th class="text-left py-2 px-2 hidden md:table-cell">负责人</th><th class="text-left py-2 px-2 hidden lg:table-cell">时间</th>
          </tr></thead>
          <tbody>
            <tr v-for="p in items" :key="p.id" class="border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30" @click="router.push('/projects/' + p.id)">
              <td class="py-2.5 px-2 font-mono text-xs">{{ p.code }}</td>
              <td class="py-2.5 px-2 font-medium">{{ p.name }}</td>
              <td class="py-2.5 px-2 hidden sm:table-cell"><span class="px-2 py-0.5 rounded text-xs" :class="stCls(p.status)">{{ stTxt(p.status) }}</span></td>
              <td class="py-2.5 px-2 hidden md:table-cell">{{ p.owner_name }}</td>
              <td class="py-2.5 px-2 hidden lg:table-cell text-slate-400 text-xs">{{ p.start_date }} ~ {{ p.end_date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import { getProjects } from '@/api/modules/projects'
const router = useRouter()
const items = ref<any[]>([])
const loading = ref(true)
function stCls(s: string) { return { planning: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20', active: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20', closed: 'text-slate-500 bg-slate-50' }[s] || '' }
function stTxt(s: string) { return { planning: '规划中', active: '进行中', closed: '已结束' }[s] || s }
function create() { router.push('/projects/new') }
onMounted(async () => { try { const r = await getProjects(); items.value = r.data.results || [] } catch {} finally { loading.value = false } })
</script>
