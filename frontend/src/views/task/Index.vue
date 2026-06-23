<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold">任务管理</h1>
      <button @click="openCreateModal"
        class="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
        + 分配任务
      </button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div v-if="loading" class="text-center py-12 text-slate-400 text-sm">加载中...</div>
      <div v-else>
        <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
              <th class="text-left py-3 px-3 font-medium">任务名称</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">所属计划</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">状态</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">优先级</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">责任人</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">开始</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">截止</th>
              <th class="text-right py-3 px-3 font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id"
              class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-3 font-medium">{{ row.name }}</td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ row.plan_name || '—' }}</td>
              <td class="py-3 px-3 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="statusClass(row.status)">{{ statusText(row.status) }}</span>
              </td>
              <td class="py-3 px-3 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="priorityClass(row.priority)">{{ priorityText(row.priority) }}</span>
              </td>
              <td class="py-3 px-3">{{ row.assignee_name || '—' }}</td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ row.start_date || '—' }}</td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ row.due_date || '—' }}</td>
              <td class="py-3 px-3 whitespace-nowrap text-right">
                <div class="flex gap-1 justify-end whitespace-nowrap">
                  <button @click="viewDetail(row)" class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                  <button @click="openEditModal(row)" class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                  <button @click="deleteTask(row.id)" class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
                </div>
              </td>
            </tr>
                    <tr v-if="items.length === 0">
              <td colspan="7" class="py-16 text-center text-slate-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <span class="text-sm">暂无数据</span>
              </td>
            </tr>
