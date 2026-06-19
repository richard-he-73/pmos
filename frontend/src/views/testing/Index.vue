<template>
  <div>
    <h1 class="text-xl font-bold mb-4">测试管理</h1>
    <div class="flex gap-2 mb-4">
      <button :class="tab==='plans'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='plans'">测试计划</button>
      <button :class="tab==='bugs'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='bugs'">缺陷列表</button>
    </div>

    <div class="flex items-center justify-between mb-3">
      <div></div>
      <button v-if="tab==='bugs'" @click="openBugForm" class="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">+ 报告缺陷</button>
    </div>

    <Card>
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 text-slate-500">
          <th v-for="c in cols" :key="c.k" class="text-left py-2 px-2">{{ c.t }}</th>
          <th class="text-left py-2 px-2 w-24">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td v-for="c in cols" :key="c.k" class="py-2 px-2">{{ r[c.k] ?? '' }}</td>
            <td class="py-2 px-2">
              <button @click="editItem(r)" class="text-blue-600 hover:text-blue-800 text-xs">编辑</button>
            </td>
          </tr>
        </tbody></table>

<div v-if="items.length===0" class="flex flex-col items-center justify-center py-16 text-slate-400">
    <svg class="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
    <span class="text-sm">暂无数据</span>
  </div>
        
      </div>
    </Card>

    <!-- 缺陷报告弹窗 -->
    <div v-if="showBugForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showBugForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">报告缺陷</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">标题</label><input v-model="bugForm.title" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label class="block text-sm font-medium mb-1">严重程度</label>
            <select v-model="bugForm.severity" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="critical">致命</option><option value="major">严重</option><option value="minor">一般</option><option value="trivial">轻微</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">模块</label><input v-model="bugForm.module" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label class="block text-sm font-medium mb-1">描述</label><textarea v-model="bugForm.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea></div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showBugForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveBug" class="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Card from '@/components/Card.vue'
import { createBug } from '@/api/modules/testing'
const tab = ref('bugs')
const items = ref<any[]>([])
const showBugForm = ref(false)
const bugForm = ref({ title:'', severity:'minor', module:'', description:'' })
const editing = ref<any>(null)

const views: Record<string,{e:string;cols:{k:string;t:string}[]}> = {
  plans: { e:'test-plans', cols:[{k:'name',t:'计划名称'},{k:'version',t:'版本'},{k:'status',t:'状态'}] },
  bugs: { e:'bugs', cols:[{k:'title',t:'标题'},{k:'severity',t:'严重程度'},{k:'status',t:'状态'},{k:'module',t:'模块'},{k:'reporter_name',t:'报告人'}] },
}
const cols = computed(() => views[tab.value]?.cols || [])

async function load() {
  const v = views[tab.value]; if (!v) return
  try {
    const r = await fetch('/api/v1/' + v.e + '/')
    const d = await r.json()
    items.value = d.results ?? []
  } catch { items.value = [] }
}
function openBugForm() { bugForm.value = { title:'', severity:'minor', module:'', description:'' }; showBugForm.value = true }
function editItem(r: any) { editing.value = r; bugForm.value = { title:r.title, severity:r.severity, module:r.module||'', description:r.description||'' }; showBugForm.value = true }
async function saveBug() {
  try {
    if (editing.value) { await fetch('/api/v1/bugs/'+editing.value.id+'/', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(bugForm.value) }) }
    else { await createBug(bugForm.value as any) }
    showBugForm.value = false; editing.value = null; load()
  } catch (e) { console.error(e) }
}
watch(tab, load)
onMounted(load)
</script>
