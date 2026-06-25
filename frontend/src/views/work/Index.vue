<template>
  <div>
    <h1 class="text-xl font-bold mb-4">工作管理</h1>
    <div class="flex gap-2 mb-4">
      <button v-for="t in tabs" :key="t.k" :class="tab===t.k?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab=t.k">{{ t.l }}</button>
      <div class="flex-1"></div>
      <button @click="openForm" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新增{{ cur?.l || '' }}</button>
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th v-for="c in cols" :key="c.k" class="text-left py-3 px-3 font-medium">{{ c.t }}</th>
          <th class="text-right py-3 px-3 font-medium w-24">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td v-for="c in cols" :key="c.k" class="py-3 px-3 whitespace-nowrap">
              <span v-if="c.k==='type' && tab==='equipment'">{{ typeLabels[r.type] || r.type }}</span>
              <span v-else-if="c.k==='type' && tab==='leave'">{{ leaveTypeLabels[r.type] || r.type }}</span>
              <span v-else-if="c.k==='status' && tab==='equipment'">{{ statusLabels[r.status] || r.status }}</span>
              <span v-else-if="c.k==='status' && tab==='leave'">
                <span class="px-2 py-0.5 rounded text-xs font-medium" :class="{'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400':r.status==='pending','bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':r.status==='approved','bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':r.status==='rejected'}">{{ leaveStatusLabels[r.status] || r.status }}</span>
                <span v-if="r.status==='approved' && r.end_date && new Date(r.end_date) < new Date() && !r.is_cancelled" class="ml-1 text-xs text-red-500 font-medium">⚠逾期未销假</span>
              </span>
              <span v-else-if="c.k==='type' && tab==='timesheet'">{{ timesheetTypeLabels[r.type] || r.type }}</span>
              <span v-else-if="c.k==='status' && tab==='timesheet'">{{ timesheetStatusLabels[r.status] || r.status }}</span>
              <span v-else-if="c.k==='approval_status' && tab==='timesheet'">
                <span class="px-2 py-0.5 rounded text-xs font-medium" :class="{'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':r.approval_status==='approved','bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400':r.approval_status==='returned','bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':r.approval_status==='rejected'}">{{ timesheetApprovalLabels[r.approval_status] || r.approval_status }}</span>
              </span>
              <span v-else-if="c.k==='is_cancelled' && tab==='leave'">
                <span :class="r.is_cancelled?'text-green-600':'text-slate-400'">{{ r.is_cancelled ? '已销假' : '未销假' }}</span>
              </span>
              <span v-else-if="c.k==='start_date' || c.k==='end_date'">{{ r[c.k]?.slice(0,16).replace('T',' ') || '—' }}</span>
              <span v-else>{{ r[c.k] ?? '' }}</span>
            </td>
            <td class="py-3 px-3 whitespace-nowrap text-right">
                <div class="flex gap-1 justify-end whitespace-nowrap">
              <button v-if="tab==='leave' && r.status==='approved' && !r.is_cancelled" @click="cancelLeave(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400">销假</button>
              <button @click="openDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
              <button @click="editItem(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
              <button @click="deleteItem(r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
                            </div>
</td>
          </tr>
                  <tr v-if="items.length === 0">
              <td colspan="6" class="py-16 text-center text-slate-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <span class="text-sm">暂无数据</span>
              </td>
            </tr>
