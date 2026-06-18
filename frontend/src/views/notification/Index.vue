<template>
  <div>
    <h1 class="text-xl font-bold mb-4">消息通知</h1>
    <Card>
      <div v-if="loading" class="text-center py-8 text-slate-400">加载中...</div>
      <div v-else-if="items.length === 0" class="text-center py-8 text-slate-400">暂无数据</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-slate-500">
            <th v-for="c in columns" :key="c.k" class="text-left py-2 px-2">{{ c.t }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="row in items" :key="row.id" class="border-b border-slate-100 dark:border-slate-700/50">
              <td v-for="c in columns" :key="c.k" class="py-2 px-2">{{ row[c.k] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from '@/components/Card.vue'
const items = ref<any[]>([])
const loading = ref(true)
const columns = [{k:"title",t:"标题"},{k:"type",t:"类型"},{k:"is_read",t:"已读"}]
onMounted(async () => {
  try {
    const r = await fetch('/api/v1/notifications/')
    const d = await r.json()
    items.value = d.results || d || []
  } catch {}
  finally { loading.value = false }
})
</script>