</tbody>
        </table>
        </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; fetchTasks()" @update:page-size="pageSize=$event; page=1; fetchTasks()" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetail && detailItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="closeDetail">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">任务详情</h2>
          <button @click="closeDetail" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="col-span-2">
            <span class="text-slate-400 block text-xs mb-0.5">任务名称</span>
            <span class="font-medium">{{ detailItem.name }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">所属计划</span>
            <span>{{ detailItem.plan_name || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">状态</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="statusClass(detailItem.status)">{{ statusText(detailItem.status) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">优先级</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="priorityClass(detailItem.priority)">{{ priorityText(detailItem.priority) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">责任人</span>
            <span>{{ detailItem.assignee_name || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">干系人</span>
            <span>{{ detailItem.stakeholders || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">开始日期</span>
            <span>{{ detailItem.start_date || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">截止日期</span>
            <span>{{ detailItem.due_date || '—' }}</span>
          </div>
        </div>
        <div v-if="detailItem.description" class="mt-4">
          <span class="text-slate-400 block text-xs mb-1">描述</span>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">{{ detailItem.description }}</div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="closeDetail" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">关闭</button>
        </div>
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ editingId ? '编辑任务' : '分配任务' }}</h2>

        <div class="space-y-3">
          <!-- 里程碑计划 -->
          <div>
            <label class="block text-sm font-medium mb-1">里程碑计划 *</label>
            <select v-model="form.milestone_id" @change="onMilestoneChange"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">请选择里程碑计划</option>
              <option v-for="p in milestonePlans" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <!-- 中层计划 -->
          <div>
            <label class="block text-sm font-medium mb-1">中层计划 *</label>
            <select v-model="form.middle_id" @change="onMiddleChange"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">请先选择里程碑计划</option>
              <option v-for="p in middlePlans" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <!-- 详细计划 -->
          <div>
            <label class="block text-sm font-medium mb-1">详细计划 *</label>
            <select v-model="form.plan_id" @change="onDetailChange"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">请先选择中层计划</option>
              <option v-for="p in detailPlans" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <!-- 任务名称 -->
          <div>
            <label class="block text-sm font-medium mb-1">任务名称 *</label>
            <input v-model="form.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- 计划开始 / 结束时间 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">计划开始时间</label>
              <SmartDateInput v-model="form.start_date" />
              <p v-if="detailStartDate" class="text-xs text-slate-400 mt-0.5">受详细计划约束: {{ detailStartDate }} ~ {{ detailEndDate }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">计划结束时间</label>
              <SmartDateInput v-model="form.due_date" />
            </div>
          </div>

          <!-- 责任人 -->
          <div>
            <label class="block text-sm font-medium mb-1">责任人</label>
            <select v-model="form.assignee_id"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option :value="null">不指定</option>
              <option v-for="m in orgMembers" :key="m.id" :value="m.user_id || m.id">{{ memberLabel(m) }}</option>
            </select>
          </div>

          <!-- 干系人 -->
          <div class="relative" data-picker="stakeholder">
            <label class="block text-sm font-medium mb-1">干系人</label>
            <div @click="showStakeholderPicker = !showStakeholderPicker" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm cursor-pointer flex flex-wrap gap-1 min-h-[38px]">
              <span v-if="!form.stakeholders.length" class="text-slate-400">请选择干系人</span>
              <span v-for="s in form.stakeholders" :key="s" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                {{ s }}
              </span>
            </div>
            <div v-if="showStakeholderPicker" class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 shadow-lg p-2 space-y-1">
              <label v-for="m in orgMembers" :key="m.id" class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded">
                <input type="checkbox" :value="m.real_name || m.name" v-model="form.stakeholders" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span>{{ memberLabel(m) }}</span>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- 任务优先级 -->
            <div>
              <label class="block text-sm font-medium mb-1">优先级</label>
              <select v-model="form.priority"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <!-- 任务状态 -->
            <div>
              <label class="block text-sm font-medium mb-1">任务状态</label>
              <select v-model="form.status"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="not_started">未开始</option>
                <option value="in_progress">执行中</option>
                <option value="suspended">已挂起</option>
                <option value="delayed">已延期</option>
                <option value="completed_late">延期完成</option>
                <option value="completed_on_time">按期完成</option>
                <option value="completed_early">提前完成</option>
              </select>
            </div>
          </div>

          <!-- 描述 -->
          <div>
            <label class="block text-sm font-medium mb-1">任务描述</label>
            <textarea v-model="form.description" rows="2"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button @click="showModal = false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">取消</button>
          <button @click="submitForm" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import SmartDateInput from '@/components/SmartDateInput.vue'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import request from '@/api/request'
import Pagination from '@/components/Pagination.vue'

const projectStore = useProjectStore()
const toast = useToastStore()
const confirmStore = useConfirmStore()

const items = ref<any[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(true)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const showDetail = ref(false)
const detailItem = ref<any>(null)
const showStakeholderPicker = ref(false)

const milestonePlans = ref<any[]>([])
const middlePlans = ref<any[]>([])
const detailPlans = ref<any[]>([])
const orgMembers = ref<any[]>([])

const form = ref({
  milestone_id: '',
  middle_id: '',
  plan_id: '',
  name: '',
  start_date: '',
  due_date: '',
  assignee_id: null as number | null,
  stakeholders: [] as string[],
  status: 'not_started',
  priority: 'medium',
  description: '',
})

const detailStartDate = computed(() => {
  const p = detailPlans.value.find(p => p.id === Number(form.value.plan_id))
  return p?.start_date || ''
})

const detailEndDate = computed(() => {
  const p = detailPlans.value.find(p => p.id === Number(form.value.plan_id))
  return p?.end_date || ''
})

const statusMap: Record<string, string> = {
  not_started: '未开始',
  in_progress: '执行中',
  suspended: '已挂起',
  delayed: '已延期',
  completed_late: '延期完成',
  completed_on_time: '按期完成',
  completed_early: '提前完成',
}

function statusText(s: string) { return statusMap[s] || s }
function statusClass(s: string) {
  const map: Record<string, string> = {
    not_started: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    suspended: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    delayed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    completed_late: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    completed_on_time: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed_early: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  }
  return map[s] || map.not_started
}

const priorityMap: Record<string, string> = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低',
}
function priorityText(p: string) { return priorityMap[p] || p || '中' }
function priorityClass(p: string) {
  const map: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  }
  return map[p] || map.medium
}

const roleLabel: Record<string, string> = {
  project_director: '项目总监',
  project_manager: '项目经理',
  consulting_expert: '咨询专家',
  consulting_advisor: '咨询顾问',
  consulting_assistant: '咨询助理',
  other: '其他',
}
function memberLabel(m: any): string {
  const name = m.real_name || m.name || ''
  const parts = []
  if (m.dept_name) parts.push(m.dept_name)
  if (m.project_role && roleLabel[m.project_role]) parts.push(roleLabel[m.project_role])
  const suffix = parts.length ? `（${parts.join('-')}）` : ''
  return `${name}${suffix}`
}

function onMilestoneChange() {
  form.value.middle_id = ''
  form.value.plan_id = ''
  middlePlans.value = milestonePlans.value
    .find(p => p.id === Number(form.value.milestone_id))?.children || []
}

function onMiddleChange() {
  form.value.plan_id = ''
  detailPlans.value = middlePlans.value
    .find(p => p.id === Number(form.value.middle_id))?.children || []
}

function onDetailChange() {
  // 日期约束由 computed 自动更新
}

function openCreateModal() {
  editingId.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(row: any) {
  editingId.value = row.id
  // 找到对应的计划链
  const plan = allPlansFlat.value.find(p => p.id === row.plan)
  const milestoneId = findRootPlanId(row.plan)
  const middleId = plan?.parent || ''

  // 填充中层、详细计划列表
  if (milestoneId) {
    form.value.milestone_id = String(milestoneId)
    onMilestoneChange()
    if (middleId) {
      form.value.middle_id = String(middleId)
      onMiddleChange()
      form.value.plan_id = String(row.plan)
    }
  }

  form.value.name = row.name || ''
  form.value.start_date = row.start_date || ''
  form.value.due_date = row.due_date || ''
  form.value.assignee_id = row.assignee ?? null
  form.value.stakeholders = row.stakeholders ? row.stakeholders.split(',').map((s: string) => s.trim()) : []
  form.value.status = row.status || 'not_started'
  form.value.priority = row.priority || 'medium'
  form.value.description = row.description || ''
  showModal.value = true
}

function resetForm() {
  form.value = {
    milestone_id: '',
    middle_id: '',
    plan_id: '',
    name: '',
    start_date: '',
    due_date: '',
    assignee_id: null,
    stakeholders: [],
    status: 'not_started',
    priority: 'medium',
    description: '',
  }
  middlePlans.value = []
  detailPlans.value = []
}

function viewDetail(row: any) {
  detailItem.value = row
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  detailItem.value = null
}

async function submitForm() {
  if (submitting.value) return
  if (!form.value.plan_id) { toast.show('请选择完整的三级计划', 'error'); return }
  if (!form.value.name) { toast.show('请输入任务名称', 'error'); return }

  submitting.value = true
  try {
    // 找到选中的责任人姓名
    const selectedMember = form.value.assignee_id
      ? orgMembers.value.find(m => (m.user_id || m.id) === form.value.assignee_id)
      : null
    const payload: any = {
      name: form.value.name,
      plan: Number(form.value.plan_id),
      status: form.value.status,
      priority: form.value.priority,
      description: form.value.description,
      start_date: form.value.start_date || null,
      due_date: form.value.due_date || null,
      assignee_name: selectedMember ? (selectedMember.real_name || selectedMember.name) : '',
      stakeholders: form.value.stakeholders.join(', '),
    }

    if (editingId.value) {
      await request.put(`/tasks/${editingId.value}/`, payload)
      toast.show('任务更新成功', 'success')
    } else {
      await request.post('/tasks/', payload)
      toast.show('任务创建成功', 'success')
    }
    showModal.value = false
    await fetchTasks()
  } catch (e: any) {
    const detail = e?.response?.data?.detail || e?.response?.data || '操作失败'
    const msg = typeof detail === 'string' ? detail : JSON.stringify(detail)
    toast.show(msg, 'error')
  } finally {
    submitting.value = false
  }
}

async function deleteTask(id: number) {
  if (!(await confirmStore.show('确认删除此任务？'))) return
  try {
    await request.delete(`/tasks/${id}/`)
    toast.show('任务已删除', 'success')
    await fetchTasks()
  } catch {
    toast.show('删除失败', 'error')
  }
}

const allPlansFlat = ref<any[]>([])

function findRootPlanId(planId: number): number | null {
  const plan = allPlansFlat.value.find(p => p.id === planId)
  if (!plan) return null
  if (plan.type === 'milestone') return plan.id
  if (!plan.parent) return null
  return findRootPlanId(plan.parent)
}

async function fetchPlans() {
  try {
    const params: Record<string, any> = { page_size: 9999 }
    if (projectStore.activeProjectId) {
      params.project = String(projectStore.activeProjectId)
    }
    const r = await request.get('/plans/', { params })
    const plans = r.data.results ?? r.data ?? []

    // 构建三级结构
    const byType: Record<string, any[]> = { milestone: [], middle: [], detail: [] }
    plans.forEach((p: any) => {
      if (byType[p.type]) byType[p.type].push(p)
    })

    // 里程碑 → 中层 → 详细 的树
    milestonePlans.value = byType.milestone.map((m: any) => ({
      ...m,
      children: byType.middle
        .filter((mid: any) => mid.parent === m.id)
        .map((mid: any) => ({
          ...mid,
          children: byType.detail.filter((d: any) => d.parent === mid.id),
        })),
    }))

    allPlansFlat.value = plans
  } catch {
    // ignore
  }
}

async function fetchOrgMembers() {
  try {
    const r = await request.get('/org-members/', { params: { page_size: 9999 } })
    orgMembers.value = r.data.results ?? r.data ?? []
  } catch {
    // ignore
  }
}

async function fetchTasks() {
  try {
    const params: Record<string, any> = {
      page: page.value,
      page_size: pageSize.value,
    }
    if (projectStore.activeProjectId) {
      params.project = String(projectStore.activeProjectId)
    }
    const r = await request.get('/tasks/', { params })
    items.value = (r.data.results ?? r.data) as any[]
    total.value = r.data.count ?? items.value.length
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('[data-picker="stakeholder"]')) showStakeholderPicker.value = false
}

onMounted(async () => {
  await Promise.all([fetchTasks(), fetchPlans(), fetchOrgMembers()])
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