</tbody></table>
        
      </div>
      <Pagination :page="page" :page-size="listPageSize" :total="total" @update:page="page=$event; load()" @update:page-size="listPageSize=$event; page=1; load()" />
    </div>
    <!-- 详情弹窗 -->
    <div v-if="showDetail && detailItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showDetail=false">
      <div class="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold">{{ cur?.l || '' }}详情</h2>
          <button @click="showDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="space-y-4 text-sm">
          <div v-for="c in cols" :key="c.k">
            <span class="text-slate-400 block text-xs">{{ c.t }}</span>
            <span v-if="c.k==='type' && tab==='equipment'">{{ typeLabels[detailItem.type] || detailItem.type }}</span>
            <span v-else-if="c.k==='type' && tab==='leave'">{{ leaveTypeLabels[detailItem.type] || detailItem.type }}</span>
            <span v-else-if="c.k==='type' && tab==='timesheet'">{{ timesheetTypeLabels[detailItem.type] || detailItem.type }}</span>
            <span v-else-if="c.k==='status' && tab==='equipment'">{{ statusLabels[detailItem.status] || detailItem.status }}</span>
            <span v-else-if="c.k==='status' && tab==='leave'">{{ leaveStatusLabels[detailItem.status] || detailItem.status }}</span>
            <span v-else-if="c.k==='status' && tab==='timesheet'">{{ timesheetStatusLabels[detailItem.status] || detailItem.status }}</span>
            <span v-else-if="c.k==='approval_status' && tab==='timesheet'">{{ timesheetApprovalLabels[detailItem.approval_status] || detailItem.approval_status }}</span>
            <span v-else-if="c.k==='is_cancelled' && tab==='leave'"><span :class="detailItem.is_cancelled?'text-green-600':'text-slate-400'">{{ detailItem.is_cancelled ? '已销假' : '未销假' }}</span></span>
            <span v-else-if="c.k==='start_date' || c.k==='end_date'">{{ detailItem[c.k]?.slice(0,16).replace('T',' ') || '—' }}</span>
            <span v-else>{{ detailItem[c.k] ?? '—' }}</span>
          </div>
        </div>
        <div v-if="tab==='timesheet'" class="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
          <h3 class="text-sm font-semibold text-slate-500 mb-2">工时明细 <span class="text-xs text-slate-400 font-normal">(共{{ timesheetDetailTotal }}条)</span></h3>
          <table class="w-full text-xs">
            <thead><tr class="text-slate-400"><th class="text-left py-1">日期</th><th class="text-left py-1">工时类型</th><th class="text-left py-1">工时</th></tr></thead>
            <tbody>
              <tr v-for="d in timesheetDetails" :key="d.id" class="border-t border-slate-100">
                <td class="py-1">{{ d.date }}</td>
                <td class="py-1">{{ timesheetTypeLabels[d.type] || d.type }}</td>
                <td class="py-1">{{ d.hours }}</td>
              </tr>
              <tr v-if="!timesheetDetails.length"><td colspan="3" class="py-4 text-center text-slate-400 text-xs">暂无数据</td></tr>
            </tbody>
          </table>
          <div v-if="timesheetDetailTotal > pageSize" class="flex items-center justify-center gap-2 mt-2">
            <button @click="timesheetDetailPage--; loadTimesheetDetails()" :disabled="timesheetDetailPage<=1" class="px-2 py-0.5 rounded text-xs border border-slate-300 disabled:opacity-30">上一页</button>
            <span class="text-xs text-slate-500">{{ timesheetDetailPage }} / {{ Math.ceil(timesheetDetailTotal / pageSize) }}</span>
            <button @click="timesheetDetailPage++; loadTimesheetDetails()" :disabled="timesheetDetailPage >= Math.ceil(timesheetDetailTotal / pageSize)" class="px-2 py-0.5 rounded text-xs border border-slate-300 disabled:opacity-30">下一页</button>
          </div>
        </div>
        <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showDetail=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">关闭</button>
        </div>
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ editing ? '编辑' : '新增' }}{{ cur?.l || '' }}</h2>
        <div class="space-y-3">
          <div v-for="f in curFields" :key="f.k">
            <label class="block text-sm font-medium mb-1">{{ f.t }}</label>

            <!-- Switch -->
            <label v-if="f.type==='switch'" class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form[f.k]" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              <span class="ml-2 text-sm text-slate-600 dark:text-slate-300">{{ form[f.k] ? '已销假' : '未销假' }}</span>
            </label>

            <!-- Select with static options -->
            <select v-model="form[f.k]" v-else-if="f.type==='select' && Array.isArray(f.options)" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="o in f.options" :key="o.v" :value="o.v">{{ o.t }}</option>
            </select>

            <!-- Select from org members -->
            <select v-model="form[f.k]" v-else-if="f.type==='select' && f.options==='org-members'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="o in orgMembers" :key="o.id" :value="o.id">{{ memberLabel(o) }}</option>
            </select>

            <!-- Select from org approvers (director/manager) -->
            <select v-model="form[f.k]" v-else-if="f.type==='select' && f.options==='org-approvers'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="o in orgApprovers" :key="o.id" :value="o.id">{{ memberLabel(o) }}</option>
            </select>

            <!-- Datetime-local input -->
            <input v-model="form[f.k]" v-else-if="f.type==='datetime-local'" type="datetime-local" @focus="($event.target as HTMLInputElement).showPicker?.()" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />

            <!-- Date input -->
            <SmartDateInput v-model="form[f.k]" v-else-if="f.type==='date'" class="w-full" />

            <!-- Number -->
            <input v-model="form[f.k]" v-else-if="f.type==='number'" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />

            <!-- Textarea -->
            <textarea v-model="form[f.k]" v-else-if="f.type==='textarea'" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea>

            <!-- Text input -->
            <input v-else v-model="form[f.k]" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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
import { useProjectStore } from '@/stores/project'
import { useConfirmStore } from '@/stores/confirm'
import { useToastStore } from '@/stores/toast'
import SmartDateInput from '@/components/SmartDateInput.vue'
import request from '@/api/request'

