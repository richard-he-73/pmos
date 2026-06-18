<template>
  <div>
    <h1 class="text-xl font-bold mb-4">系统管理</h1>
    <div class="flex gap-2 mb-4">
      <button class="px-3 py-1.5 rounded-lg text-sm" :class="tab==='users'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" @click="tab='users'">用户</button>
      <button class="px-3 py-1.5 rounded-lg text-sm" :class="tab==='roles'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" @click="tab='roles'">角色</button>
    </div>
    <Card>
      <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 text-slate-500">
        <th v-for="c in cols" :key="c.k" class="text-left py-2 px-2">{{ c.t }}</th>
      </tr></thead><tbody>
        <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50">
          <td v-for="c in cols" :key="c.k" class="py-2 px-2">{{ r[c.k] || '—' }}</td>
        </tr>
      </tbody></table>
      <div v-if="items.length===0" class="text-center py-8 text-slate-400">暂无数据</div>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Card from '@/components/Card.vue'
const tab = ref('users')
const items = ref<any[]>([])
const views: Record<string,{e:string;cols:{k:string;t:string}[]}> = { users: { e:'users', cols:[{k:'username',t:'用户名'},{k:'real_name',t:'姓名'},{k:'department',t:'部门'},{k:'position',t:'职位'}] }, roles: { e:'roles', cols:[{k:'name',t:'角色'},{k:'code',t:'编码'},{k:'is_system',t:'内置'}] } }
const cols = computed(() => views[tab.value]?.cols || [])
async function load() {
  const v = views[tab.value]; if (!v) return
  try { const r = await fetch('/api/v1/' + v.e + '/'); items.value = await r.json() } catch { items.value = [] }
}
watch(tab, load)
onMounted(load)
</script>
