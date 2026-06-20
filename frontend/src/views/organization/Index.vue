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
      <!-- 部门列表：表格 -->
      <div v-if="tab==='dept'">
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
                <button @click="openDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                <button @click="toggleActive(r)" class="px-2.5 py-1 rounded-full text-xs font-medium" :class="r.is_active ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'">{{ r.is_active ? '停用' : '启用' }}</button>
                <button @click="editItem(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button @click="deleteItem(r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
              </td>
            </tr>
          </tbody></table>
          <div v-if="items.length===0" class="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg class="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <span class="text-sm">暂无数据</span>
          </div>
        </div>

        <!-- 组织架构图 -->
        <div v-if="items.length>0" class="border-t border-slate-200 dark:border-slate-700">
          <div class="px-4 py-3 text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-700/50">组织架构图</div>
          <div class="p-6 overflow-x-auto">
            <org-chart :items="items" :depth="0" :parent-id="null" />
          </div>
        </div>
      </div>

      <!-- 组织成员：表格 -->
      <div v-if="tab==='members'" class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500">
          <th v-for="c in cols" :key="c.k" class="text-left py-3 px-4 font-medium">{{ c.t }}</th>
          <th class="text-left py-3 px-4 font-medium w-24">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td v-for="c in cols" :key="c.k" class="py-3 px-4">{{ r[c.k] ?? '' }}</td>
            <td class="py-3 px-4 whitespace-nowrap">
              <button @click="editItem(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
              <button @click="deleteItem(r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
            </td>
          </tr>
        </tbody></table>
        <div v-if="items.length===0" class="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg class="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
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

            <!-- Select: parent (depts list) -->
            <select v-model="form[f.k]" v-else-if="f.k==='parent'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">无</option>
              <option v-for="d in depts" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>

            <!-- Select: manager (users list) -->
            <select v-model="form[f.k]" v-else-if="f.k==='manager'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">不指定</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.real_name || u.username }}</option>
            </select>

            <!-- Consultant select (members tab): auto-populate name/gender/age/rank -->
            <select v-model="form.consultant" v-else-if="f.type==='consultant_select'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" @change="onConsultantSelect">
              <option value="">请选择资源</option>
              <option v-for="c in consultants" :key="c.id" :value="c.id">{{ c.name }} ({{ {male:'男',female:'女'}[c.gender] || c.gender }} / {{ ({director:'咨询总监',senior:'高级咨询师',consultant:'咨询师',assistant:'咨询助理',other:'其他'})[c.rank] || c.rank }})</option>
            </select>

            <!-- Department select (members tab) -->
            <select v-model="form.department" v-else-if="f.type==='dept_select'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择部门</option>
              <option v-for="d in depts" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>

            <!-- Project role select (members tab) -->
            <select v-model="form.project_role" v-else-if="f.type==='project_role_select'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option value="project_director">项目总监</option>
              <option value="project_manager">项目经理</option>
              <option value="consulting_expert">咨询专家</option>
              <option value="consulting_advisor">咨询顾问</option>
              <option value="consulting_assistant">咨询助理</option>
              <option value="other">其他</option>
            </select>

            <!-- Gender select (members tab) -->
            <select v-model="form.gender" v-else-if="f.type==='gender_select'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>

            <!-- Rank select (members tab) -->
            <select v-model="form.rank" v-else-if="f.type==='rank_select'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option value="director">咨询总监</option>
              <option value="senior">高级咨询师</option>
              <option value="consultant">咨询师</option>
              <option value="assistant">咨询助理</option>
              <option value="other">其他</option>
            </select>

            <!-- Number input -->
            <input v-model="form[f.k]" v-else-if="f.type==='number'" type="number" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />

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

    <!-- 详情弹窗 -->
    <div v-if="showDetail && detailItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showDetail=false">
      <div class="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold">部门详情</h2>
          <button @click="showDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="col-span-2 sm:col-span-1">
            <span class="text-slate-400 block text-xs mb-0.5">部门名称</span>
            <span class="font-medium">{{ detailItem.name }}</span>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <span class="text-slate-400 block text-xs mb-0.5">上级部门</span>
            <span>{{ detailItem.parent_name || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">负责人</span>
            <span>{{ detailItem.manager_name || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">状态</span>
            <span class="inline-flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full" :class="detailItem.is_active ? 'bg-green-500' : 'bg-red-400'"></span><span class="text-xs" :class="detailItem.is_active ? 'text-green-600' : 'text-red-400'">{{ detailItem.is_active ? '启用' : '禁用' }}</span></span>
          </div>
          <div class="col-span-2">
            <span class="text-slate-400 block text-xs mb-0.5">部门职责</span>
            <span class="text-slate-600 dark:text-slate-300">{{ detailItem.description || '—' }}</span>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showDetail=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import request from '@/api/request'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import OrgChart from '@/components/OrgChart.vue'
const confirm = useConfirmStore()
const toast = useToastStore()
const tab = ref('dept')
const items = ref<any[]>([])
const depts = ref<any[]>([])
const users = ref<any[]>([])
const loading = ref(false)
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref<Record<string,any>>({})
const showDetail = ref(false)
const detailItem = ref<any>(null)

const views: Record<string,{e:string;cols:{k:string;t:string}[];fields:{k:string;t:string;type?:string}[]}> = {
  dept: { e:'departments', cols:[{k:'name',t:'名称'},{k:'parent_name',t:'上级部门'},{k:'manager_name',t:'负责人'},{k:'description',t:'职责'},{k:'is_active',t:'启用'}], fields:[{k:'name',t:'名称'},{k:'parent',t:'上级部门'},{k:'manager',t:'部门负责人'},{k:'description',t:'部门职责',type:'textarea'},{k:'is_active',t:'是否启用',type:'switch'}] },
  members: { e:'org-members', cols:[{k:'consultant_name',t:'姓名'},{k:'dept_name',t:'所属部门'},{k:'project_role',t:'项目岗位'},{k:'phone',t:'联系电话'}], fields:[{k:'consultant',t:'选择资源',type:'consultant_select'},{k:'name',t:'姓名'},{k:'gender',t:'性别',type:'gender_select'},{k:'age',t:'年龄',type:'number'},{k:'rank',t:'职级',type:'rank_select'},{k:'department',t:'所属部门',type:'dept_select'},{k:'project_role',t:'项目岗位',type:'project_role_select'},{k:'phone',t:'联系电话'},{k:'email',t:'联系邮箱',type:'email'}] },
}
const cur = computed(() => views[tab.value])
const cols = computed(() => cur.value?.cols || [])
const curFields = computed(() => cur.value?.fields || [])

// 树形结构计算
const expandedIds = ref<Set<number>>(new Set())
function toggleExpand(id: number) {
  const s = new Set(expandedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  expandedIds.value = s
}
const treeItems = computed(() => {
  const idMap = new Map<number, any>()
  for (const item of items.value) idMap.set(item.id, item)
  const depthMap = new Map<number, number>()
  function getDepth(id: number): number {
    if (depthMap.has(id)) return depthMap.get(id)!
    const item = idMap.get(id)
    if (!item || !item.parent) { depthMap.set(id, 0); return 0 }
    const d = getDepth(item.parent) + 1
    depthMap.set(id, d)
    return d
  }
  // 父id → 子列表
  const childrenOf = new Map<number, any[]>()
  for (const item of items.value) {
    const pid = item.parent ?? 0
    if (!childrenOf.has(pid)) childrenOf.set(pid, [])
    childrenOf.get(pid)!.push(item)
  }
  function hasChildren(id: number) { return childrenOf.has(id) }
  
  const result: Array<{item: any, depth: number, hasChildren: boolean, expanded: boolean}> = []
  function walk(items: any[]) {
    for (const item of items) {
      const depth = getDepth(item.id)
      const hc = hasChildren(item.id)
      const exp = expandedIds.value.has(item.id)
      result.push({ item, depth, hasChildren: hc, expanded: exp })
      if (exp && hc) walk(childrenOf.get(item.id)!)
    }
  }
  walk(childrenOf.get(0) || [])
  return result
})
function hasNextSiblingInTree(t: any, ancestorDepth: number): boolean {
  // 在 treeItems 中查找同层级的后续节点
  const idx = treeItems.value.indexOf(t)
  if (idx < 0) return false
  for (let i = idx + 1; i < treeItems.value.length; i++) {
    const next = treeItems.value[i]
    if (next.depth < ancestorDepth) return false
    if (next.depth === ancestorDepth) return true
  }
  return false
}

async function load() {
  if (!cur.value) return
  loading.value = true
  try { const r = await request.get('/' + cur.value.e + '/'); items.value = (r.data.results ?? r.data) as any[] } catch { items.value = [] }
  finally { loading.value = false }
  // 默认展开所有部门节点（仅 dept 标签有效）
  if (tab.value === 'dept') {
    const s = new Set<number>()
    for (const item of items.value) s.add(item.id)
    expandedIds.value = s
  }
}
async function loadDepts() { try { const r=await request.get('/departments/', { params: { page_size: 9999 } }); depts.value = r.data.results ?? r.data } catch {} }
async function loadUsers() { try { const r=await request.get('/users/', { params: { page_size: 9999 } }); users.value = r.data.results ?? r.data } catch {} }
const consultants = ref<any[]>([])
async function loadConsultants() { try { const r=await request.get('/consultants/', { params: { page_size: 9999 } }); consultants.value = r.data.results ?? r.data } catch {} }

function onConsultantSelect() {
  const c = consultants.value.find(c => c.id === form.value.consultant)
  if (c) {
    form.value.name = c.name
    form.value.gender = c.gender
    form.value.age = c.age
    form.value.rank = c.rank
  } else {
    form.value.name = ''; form.value.gender = ''; form.value.age = null; form.value.rank = ''
  }
}

function openForm() {
  editing.value = null
  if (tab.value === 'dept') { form.value = { is_active: true } }
  else { form.value = {} }
  showForm.value = true
}
function editItem(r: any) { editing.value = r; form.value = { ...r }; showForm.value = true }
async function saveItem() {
  // 空字符串外键转为 null
  const payload = { ...form.value }
  for (const k of ['parent', 'manager', 'user', 'department', 'consultant']) {
    if (k in payload && payload[k] === '') payload[k] = null
  }
  try {
    if (editing.value) { await request.patch('/' + cur.value!.e + '/' + editing.value.id + '/', payload) }
    else { await request.post('/' + cur.value!.e + '/', payload) }
    showForm.value=false; load(); loadDepts()
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
function openDetail(r: any) { detailItem.value = r; showDetail.value = true }
async function toggleActive(r: any) {
  try {
    await request.patch('/departments/' + r.id + '/', { is_active: !r.is_active })
    r.is_active = !r.is_active
    toast.show(r.is_active ? '已启用' : '已停用', 'success')
  } catch { toast.show('操作失败', 'error') }
}
async function deleteItem(id: number) {
  const msg = tab.value === 'dept' ? '确认删除此部门？' : '确认删除此成员？'
  if (!(await confirm.show(msg))) return
  try { await request.delete('/' + cur.value!.e + '/' + id + '/'); toast.show('删除成功', 'success'); load(); if (tab.value==='dept') loadDepts() } catch { toast.show('删除失败', 'error') }
}
watch(tab, () => { load(); if (tab.value==='members') loadDepts() })
onMounted(() => { load(); loadDepts(); loadUsers(); loadConsultants() })
</script>