import { getEquipments, createEquipment, updateEquipment, deleteEquipment,
  getLeaves, createLeave, updateLeave, deleteLeave,
  getTimesheets, createTimesheet } from '@/api/modules/work_management'
import Pagination from '@/components/Pagination.vue'
const confirm = useConfirmStore()
const projectStore = useProjectStore()
const toast = useToastStore()
const tab = ref('equipment')
const items = ref<any[]>([])
const showForm = ref(false)
const page = ref(1)
const listPageSize = ref(10)
const total = ref(0)
const form = ref<Record<string,any>>({})


import { memberLabel } from '@/composables/useMemberLabel'

const orgMembers = ref<any[]>([])
const showDetail = ref(false)
const detailItem = ref<any>(null)
const editing = ref<any>(null)

const typeLabels: Record<string,string> = { server:'服务器', computer:'计算机', printer:'打印机', storage:'移动存储', consumable:'耗材', other:'其他' }
const leaveTypeLabels: Record<string,string> = { personal:'事假', sick:'病假', annual:'年假', marriage:'婚假', funeral:'丧假', paternity:'陪产假', compensatory:'调休假', family_visit:'探亲假', other:'其他' }
const timesheetTypeLabels: Record<string,string> = { workday:'工作日', holiday:'节假日', overtime:'加班', leave:'请假' }
const timesheetStatusLabels: Record<string,string> = { normal:'正常', abnormal:'异常' }
const timesheetApprovalLabels: Record<string,string> = { approved:'同意', returned:'退回', rejected:'拒绝' }
const leaveStatusLabels: Record<string,string> = { pending:'待审批', approved:'已批准', rejected:'已驳回' }
const statusLabels: Record<string,string> = { not_issued:'未出库', in_use:'使用中', recycled:'已回收', scrapped:'已报废', other:'其他' }

const tabs = [
  { k:'equipment', l:'设备管理', e:'equipments', cols:[{k:'type',t:'设备类型'},{k:'specs',t:'规格'},{k:'quantity',t:'数量'},{k:'status',t:'状态'}], fields:[{k:'type',t:'设备类型',type:'select',options:[{v:'server',t:'服务器'},{v:'computer',t:'计算机'},{v:'printer',t:'打印机'},{v:'storage',t:'移动存储'},{v:'consumable',t:'耗材'},{v:'other',t:'其他'}]},{k:'specs',t:'设备规格'},{k:'quantity',t:'设备数量',type:'number'},{k:'status',t:'设备状态',type:'select',options:[{v:'not_issued',t:'未出库'},{v:'in_use',t:'使用中'},{v:'recycled',t:'已回收'},{v:'scrapped',t:'已报废'},{v:'other',t:'其他'}]},{k:'notes',t:'备注说明',type:'textarea'}] },
  { k:'leave', l:'请假管理', e:'leaves',
    cols:[
      {k:'applicant_name',t:'申请人'},{k:'type',t:'类型'},{k:'start_date',t:'开始日期'},{k:'end_date',t:'结束日期'},{k:'status',t:'审批状态'},{k:'is_cancelled',t:'销假'}
    ],
    fields:[
      {k:'applicant',t:'申请人',type:'select',options:'org-members'},
      {k:'type',t:'请假类型',type:'select',options:[{v:'personal',t:'事假'},{v:'sick',t:'病假'},{v:'annual',t:'年假'},{v:'marriage',t:'婚假'},{v:'funeral',t:'丧假'},{v:'paternity',t:'陪产假'},{v:'compensatory',t:'调休假'},{v:'family_visit',t:'探亲假'},{v:'other',t:'其他'}]},
      {k:'start_date',t:'开始日期',type:'date'},
      {k:'end_date',t:'结束日期',type:'date'},
      {k:'status',t:'审批状态',type:'select',options:[{v:'pending',t:'待审批'},{v:'approved',t:'已批准'},{v:'rejected',t:'已驳回'}]},
      {k:'approver',t:'审批人',type:'select',options:'org-approvers'},
      {k:'is_cancelled',t:'销假状态',type:'switch'},
      {k:'notes',t:'备注说明',type:'textarea'},
    ] },
  { k:'timesheet', l:'工时管理', e:'timesheets',
    cols:[{k:'reporter_name',t:'填报人'},{k:'start_date',t:'开始日期'},{k:'end_date',t:'结束日期'},{k:'type',t:'工时类型'},{k:'status',t:'工时状态'},{k:'approval_status',t:'审批状态'}],
    fields:[
      {k:'reporter',t:'填报人',type:'select',options:'org-members'},
      {k:'start_date',t:'开始日期',type:'date'},
      {k:'end_date',t:'结束日期',type:'date'},
      {k:'type',t:'工时类型',type:'select',options:[{v:'workday',t:'工作日'},{v:'holiday',t:'节假日'},{v:'overtime',t:'加班'},{v:'leave',t:'请假'}]},
      {k:'status',t:'工时状态',type:'select',options:[{v:'normal',t:'正常'},{v:'abnormal',t:'异常'}]},
      {k:'approval_status',t:'审批状态',type:'select',options:[{v:'approved',t:'同意'},{v:'returned',t:'退回'},{v:'rejected',t:'拒绝'}]},
      {k:'approver',t:'审批人',type:'select',options:'org-approvers'},
    ] },
]
const cur = computed(() => tabs.find(t => t.k === tab.value))
const cols = computed(() => cur.value?.cols || [])
const curFields = computed(() => cur.value?.fields || [])

