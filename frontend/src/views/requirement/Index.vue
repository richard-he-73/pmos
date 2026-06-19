<template>
  <div>
    <h1 class="text-xl font-bold mb-4">需求管理</h1>
    <div class="flex gap-2 mb-4">
      <button class="px-3 py-1.5 rounded-lg text-sm" :class="tab==='biz'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" @click="tab='biz'">业务需求</button>
      <button class="px-3 py-1.5 rounded-lg text-sm" :class="tab==='sw'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" @click="tab='sw'">软件需求</button>
    </div>
    <Card>
      <table class="w-full text-sm">
        <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-slate-500">
          <th class="text-left py-2 px-2">编号</th><th class="text-left py-2 px-2">名称</th><th class="text-left py-2 px-2">状态</th>
        </tr></thead>
        <tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50">
            <td class="py-2 px-2 font-mono text-xs">{{ r.code }}</td>
            <td class="py-2 px-2">{{ r.name }}</td>
            <td class="py-2 px-2">{{ r.status }}</td>
          </tr>
        </tbody>
      </table>

<div v-if="items.length===0" class="flex flex-col items-center justify-center py-16 text-slate-400">
    <svg class="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
    <span class="text-sm">暂无数据</span>
  </div>
      
    </Card>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Card from '@/components/Card.vue'
const tab = ref('biz')
const items = ref<any[]>([])
async function load() {
  try {
    const ep = tab.value === 'biz' ? 'business-requirements' : 'software-requirements'
    const r = await fetch('/api/v1/' + ep + '/')
    const d = await r.json()
    items.value = d.results ?? []
  } catch { items.value = [] }
}
watch(tab, load)
onMounted(load)
</script>
