<template>
  <div>
    <h1 class="text-xl font-bold mb-4">统计分析</h1>
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div v-if="loading" class="text-center py-8 text-slate-400">加载中...</div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th v-for="c in columns" :key="c.k" class="text-left py-3 px-3 font-medium">{{ c.t }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="row in items" :key="row.id" class="border-b border-slate-100 dark:border-slate-700/50">
              <td v-for="c in columns" :key="c.k" class="py-3 px-3">{{ row[c.k] }}</td>
            </tr>
                    <tr v-if="items.length === 0">
              <td colspan="5" class="py-16 text-center text-slate-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <span class="text-sm">暂无数据</span>
              </td>
            </tr>
</tbody></table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; load()" @update:page-size="pageSize=$event; page=1; load()" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import Pagination from '@/components/Pagination.vue'
const items = ref<any[]>([])
const projectStore = useProjectStore()
const loading = ref(true)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const columns: { k: string; t: string }[] = []

async function load() {
  loading.value = true
  try {
    const r = await fetch('/api/v1/statistics/project_overview/?project=' + (projectStore.activeProjectId || ''))
    const d = await r.json()
    items.value = d.results ?? []
  } catch {}
  finally { loading.value = false }
}

onMounted(load)
</script>
