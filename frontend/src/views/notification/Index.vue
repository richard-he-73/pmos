<template>
  <div>
    <h1 class="text-xl font-bold mb-4">消息通知</h1>
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div v-if="loading" class="text-center py-8 text-slate-400">加载中...</div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th v-for="c in columns" :key="c.k" class="text-left py-3 px-3 font-medium">{{ c.t }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="row in items" :key="row.id" class="border-b border-slate-100 dark:border-slate-700/50">
              <td v-for="c in columns" :key="c.k" class="py-2 px-2">{{ row[c.k] }}</td>
            </tr>
          </tbody>
        </table>

<div v-if="items.length===0" class="flex flex-col items-center justify-center py-16 text-slate-400">
    <svg class="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
    <span class="text-sm">暂无数据</span>
  </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const items = ref<any[]>([])
const loading = ref(true)
const columns = [{k:"title",t:"标题"},{k:"type",t:"类型"},{k:"is_read",t:"已读"}]
onMounted(async () => {
  try {
    const r = await fetch('/api/v1/notifications/')
    const d = await r.json()
    items.value = d.results ?? []
  } catch {}
  finally { loading.value = false }
})
</script>
