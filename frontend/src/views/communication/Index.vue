<template>
  <div>
    <h1 class="text-xl font-bold mb-4">沟通管理</h1>
    <div class="flex gap-2 mb-4">
      <button :class="tab==='comm'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='comm'">沟通记录</button>
      <button :class="tab==='types'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='types'">沟通类型</button>
      <div class="flex-1"></div>
      <button @click="openForm" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建{{ tab==='comm' ? '沟通记录' : '类型' }}</button>
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th v-for="c in cols" :key="c.k" class="text-left py-3 px-3 font-medium">{{ c.t }}</th>
          <th class="text-right py-3 px-3 font-medium w-24">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td v-for="c in cols" :key="c.k" class="py-3 px-4">{{ r[c.k] ?? '' }}</td>
            <td class="py-3 px-4">
              <button @click="editItem(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
              <button @click="deleteItem(r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
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
    </div>
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ editing?'编辑':'新建' }} {{ tab==='comm'?'沟通记录':'类型' }}</h2>
        <div class="space-y-3">
          <div v-for="f in curFields" :key="f.k">
            <label class="block text-sm font-medium mb-1">{{ f.t }}</label>
            <input v-model="form[f.k]" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveItem" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useConfirmStore } from '@/stores/confirm'
const confirm = useConfirmStore()
const tab = ref('comm')
const items = ref<any[]>([])
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref<Record<string,string>>({})

const views: Record<string,{e:string;cols:{k:string;t:string}[];fields:{k:string;t:string}[]}> = {
  comm: { e:'comm-records', cols:[{k:'subject',t:'主题'},{k:'comm_type',t:'类型'},{k:'comm_date',t:'时间'},{k:'location',t:'地点'}], fields:[{k:'subject',t:'主题'},{k:'comm_type',t:'类型'},{k:'location',t:'地点'}] },
  types: { e:'comm-types', cols:[{k:'name',t:'名称'},{k:'sort_order',t:'排序'}], fields:[{k:'name',t:'名称'},{k:'sort_order',t:'排序'}] },
}
const cur = computed(() => views[tab.value])
const cols = computed(() => cur.value?.cols || [])
const curFields = computed(() => cur.value?.fields || [])

async function load() {
  if (!cur.value) return
  try { const r=await fetch('/api/v1/'+cur.value.e+'/'); const d=await r.json(); items.value=d.results ?? [] } catch { items.value=[] }
}
function openForm() { editing.value=null; form.value={}; showForm.value=true }
function editItem(r: any) { editing.value=r; form.value={...r}; showForm.value=true }
async function saveItem() {
  try {
    if (editing.value) { await fetch('/api/v1/'+cur.value!.e+'/'+editing.value.id+'/', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form.value) }) }
    else { await fetch('/api/v1/'+cur.value!.e+'/', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form.value) }) }
    showForm.value=false; load()
  } catch(e) { console.error(e) }
}
async function deleteItem(id: number) {
  if(!(await confirm.show('确认删除？'))) return
  try { await fetch('/api/v1/'+cur.value!.e+'/'+id+'/', { method:'DELETE' }); load() } catch {}
}
watch(tab, load)
onMounted(load)
</script>
