<template>
  <div>
    <h1 class="text-xl font-bold mb-4">测试管理</h1>
    <div class="flex gap-2 mb-4">
      <button :class="tab==='plans'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='plans'">测试计划</button>
      <button :class="tab==='bugs'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='bugs'">缺陷列表</button>
      <div class="flex-1"></div>
      <button v-if="tab==='bugs'" @click="openBugForm" class="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">+ 报告缺陷</button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th v-for="c in cols" :key="c.k" class="text-left py-3 px-3 font-medium">{{ c.t }}</th>
          <th class="text-right py-3 px-3 font-medium w-24">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td v-for="c in cols" :key="c.k" class="py-3 px-3 whitespace-nowrap">{{ r[c.k] ?? '' }}</td>
            <td class="py-3 px-3 whitespace-nowrap">
              <button @click="editItem(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
            </td>
          </tr>
        </tbody></table>
        
      </div>
    </div>

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
import { useProjectStore } from '@/stores/project'
import { createBug } from '@/api/modules/testing'
const projectStore = useProjectStore()
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
    const r = await fetch('/api/v1/' + v.e + '/?project=' + (projectStore.activeProjectId || ''))
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
