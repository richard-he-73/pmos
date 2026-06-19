<template>
  <div>
    <h1 class="text-xl font-bold mb-4">系统管理</h1>
    <div class="flex gap-2 mb-4">
      <button v-for="t in tabs" :key="t.k" class="px-3 py-1.5 rounded-lg text-sm transition" :class="tab===t.k?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'" @click="tab=t.k">{{ t.l }}</button>
    </div>

    <Card>
      <div class="flex items-center justify-between mb-3">
        <div class="flex gap-2">
          <input v-model="search" placeholder="搜索..." class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none w-48" @input="load" />
        </div>
        <button @click="openCreate" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 text-slate-500">
          <th v-for="c in cols" :key="c.k" class="text-left py-2 px-2">{{ c.t }}</th>
          <th class="text-left py-2 px-2 w-24">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td v-for="c in cols" :key="c.k" class="py-2 px-2">{{ r[c.k] ?? '' }}</td>
            <td class="py-2 px-2">
              <button @click="editItem(r)" class="text-blue-600 hover:text-blue-800 text-xs mr-2">编辑</button>
              <button @click="deleteItem(r.id)" class="text-red-500 hover:text-red-700 text-xs">删除</button>
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

    <!-- 新建/编辑弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ editing ? '编辑' : '新建' }} {{ tabs.find(t=>t.k===tab)?.l }}</h2>
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
import Card from '@/components/Card.vue'
const tab = ref('users')
const search = ref('')
const items = ref<any[]>([])
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref<Record<string,string>>({})

async function api(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('pmos-token')
  const headers = { ...(options.headers || {}), 'Content-Type': 'application/json' } as Record<string,string>
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await api(url, { ...options, headers })
  return res
}

const tabs = [
  { k:'users', l:'用户管理', e:'users', cols:[{k:'username',t:'用户名'},{k:'real_name',t:'姓名'},{k:'department',t:'部门'},{k:'position',t:'职位'}], fields:[{k:'username',t:'用户名'},{k:'real_name',t:'姓名'},{k:'email',t:'邮箱'},{k:'department',t:'部门'},{k:'position',t:'职位'}] },
  { k:'roles', l:'角色管理', e:'roles', cols:[{k:'name',t:'角色'},{k:'code',t:'编码'},{k:'is_system',t:'内置'}], fields:[{k:'name',t:'角色名称'},{k:'code',t:'编码'}] },
]
const cur = computed(() => tabs.find(t => t.k === tab.value))
const cols = computed(() => cur.value?.cols || [])
const curFields = computed(() => cur.value?.fields || [])

async function load() {
  if (!cur.value) return
  try {
    let url = '/api/v1/' + cur.value.e + '/'
    if (search.value) url += '?search=' + encodeURIComponent(search.value)
    const r = await api(url)
    const d = await r.json()
    items.value = d.results ?? []
  } catch { items.value = [] }
}
function openCreate() { editing.value = null; form.value = {}; showForm.value = true }
function editItem(r: any) { editing.value = r; form.value = {...r}; showForm.value = true }
async function saveItem() {
  try {
    if (editing.value) {
      await api('/api/v1/' + cur.value!.e + '/' + editing.value.id + '/', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form.value) })
    } else {
      await api('/api/v1/' + cur.value!.e + '/', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form.value) })
    }
    showForm.value = false; load()
  } catch (e) { console.error(e) }
}
async function deleteItem(id: number) {
  if (!confirm('确认删除？')) return
  try { await api('/api/v1/' + cur.value!.e + '/' + id + '/', { method:'DELETE' }); load() } catch {}
}
watch(tab, () => { search.value = ''; load() })
onMounted(load)
</script>
