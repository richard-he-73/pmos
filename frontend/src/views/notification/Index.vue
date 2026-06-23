<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold">消息通知</h1>
    </div>
    <div class="flex gap-2 mb-4">
      <button :class="tab==='notifications'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='notifications'">通知列表</button>
      <button :class="tab==='templates'?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab='templates'">模板管理</button>
      <div class="flex-1"></div>
      <button v-if="tab==='templates'" @click="openTemplateForm" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建模板</button>
    </div>

    <div v-if="tab==='notifications'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div v-if="loading" class="text-center py-12 text-slate-400 text-sm">加载中...</div>

      <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg class="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span class="text-sm">暂无通知</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
              <th class="text-left py-3 px-3 font-medium">标题</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">发件人</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">发件时间</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">已读状态</th>
              <th class="text-right py-3 px-3 font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id"
              class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
              :class="{ 'font-medium': !row.is_read }">
              <td class="py-3 px-3 max-w-xs truncate">
                <a @click="viewDetail(row)" class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{{ row.title }}</a>
              </td>
              <td class="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{{ senderLabel(row.type) }}</td>
              <td class="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{{ formatTimeDetail(row.created_at) }}</td>
              <td class="py-3 px-3 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  :class="row.is_read
                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                  {{ row.is_read ? '已读' : '未读' }}
                </span>
              </td>
              <td class="py-3 px-3 whitespace-nowrap text-right">
                <div class="flex gap-1 justify-end whitespace-nowrap">
                  <button @click="viewDetail(row)"
                    class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">
                    详情
                  </button>
                  <button @click="toggleRead(row)"
                    class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    :class="row.is_read
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'">
                    {{ row.is_read ? '未读' : '已读' }}
                  </button>
                  <button @click="deleteNotification(row.id)"
                    class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                    删除
                  </button>
                </div>
              </td>
            </tr>
                    <tr v-if="items.length === 0">
              <td colspan="5" class="py-16 text-center text-slate-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <span class="text-sm">暂无数据</span>
              </td>
            </tr>
