<template>
  <div>
    <h1 class="text-xl font-bold mb-4">项目管理</h1>
    <div class="flex flex-wrap gap-2 mb-4">
      <input v-model="search" placeholder="搜索项目名称/编号..." class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm flex-1 min-w-[180px] outline-none focus:ring-2 focus:ring-blue-500" @input="onSearch" />
      <select v-model="filters.status" @change="fetchData" class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none"><option value="">全部状态</option><option value="planning">计划中</option><option value="active">进行中</option><option value="pending_acceptance">待验收</option><option value="closed">已结项</option></select>
      <select v-model="filters.project_type" @change="fetchData" class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none"><option value="">全部类型</option><option value="monthly">人月型</option><option value="fixed">项目制</option><option value="resource_pool">资源池</option></select>
      <div class="flex-1"></div>
      <button @click="openCreate" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">＋ 新建项目</button>
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
                  <div class="flex gap-1 justify-end whitespace-nowrap">
                    <button v-if="activeProjectId===p.id" class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default">当前项目</button>
                <button v-else @click="setAsActive(p)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">设为当前</button>
                <button @click="openDetail(p)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                <button @click="openEdit(p)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button @click="handleDelete(p)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
                  </div>
              </td>
            </tr>
                    <tr v-if="items.length === 0">
              <td colspan="7" class="py-16 text-center text-slate-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <span class="text-sm">暂无数据</span>
              </td>
            </tr>
</tbody></table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; fetchData()" @update:page-size="pageSize=$event; page=1; fetchData()" />
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
            <div class="flex gap-2"><SmartDateInput v-model="form.start_date" placeholder="开始日期" class="flex-1" /><SmartDateInput v-model="form.end_date" placeholder="结束日期" class="flex-1" /></div>
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

    <!-- 项目详情弹窗 -->
    <div v-if="showDetail && detailItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showDetail=false">
      <div class="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold">项目详情</h2>
          <button @click="showDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="col-span-2 sm:col-span-1">
            <span class="text-slate-400 block text-xs mb-0.5">项目编号</span>
            <span class="font-mono font-medium">{{ detailItem.code }}</span>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <span class="text-slate-400 block text-xs mb-0.5">项目名称</span>
            <span class="font-medium">{{ detailItem.name }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-slate-400 block text-xs mb-0.5">项目描述</span>
            <span class="text-slate-600 dark:text-slate-300">{{ detailItem.description || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">项目领域</span>
            <span>{{ ({ overall_planning: '整体规划', project_management: '项目管理', professional_consulting: '专业咨询' })[detailItem.project_domain] || detailItem.project_domain || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">咨询方向</span>
            <span>{{ ({ core: '核心', credit: '信贷', credit_card: '信用卡', payment: '支付', channel: '渠道', operations: '运营', finance_accounting: '财会', digital_transform: '数字化转型', ai: '人工智能', other: '其他' })[detailItem.consulting_direction] || detailItem.consulting_direction || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">项目类型</span>
            <span class="px-2 py-0.5 rounded text-xs font-medium" :class="typeClass(detailItem.project_type)">{{ typeText(detailItem.project_type) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">项目状态</span>
            <span class="px-2 py-0.5 rounded text-xs font-medium" :class="statusClass(detailItem.status)">{{ statusText(detailItem.status) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">负责人</span>
            <span>{{ detailItem.owner_name || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">日期范围</span>
            <span>{{ detailItem.start_date || '—' }} ~ {{ detailItem.end_date || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">合同价格</span>
            <span>{{ detailItem.contract_price != null ? '¥' + Number(detailItem.contract_price).toLocaleString() : '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">预算价格</span>
            <span>{{ detailItem.budget_price != null ? '¥' + Number(detailItem.budget_price).toLocaleString() : '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">合同签署状态</span>
            <span>{{ ({ draft: '草拟中', pending_legal: '待法审', pending_sign: '待签章', signed: '已签署', archived: '已归档' })[detailItem.contract_status] || detailItem.contract_status || '—' }}</span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import { getProjects, createProject, updateProject, deleteProject } from '@/api/modules/projects'
import type { Project } from '@/api/modules/projects'
import { useProjectStore } from '@/stores/project'
import Pagination from '@/components/Pagination.vue'
import SmartDateInput from '@/components/SmartDateInput.vue'

const router = useRouter()
const toast = useToastStore()
const projectStore = useProjectStore()
const activeProjectId = computed(() => projectStore.activeProjectId)
const items = ref<Project[]>([])
const loading = ref(true)
const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filters = reactive({ status: '', project_type: '' })
const showForm = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const users = ref<any[]>([])
const showDetail = ref(false)
const detailItem = ref<Project | null>(null)

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
    const params: Record<string, any> = { page: page.value, page_size: pageSize.value }
    if (search.value) params.search = search.value
    if (filters.status) params.status = filters.status
    if (filters.project_type) params.project_type = filters.project_type
    const r = await getProjects(params)
    items.value = r.data.results || []
    total.value = r.data.count ?? items.value.length
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
    toast.show(msg)
  }
  finally { saving.value = false }
}
async function setAsActive(p: Project) {
  projectStore.setActiveProject(p.id, p.name)
  toast.show('已切换当前项目为: ' + p.name, 'success')
}

async function handleDelete(p: Project) {
  if (!(await useConfirmStore().show(`确认删除项目「${p.name}」？此操作不可撤销。`))) return
  try { await deleteProject(p.id); toast.show('删除成功', 'success'); fetchData() } catch { toast.show('删除失败', 'error') }
}
function openDetail(p: Project) {
  detailItem.value = p
  showDetail.value = true
}
function viewDetail(p: Project) { router.push('/projects/' + p.id) }

onMounted(async () => {
  await fetchData()
  try { const r = await fetch('/api/v1/users/'); users.value = await r.json() } catch {}
})
</script>
