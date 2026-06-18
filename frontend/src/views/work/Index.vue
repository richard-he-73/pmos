<template>
  <div>
    <h1 class="text-xl font-bold mb-4">工作管理</h1>
    <div class="flex gap-2 mb-4">
      <button v-for="t in tabs" :key="t.k" class="px-3 py-1.5 rounded-lg text-sm" :class="tab===t.k?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" @click="tab=t.k">{{ t.l }}</button>
    </div>
    <Card>
      <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 text-slate-500">
        <th v-for="c in cols" :key="c.k" class="text-left py-2 px-2">{{ c.t }}</th>
      </tr></thead><tbody>
        <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50">
          <td v-for="c in cols" :key="c.k" class="py-2 px-2">{{ r[c.k] }}</td>
        </tr>
      </tbody></table>
      <div v-if="items.length===0" class="text-center py-8 text-slate-400">暂无数据</div>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Card from '@/components/Card.vue'
const tab = ref('equipment')
const items = ref<any[]>([])
const tabs = [{k:'equipment',l:'设备',e:'equipments',cols:[{k:'name',t:'名称'},{k:'code',t:'编号'},{k:'type',t:'类型'},{k:'status',t:'状态'}]},{k:'leave',l:'请假',e:'leaves',cols:[{k:'user',t:'申请人'},{k:'type',t:'类型'},{k:'status',t:'状态'}]},{k:'timesheet',l:'工时',e:'timesheets',cols:[{k:'user',t:'人员'},{k:'date',t:'日期'},{k:'hours',t:'工时'},{k:'status',t:'状态'}]}]
const cur = computed(() => tabs.find(t => t.k === tab.value))
const cols = computed(() => cur.value?.cols || [])
async function load() {
  if (!cur.value) return
  try { const r = await fetch('/api/v1/' + cur.value.e + '/'); items.value = await r.json() } catch { items.value = [] }
}
watch(tab, load)
onMounted(load)
</script>