</tbody>
        </table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; fetchNotifications()" @update:page-size="pageSize=$event; page=1; fetchNotifications()" />
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetail && detailItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="closeDetail">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">通知详情</h2>
          <button @click="closeDetail" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="space-y-4 text-sm">
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">标题</span>
            <span class="font-medium">{{ detailItem.title }}</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">发件人</span>
              <span>{{ senderLabel(detailItem.type) }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">发件时间</span>
              <span>{{ formatTimeDetail(detailItem.created_at) }}</span>
            </div>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">已读状态</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium"
              :class="detailItem.is_read
                ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
              {{ detailItem.is_read ? '已读' : '未读' }}
            </span>
            <span v-if="detailItem.read_at" class="text-xs text-slate-400 ml-2">于 {{ formatTimeDetail(detailItem.read_at) }}</span>
          </div>
          <div v-if="detailItem.content">
            <span class="text-slate-400 block text-xs mb-0.5">内容</span>
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ detailItem.content }}</div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="closeDetail" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">关闭</button>
        </div>
      </div>
    </div>

    <!-- 模板管理 -->
    <div v-if="tab==='templates'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th class="text-left py-3 px-3 font-medium">编码</th><th class="text-left py-3 px-3 font-medium">标题模板</th>
            <th class="text-left py-3 px-3 font-medium hidden md:table-cell">说明</th><th class="text-right py-3 px-3 font-medium">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="t in templates" :key="t.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td class="py-3 px-3 font-mono text-xs">{{ t.code }}</td>
              <td class="py-3 px-3 max-w-xs truncate">{{ t.title_template }}</td>
              <td class="py-3 px-3 hidden md:table-cell text-slate-500 text-xs truncate max-w-[200px]">{{ t.description || '-' }}</td>
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <button @click="editTemplate(t)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button @click="deleteTemplate(t.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
              </td>
            </tr>
            <tr v-if="templates.length === 0">
              <td colspan="4" class="py-16 text-center text-slate-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <span class="text-sm">暂无模板，点击"新建模板"开始配置</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination :page="tplPage" :page-size="tplPageSize" :total="tplTotal" @update:page="tplPage=$event; fetchTemplates()" @update:page-size="tplPageSize=$event; tplPage=1; fetchTemplates()" />
    </div>

    <!-- 模板编辑弹窗 -->
    <div v-if="showTemplateForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showTemplateForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ templateEditing ? '编辑' : '新建' }}通知模板</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="md:col-span-3 space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">通知类型</label>
              <select v-model="templateForm.code" :disabled="!!templateEditing" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— 请选择通知类型 —</option>
                <option v-for="(label, code) in notificationTypes" :key="code" :value="code">{{ label }}（{{ code }}）</option>
              </select>
              <p v-if="!templateForm.code" class="text-xs text-amber-500 mt-1">选择通知类型后，右侧会显示可用的变量列表</p>
            </div>
            <div><label class="block text-sm font-medium mb-1">标题模板</label><input v-model="templateForm.title_template" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" :placeholder="'e.g. 新任务: {{task_name}}'" /></div>
            <div><label class="block text-sm font-medium mb-1">内容模板</label><textarea v-model="templateForm.content_template" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" :placeholder="'e.g. 您被分配了任务 {{task_name}}'"></textarea></div>
            <div><label class="block text-sm font-medium mb-1">说明</label><input v-model="templateForm.description" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div v-if="templateForm.code && (templateForm.title_template || templateForm.content_template)" class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm">
              <div class="text-xs font-medium text-slate-400 mb-1.5">📋 预览</div>
              <div class="text-slate-700 dark:text-slate-300"><span class="text-slate-400 text-xs">标题：</span>{{ previewTitle || '（空）' }}</div>
              <div class="text-slate-700 dark:text-slate-300 mt-0.5"><span class="text-slate-400 text-xs">内容：</span>{{ previewContent || '（空）' }}</div>
            </div>
          </div>
          <div class="md:col-span-2" v-if="templateForm.code">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
              <div class="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">💡 可用变量（点击插入）</div>
              <div class="space-y-1">
                <div v-for="v in currentVariables" :key="v.name" class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition" @click="insertVar(v.name)">
                  <code class="text-xs font-mono bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 whitespace-nowrap">{{ varLabel(v.name) }}</code>
                  <span class="text-xs text-slate-500 dark:text-slate-400">{{ v.desc }}</span>
                </div>
              </div>
              <div v-if="currentVariables.length === 0" class="text-xs text-slate-400 py-2">此类型暂无可用的变量</div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showTemplateForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveTemplate" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import request from '@/api/request'
import Pagination from '@/components/Pagination.vue'

const projectStore = useProjectStore()
const toast = useToastStore()
const confirmStore = useConfirmStore()

const items = ref<any[]>([])
const templates = ref<any[]>([])
const loading = ref(true)
const showDetail = ref(false)
const detailItem = ref<any>(null)
const showTemplateForm = ref(false)
const templateEditing = ref<any>(null)
const templateForm = ref<Record<string, any>>({})
const tab = ref('notifications')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tplPage = ref(1)
const tplPageSize = ref(10)
const tplTotal = ref(0)

const notificationTypes: Record<string, string> = {
  task_assigned: '任务分配', task_updated: '任务更新', bug_reported: '缺陷报告',
  bug_assigned: '缺陷分配', project_created: '项目创建', project_updated: '项目更新',
  project_member_added: '项目成员', requirement_updated: '需求更新',
  plan_updated: '计划更新', release_planned: '投产计划', system_notice: '系统通知',
}
const senderMap = notificationTypes

const TEMPLATE_VARS: Record<string, { name: string; desc: string }[]> = {
  task_assigned: [{ name: 'task_name', desc: '任务名称' }, { name: 'description', desc: '任务描述' }, { name: 'status', desc: '任务状态' }, { name: 'priority', desc: '优先级' }, { name: 'assignee', desc: '负责人' }, { name: 'due_date', desc: '截止日期' }, { name: 'project_name', desc: '所属项目' }],
  task_updated: [{ name: 'task_name', desc: '任务名称' }, { name: 'status', desc: '任务状态' }, { name: 'project_name', desc: '所属项目' }],
  bug_reported: [{ name: 'bug_title', desc: '缺陷标题' }, { name: 'severity', desc: '严重程度' }, { name: 'module', desc: '模块' }, { name: 'status', desc: '缺陷状态' }, { name: 'description', desc: '缺陷描述' }],
  bug_assigned: [{ name: 'bug_title', desc: '缺陷标题' }, { name: 'severity', desc: '严重程度' }, { name: 'module', desc: '模块' }],
  project_created: [{ name: 'name', desc: '项目名称' }, { name: 'code', desc: '项目编号' }, { name: 'status', desc: '项目状态' }, { name: 'project_type', desc: '项目类型' }, { name: 'description', desc: '项目描述' }],
  project_updated: [{ name: 'name', desc: '项目名称' }, { name: 'status', desc: '项目状态' }],
  requirement_updated: [{ name: 'name', desc: '需求名称' }, { name: 'status', desc: '需求状态' }, { name: 'priority', desc: '优先级' }, { name: 'description', desc: '需求描述' }],
  plan_updated: [{ name: 'name', desc: '计划名称' }, { name: 'plan_type', desc: '计划类型' }, { name: 'status', desc: '计划状态' }, { name: 'progress', desc: '进度' }, { name: 'start_date', desc: '开始日期' }, { name: 'end_date', desc: '结束日期' }],
  release_planned: [{ name: 'name', desc: '投产名称' }, { name: 'planned_date', desc: '计划时间' }],
  project_member_added: [{ name: 'name', desc: '项目名称' }],
  system_notice: [],
}
const PREVIEW_SAMPLES: Record<string, Record<string, string>> = {
  task_assigned: { task_name: '需求文档编写', status: '进行中', priority: '高', assignee: '张三', due_date: '2026-07-15', project_name: '核心项目', description: '编写项目需求规格说明书' },
  task_updated: { task_name: 'API接口开发', status: '已完成', project_name: '核心项目' },
  bug_reported: { bug_title: '登录页面崩溃', severity: '致命', module: '登录模块', status: '新建', description: '点击登录按钮后页面无响应' },
  bug_assigned: { bug_title: '数据导出异常', severity: '严重', module: '导出模块' },
  project_created: { name: '银行核心系统', code: 'P2026001', status: '进行中', project_type: '人月型', description: '银行核心系统升级项目' },
  project_updated: { name: '银行核心系统', status: '进行中' },
  requirement_updated: { name: '用户权限管理', status: '开发中', priority: '高', description: '基于角色的权限控制' },
  plan_updated: { name: '第一阶段', plan_type: '里程碑计划', status: '执行中', progress: '60', start_date: '2026-03-01', end_date: '2026-06-30' },
  release_planned: { name: 'v2.0版本发布', planned_date: '2026-07-15 22:00' },
  project_member_added: { name: '测试项目' },
  system_notice: {},
}
function varLabel(name: string): string { return '{{' + name + '}}' }
function renderPreview(text: string, samples: Record<string, string>): string {
  if (!text) return ''
  return text.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => samples[key] ?? '{{' + key + '}}')
}
const currentVariables = computed(() => TEMPLATE_VARS[templateForm.value.code || ''] || [])
const previewTitle = computed(() => renderPreview(templateForm.value.title_template || '', PREVIEW_SAMPLES[templateForm.value.code || ''] || {}))
const previewContent = computed(() => renderPreview(templateForm.value.content_template || '', PREVIEW_SAMPLES[templateForm.value.code || ''] || {}))
function insertVar(varName: string) {
  const current = templateForm.value.title_template || ''
  templateForm.value.title_template = current + '{{' + varName + '}}'
}

