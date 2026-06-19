<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <h1 class="text-xl font-bold">项目管理</h1>
      <button @click="openCreate" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shrink-0">＋ 新建项目</button>
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <input v-model="search" placeholder="搜索项目名称/编号..." class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm flex-1 min-w-[180px] outline-none focus:ring-2 focus:ring-blue-500" @input="onSearch" />
      <select v-model="filters.status" @change="fetchData" class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none"><option value="">全部状态</option><option value="planning">计划中</option><option value="active">进行中</option><option value="pending_acceptance">待验收</option><option value="closed">已结项</option></select>
      <select v-model="filters.project_type" @change="fetchData" class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none"><option value="">全部类型</option><option value="monthly">人月型</option><option value="fixed">项目制</option><option value="resource_pool">资源池</option></select>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div v-if="loading" class="text-center py-12 text-slate-400 text-sm">加载中...</div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th class="text-left py-3 px-3 font-medium">编号</th>
            <th class="text-left py-3 px-3 font-medium">名称</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">类型</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">状态</th>
            <th class="text-left py-3 px-3 font-medium hidden md:table-cell">负责人</th>
            <th class="text-left py-3 px-3 font-medium hidden lg:table-cell">时间</th>
            <th class="text-right py-3 px-3 font-medium">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="p in items" :key="p.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-3 font-mono text-xs text-slate-500 whitespace-nowrap">{{ p.code }}</td>
              <td class="py-3 px-3 font-medium cursor-pointer whitespace-nowrap" @click="viewDetail(p)">{{ p.name }}</td>
              <td class="py-3 px-3 hidden sm:table-cell"><span class="px-2 py-0.5 rounded text-xs" :class="typeClass(p.project_type)">{{ typeText(p.project_type) }}</span></td>
              <td class="py-3 px-3 hidden sm:table-cell"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="statusClass(p.status)">{{ statusText(p.status) }}</span></td>
              <td class="py-3 px-3 hidden md:table-cell text-slate-500">{{ p.owner_name || '—' }}</td>
              <td class="py-3 px-3 hidden lg:table-cell text-slate-400 text-xs">{{ p.start_date || '—' }} ~ {{ p.end_date || '—' }}</td>
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <button @click="openEdit(p)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs mr-3">编辑</button>
                <button @click="handleDelete(p)" class="text-red-500 hover:text-red-700 text-xs">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
          <div v-if="items.length===0" class="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg class="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <span class="text-sm">暂无数据</span>
          </div>
      </div>
    </div>

    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showForm=false">
      <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ isEdit ? '编辑项目' : '新建项目' }}</h2>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">项目编号 *</label><input v-model="form.code" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">项目名称 *</label><input v-model="form.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">项目描述</label><textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea></div>
          <!-- 项目领域 -->
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">项目领域</label>
            <select v-model="form.project_domain" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="overall_planning">整体规划</option><option value="project_management">项目管理</option><option value="professional_consulting">专业咨询</option>
            </select>
          </div>
          <!-- 咨询方向 -->
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">咨询方向</label>
            <select v-model="form.consulting_direction" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="core">核心</option><option value="credit">信贷</option><option value="credit_card">信用卡</option><option value="payment">支付</option><option value="channel">渠道</option><option value="operations">运营</option><option value="finance_accounting">财会</option><option value="digital_transform">数字化转型</option><option value="ai">人工智能</option><option value="other">其他</option>
            </select>
          </div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">项目类型</label>
            <select v-model="form.project_type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="monthly">人月型</option><option value="fixed">项目制</option><option value="resource_pool">资源池</option>
            </select>
          </div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">日期范围</label>
            <div class="flex gap-2"><input v-model="form.start_date" type="date" class="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /><input v-model="form.end_date" type="date" class="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
          </div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">项目负责人</label>
            <select v-model="form.owner" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option><option v-for="u in users" :key="u.id" :value="u.id">{{ u.real_name || u.username }}</option>
            </select>
          </div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">项目状态</label>
            <select v-model="form.status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="planning">计划中</option><option value="active">进行中</option><option value="pending_acceptance">待验收</option><option value="closed">已结项</option>
            </select>
          </div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">合同价格</label><input v-model="form.contract_price" type="number" step="0.01" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">预算价格</label><input v-model="form.budget_price" type="number" step="0.01" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">合同签署状态</label>
            <select v-model="form.contract_status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="draft">草拟中</option><option value="pending_legal">待法审</option><option value="pending_sign">待签章</option><option value="signed">已签署</option><option value="archived">已归档</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="handleSave" :disabled="saving" class="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProjects, createProject, updateProject, deleteProject } from '@/api/modules/projects'
import type { Project } from '@/api/modules/projects'

const router = useRouter()
const items = ref<Project[]>([])
const loading = ref(true)
const search = ref('')
const filters = reactive({ status: '', project_type: '' })
const showForm = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const users = ref<any[]>([])

const form = reactive({
  code: '', name: '', description: '',
  project_domain: 'overall_planning', consulting_direction: 'other',
  project_type: 'monthly',
  start_date: '', end_date: '', owner: null as number | null,
  status: 'planning', contract_price: null as number | null,
  budget_price: null as number | null, contract_status: 'draft',
})

function typeClass(t: string) { return ({ monthly: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20', fixed: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20', resource_pool: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' })[t] || '' }
function typeText(t: string) { return ({ monthly: '人月型', fixed: '项目制', resource_pool: '资源池' })[t] || t }
function statusClass(s: string) { return ({ planning: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20', active: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20', pending_acceptance: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20', closed: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700' })[s] || '' }
function statusText(s: string) { return ({ planning: '计划中', active: '进行中', pending_acceptance: '待验收', closed: '已结项' })[s] || s }

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearch() { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(fetchData, 300) }
async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (search.value) params.search = search.value
    if (filters.status) params.status = filters.status
    if (filters.project_type) params.project_type = filters.project_type
    const r = await getProjects(params)
    items.value = r.data.results || []
  } catch { items.value = [] }
  finally { loading.value = false }
}
function openCreate() {
  isEdit.value = false; editingId.value = null
  Object.assign(form, { code: '', name: '', description: '', project_type: 'monthly', start_date: '', end_date: '', owner: null, status: 'planning', contract_price: null, budget_price: null, contract_status: 'draft' })
  showForm.value = true
}
function openEdit(p: Project) {
  isEdit.value = true; editingId.value = p.id
  Object.assign(form, p)
  showForm.value = true
}
async function handleSave() {
  if (!form.name || !form.code) return
  saving.value = true
  try {
    const payload = {
      ...form,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      contract_price: form.contract_price || null,
      budget_price: form.budget_price || null,
    }
    if (isEdit.value && editingId.value) { await updateProject(editingId.value, payload as any) }
    else { await createProject(payload as any) }
    showForm.value = false; fetchData()
  } catch (e: any) {
    const msg = e?.response?.data ? Object.entries(e.response.data).map(([k,v]) => `${k}: ${v}`).join('\n') : '保存失败'
    alert(msg)
  }
  finally { saving.value = false }
}
async function handleDelete(p: Project) {
  if (!confirm(`确认删除项目「${p.name}」？`)) return
  try { await deleteProject(p.id); fetchData() } catch {}
}
function viewDetail(p: Project) { router.push('/projects/' + p.id) }

onMounted(async () => {
  await fetchData()
  try { const r = await fetch('/api/v1/users/'); users.value = await r.json() } catch {}
})
</script>
