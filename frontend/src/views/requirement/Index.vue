<template>
  <div>
    <h1 class="text-xl font-bold mb-4">需求管理</h1>
    <div class="flex gap-2 mb-4">
      <button class="px-3 py-1.5 rounded-lg text-sm" :class="tab==='biz'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" @click="tab='biz'">业务需求</button>
      <button class="px-3 py-1.5 rounded-lg text-sm" :class="tab==='sw'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" @click="tab='sw'">软件需求</button>
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <table class="w-full text-sm">
        <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">编号</th><th class="text-left py-3 px-3 font-medium">名称</th><th class="text-left py-3 px-3 font-medium">状态</th>
        </tr></thead>
        <tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50">
            <td class="py-3 px-3 font-mono text-xs">{{ r.code }}</td>
            <td class="py-3 px-3">{{ r.name }}</td>
            <td class="py-3 px-3">{{ r.status }}</td>
          </tr>
        </tbody></table>
      
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'

const api = async (url: string, opts: any = {}): Promise<Response> => {
  const token = sessionStorage.getItem('pmos-token')
  const headers: Record<string,string> = { "Content-Type": "application/json" }
  if (token) headers['Authorization'] = 'Bearer ' + token
  if (opts.headers) Object.assign(headers, opts.headers)
  return fetch(url + (url.includes('?') ? '&' : '?') + 'project=' + (projectStore.activeProjectId || ''), { ...opts, headers })
}

const tab = ref('biz')
const items = ref<any[]>([])
async function load() {
  try {
    const ep = tab.value === 'biz' ? 'business-requirements' : 'software-requirements'
    const r = await api('/api/v1/' + ep + '/')
    const d = await r.json()
    items.value = d.results ?? []
  } catch { items.value = [] }
}
watch(tab, load)
onMounted(load)
</script>
