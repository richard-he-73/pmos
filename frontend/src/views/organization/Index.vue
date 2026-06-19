<template>
  <div>
    <h1 class="text-xl font-bold mb-4">组织管理</h1>
    <div class="flex gap-2 mb-4">
      <button :class="tab==='dept'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='dept'">部门管理</button>
      <button :class="tab==='members'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='members'">组织成员</button>
    </div>

    <div class="flex justify-end mb-3">
      <button @click="openForm" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建</button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500">
          <th v-for="c in cols" :key="c.k" class="text-left py-3 px-4 font-medium">{{ c.t }}</th>
          <th class="text-left py-3 px-4 font-medium w-24">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td v-for="c in cols" :key="c.k" class="py-3 px-4">
              <span v-if="c.k==='is_active'" class="inline-block w-2 h-2 rounded-full mr-1.5" :class="r[c.k] ? 'bg-green-500' : 'bg-red-400'"></span>
              <span :class="c.k==='is_active' ? 'text-xs '+(r[c.k]?'text-green-600':'text-red-400'):''">{{ c.k==='is_active' ? (r[c.k]?'启用':'禁用') : (r[c.k] ?? '') }}</span>
            </td>
            <td class="py-3 px-4 whitespace-nowrap">
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

    <!-- 弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ editing?'编辑':'新建' }} {{ tab==='dept'?'部门':'成员' }}</h2>
        <div class="space-y-3">
          <div v-for="f in curFields" :key="f.k">
            <label class="block text-sm font-medium mb-1">{{ f.t }}</label>

            <!-- Switch / 开关 -->
            <label v-if="f.type==='switch'" class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form[f.k]" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              <span class="ml-2 text-sm text-slate-600 dark:text-slate-300">{{ form[f.k] ? '已启用' : '已禁用' }}</span>
            </label>

            <!-- Textarea -->
            <textarea v-model="form[f.k]" v-else-if="f.type==='textarea'" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea>

            <!-- Select: parent / department (depts list) -->
            <select v-model="form[f.k]" v-else-if="f.k==='parent'||f.k==='department'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">无</option>
              <option v-for="d in depts" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>

            <!-- Select: manager (users list) -->
            <select v-model="form[f.k]" v-else-if="f.k==='manager'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">不指定</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.real_name || u.username }}</option>
            </select>

            <!-- Default: text input -->
            <input v-model="form[f.k]" v-else class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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
import request from '@/api/request'
import { useToastStore } from '@/stores/toast'
const toast = useToastStore()
const tab = ref('dept')
const items = ref<any[]>([])
const depts = ref<any[]>([])
const users = ref<any[]>([])
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref<Record<string,any>>({})

const views: Record<string,{e:string;cols:{k:string;t:string}[];fields:{k:string;t:string;type?:string}[]}> = {
  dept: { e:'departments', cols:[{k:'name',t:'名称'},{k:'parent_name',t:'上级部门'},{k:'manager_name',t:'负责人'},{k:'description',t:'职责'},{k:'is_active',t:'启用'}], fields:[{k:'name',t:'名称'},{k:'parent',t:'上级部门'},{k:'manager',t:'部门负责人'},{k:'description',t:'部门职责',type:'textarea'},{k:'is_active',t:'是否启用',type:'switch'}] },
  members: { e:'org-members', cols:[{k:'user_name',t:'用户'},{k:'dept_name',t:'部门'},{k:'position',t:'职位'},{k:'is_leader',t:'主管'}], fields:[{k:'user',t:'用户ID'},{k:'department',t:'部门'},{k:'position',t:'职位'}] },
}
const cur = computed(() => views[tab.value])
const cols = computed(() => cur.value?.cols || [])
const curFields = computed(() => cur.value?.fields || [])

async function load() {
  if (!cur.value) return
  try { const r = await request.get('/' + cur.value.e + '/'); items.value = (r.data.results ?? r.data) as any[] } catch { items.value = [] }
}
async function loadDepts() { try { const r=await request.get('/departments/'); depts.value = r.data.results ?? r.data } catch {} }
async function loadUsers() { try { const r=await request.get('/users/'); users.value = r.data.results ?? r.data } catch {} }

function openForm() { editing.value=null; form.value={ is_active: true }; showForm.value=true }
function editItem(r: any) { editing.value=r; form.value={...r}; showForm.value=true }
async function saveItem() {
  // 空字符串外键转为 null
  const payload = { ...form.value }
  for (const k of ['parent', 'manager', 'user', 'department']) {
    if (k in payload && payload[k] === '') payload[k] = null
  }
  try {
    if (editing.value) { await request.patch('/' + cur.value!.e + '/' + editing.value.id + '/', payload) }
    else { await request.post('/' + cur.value!.e + '/', payload) }
    showForm.value=false; load()
  } catch (e: any) {
    console.error('saveItem error', e)
    if (e?.response) {
      const errData = typeof e.response.data === 'object' ? Object.values(e.response.data).flat().join('; ') : JSON.stringify(e.response.data)
      toast.show(errData || '保存失败', 'error')
    } else if (e?.message) {
      toast.show('网络错误: ' + e.message, 'error')
    } else {
      toast.show('保存失败', 'error')
    }
  }
}
async function deleteItem(id: number) {
  if (!confirm('确认删除此部门？')) return
  try { await request.delete('/' + cur.value!.e + '/' + id + '/'); toast.show('删除成功', 'success'); load() } catch { toast.show('删除失败', 'error') }
}
watch(tab, () => { load(); if (tab.value==='members') loadDepts() })
onMounted(() => { load(); loadDepts(); loadUsers() })
</script>
