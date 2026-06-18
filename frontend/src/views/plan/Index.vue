<template>
  <div>
    <h1 class="text-xl font-bold mb-4">计划管理</h1>
    <Card>
      <div class="space-y-2">
        <div v-for="p in plans" :key="p.id" class="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
          <span class="text-sm w-20 shrink-0" :class="{'font-bold':p.type==='milestone','pl-4':p.type==='group','pl-8':p.type==='detail'}">{{ p.type === 'milestone' ? '📌' : p.type === 'group' ? '📋' : '📝' }} {{ p.name }}</span>
          <div class="flex-1 h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all" :class="p.status === 'completed' ? 'bg-green-500' : p.status === 'delayed' ? 'bg-red-500' : 'bg-blue-500'" :style="{width: p.progress + '%'}"></div>
          </div>
          <span class="text-xs text-slate-400 w-16 text-right">{{ p.progress }}%</span>
          <span class="text-xs text-slate-400 w-40 hidden sm:block">{{ p.start_date }} ~ {{ p.end_date }}</span>
        </div>
      </div>
      <div v-if="plans.length === 0" class="text-center py-8 text-slate-400">暂无计划数据</div>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from '@/components/Card.vue'
import { getPlans } from '@/api/modules/plans'
const plans = ref<any[]>([])
onMounted(async () => { try { const r = await getPlans(); plans.value = r.data || [] } catch {} })
</script>