async function load() {
  if (!cur.value) return
  try {
    const params = { page: page.value, page_size: listPageSize.value, project: projectStore.activeProjectId || undefined }
    let r
    if (tab.value === 'equipment') r = await getEquipments(params)
    else if (tab.value === 'leave') r = await getLeaves(params)
    else if (tab.value === 'timesheet') r = await getTimesheets(params)
    else return
    items.value = (r.data.results ?? r.data) as any[]
    total.value = (r as any).data.count ?? items.value.length
  } catch { items.value = [] }
}
const orgApprovers = computed(() => orgMembers.value.filter(m => m.project_role === 'project_director' || m.project_role === 'project_manager'))

function openForm() {
  editing.value = null
  if (tab.value === 'leave') { loadOrgMembers(); form.value = { is_cancelled: false } }
  else if (tab.value === 'timesheet') {
    loadOrgMembers().then(() => {
      const pm = orgMembers.value.find(m => m.project_role === 'project_manager')
      form.value = { type: 'workday', status: 'normal', approval_status: 'approved', approver: pm?.id || '' }
    })
    form.value = { type: 'workday', status: 'normal', approval_status: 'approved' }
  }
  else { form.value = {} }
  showForm.value = true
}
function editItem(r: any) {
  editing.value = r
  form.value = { ...r }
  // 转换日期格式适配 datetime-local 输入：去掉秒和时区
  for (const k of ['start_date', 'end_date']) {
    if (form.value[k] && typeof form.value[k] === 'string') {
      form.value[k] = form.value[k].slice(0, 16)
    }
  }
  if (tab.value === 'leave') loadOrgMembers()
  if (tab.value === 'timesheet') loadOrgMembers()
  showForm.value = true
}
const timesheetDetails = ref<any[]>([])
const timesheetDetailTotal = ref(0)
const timesheetDetailPage = ref(1)
const pageSize = 10

async function loadTimesheetDetails() {
  if (!detailItem.value) return
  try {
    const resp = await request.get('/timesheet-details/', { params: { timesheet: detailItem.value.id, page: timesheetDetailPage.value, page_size: 10 } })
    timesheetDetails.value = resp.data.results ?? []
    timesheetDetailTotal.value = resp.data.count ?? timesheetDetails.value.length
  } catch { timesheetDetails.value = []; timesheetDetailTotal.value = 0 }
}

function openDetail(r: any) {
  detailItem.value = r; showDetail.value = true
  if (tab.value === 'timesheet') {
    timesheetDetailPage.value = 1
    loadTimesheetDetails()
  } else {
    timesheetDetails.value = []
  }
}
async function cancelLeave(r: any) {
  if (!(await confirm.show('确认销假？'))) return
  try { await request.patch('/' + cur.value!.e + '/' + r.id + '/', { is_cancelled: true }); load() } catch {}
}

async function loadOrgMembers() {
  try {
    const r = await request.get('/org-members/', { params: { page: page.value, page_size: listPageSize.value, project: projectStore.activeProjectId || undefined } })
    orgMembers.value = r.data.results ?? r.data ?? []
  } catch { orgMembers.value = [] }
}
async function saveItem() {
  const payload = { ...form.value, project: projectStore.activeProjectId }
  try {
    if (editing.value) {
      if (tab.value === 'equipment') await updateEquipment(editing.value.id, payload)
      else if (tab.value === 'leave') await updateLeave(editing.value.id, payload)
      else if (tab.value === 'timesheet') await createTimesheet(payload)
    } else {
      if (tab.value === 'equipment') await createEquipment(payload)
      else if (tab.value === 'leave') await createLeave(payload)
      else if (tab.value === 'timesheet') await createTimesheet(payload)
    }
    showForm.value = false; load()
  } catch(e: any) { toast.show('保存失败', 'error') }
}
async function deleteItem(id: number) {
  if (!(await confirm.show('确认删除？'))) return
  try {
    if (tab.value === 'equipment') await deleteEquipment(id)
    else if (tab.value === 'leave') await deleteLeave(id)
    // timesheet 不支持删除
    load()
  } catch {}
}
watch(tab, load)
onMounted(load)
</script>