function senderLabel(type: string): string {
  return senderMap[type] || type || '系统通知'
}

function formatTimeDetail(t: string | null | undefined) {
  if (!t) return '—'
  try {
    const d = new Date(t)
    const pad2 = (n: number) => String(n).padStart(2, '0')
    const pad3 = (n: number) => String(n).padStart(3, '0')
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}.${pad3(d.getMilliseconds())}`
  } catch {
    return t
  }
}

function viewDetail(row: any) {
  detailItem.value = row
  showDetail.value = true
  // 打开详情即标记为已读
  if (!row.is_read) {
    markAsRead(row)
  }
}

async function markAsRead(row: any) {
  try {
    await request.post(`/notifications/${row.id}/mark_read/`)
    row.is_read = true
    row.read_at = new Date().toISOString()
  } catch {
    // 静默失败，不影响详情展示
  }
}

function closeDetail() {
  showDetail.value = false
  detailItem.value = null
}

async function toggleRead(row: any) {
  const newStatus = !row.is_read
  try {
    if (newStatus) {
      // 标记为已读使用专用端点
      await request.post(`/notifications/${row.id}/mark_read/`)
    } else {
      // 标记为未读直接 PATCH
      await request.patch(`/notifications/${row.id}/`, { is_read: false, read_at: null })
    }
    toast.show(newStatus ? '已标记为已读' : '已标记为未读', 'success')
    await fetchNotifications()
  } catch {
    toast.show('操作失败', 'error')
  }
}

async function deleteNotification(id: number) {
  if (!(await confirmStore.show('确认删除此通知？'))) return
  try {
    await request.delete(`/notifications/${id}/`)
    toast.show('通知已删除', 'success')
    await fetchNotifications()
  } catch {
    toast.show('删除失败', 'error')
  }
}

async function fetchNotifications() {
  try {
    const params: Record<string, any> = {
      page: page.value,
      page_size: pageSize.value,
    }
    if (projectStore.activeProjectId) {
      params.project = String(projectStore.activeProjectId)
    }
    const r = await request.get('/notifications/', { params })
    items.value = (r.data.results ?? r.data) as any[]
    total.value = r.data.count ?? items.value.length
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

// -------- 模板管理 --------
function openTemplateForm() {
  templateEditing.value = null
  templateForm.value = {}
  showTemplateForm.value = true
}
function editTemplate(t: any) {
  templateEditing.value = t
  templateForm.value = { code: t.code, title_template: t.title_template, content_template: t.content_template, description: t.description }
  showTemplateForm.value = true
}
async function saveTemplate() {
  const body = { ...templateForm.value }
  try {
    if (templateEditing.value) {
      await request.put(`/notification-templates/${templateEditing.value.id}/`, body)
      toast.show('模板已更新', 'success')
    } else {
      await request.post('/notification-templates/', body)
      toast.show('模板已创建', 'success')
    }
    showTemplateForm.value = false
    await fetchTemplates()
  } catch {
    toast.show('保存失败', 'error')
  }
}
async function deleteTemplate(id: number) {
  if (!(await confirmStore.show('确认删除此模板？'))) return
  try {
    await request.delete(`/notification-templates/${id}/`)
    toast.show('模板已删除', 'success')
    await fetchTemplates()
  } catch {
    toast.show('删除失败', 'error')
  }
}
async function fetchTemplates() {
  try {
    const r = await request.get('/notification-templates/', { params: { page: tplPage.value, page_size: tplPageSize.value } })
    templates.value = (r.data.results ?? r.data) as any[]
    tplTotal.value = r.data.count ?? templates.value.length
  } catch {
    // ignore
  }
}

watch(tab, (val) => {
  if (val === 'templates') fetchTemplates()
})

onMounted(() => {
  fetchNotifications()
})
</script>
