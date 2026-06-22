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
          <th class="text-right py-3 px-3 font-medium w-44">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td v-for="c in cols" :key="c.k" class="py-3 px-3">
              <span v-if="c.k==='is_active'" class="inline-flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full" :class="r[c.k]?'bg-green-500':'bg-red-400'"></span>
                <span class="text-xs" :class="r[c.k]?'text-green-600':'text-red-400'">{{ r[c.k]?'启用':'禁用' }}</span>
              </span>
              <span v-else-if="c.k==='comm_date'">{{ formatDate(r[c.k]) }}</span>
              <span v-else>{{ r[c.k] ?? '' }}</span>
            </td>
            <td class="py-3 px-3 text-right whitespace-nowrap">
              <button v-if="tab==='comm'" @click="openDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
              <button v-if="tab==='types'" @click="toggleActive(r)" class="px-2.5 py-1 rounded-full text-xs font-medium" :class="r.is_active?'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400':'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'">{{ r.is_active?'停用':'启用' }}</button>
              <button @click="editItem(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
              <button @click="deleteItem(r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
            </td>
          </tr>
        </tbody></table>
        
      </div>
    </div>
    <!-- 详情弹窗 -->
    <div v-if="showDetail && detailItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showDetail=false">
      <div class="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold">沟通记录详情</h2>
          <button @click="showDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="space-y-4 text-sm">
          <div><span class="text-slate-400 block text-xs">主题</span><span class="font-medium">{{ detailItem.subject }}</span></div>
          <div><span class="text-slate-400 block text-xs">沟通类型</span><span>{{ detailItem.comm_type_name || detailItem.comm_type }}</span></div>
          <div><span class="text-slate-400 block text-xs">沟通时间</span><span>{{ formatDate(detailItem.comm_date) }}</span></div>
          <div><span class="text-slate-400 block text-xs">时长(分钟)</span><span>{{ detailItem.duration_minutes || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs">地点</span><span>{{ detailItem.location || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs">发起人</span><span>{{ detailItem.initiator_name || detailItem.initiator || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs">干系人</span><span>{{ detailItem.participants_names ? (Array.isArray(detailItem.participants_names) ? detailItem.participants_names.join(', ') : detailItem.participants_names) : '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs">结论</span><span class="text-slate-600 dark:text-slate-300">{{ detailItem.conclusion || '—' }}</span></div>
          <div v-if="detailItem.attachments?.length">
            <span class="text-slate-400 block text-xs mb-1">附件</span>
            <a v-for="(a, ai) in detailItem.attachments" :key="ai" :href="a.url" target="_blank" class="block text-blue-600 hover:underline text-xs">{{ a.name }}</a>
          </div>
        </div>
        <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showDetail=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">关闭</button>
        </div>
      </div>
    </div>

    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ editing?'编辑':'新建' }} {{ tab==='comm'?'沟通记录':'类型' }}</h2>
        <div class="space-y-3">
          <div v-for="f in curFields" :key="f.k">
            <label class="block text-sm font-medium mb-1">{{ f.t }}</label>

            <!-- Switch -->
            <label v-if="f.type==='switch'" class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form[f.k]" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              <span class="ml-2 text-sm text-slate-600 dark:text-slate-300">{{ form[f.k] ? '已启用' : '已禁用' }}</span>
            </label>

            <!-- Select: comm-types / project-members -->
            <select v-model="form[f.k]" v-else-if="f.type==='select'" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="o in (f.optionEndpoint==='comm-types'?commTypes:(f.optionEndpoint==='project-members'?projectMembers:users))" :key="o.id" :value="o.id">{{ memberLabel(o) }}</option>
            </select>

            <!-- Multi-select (dropdown 风格) - project members -->
            <div v-else-if="f.type==='multi-select'" class="relative" data-picker>
              <div @click="showUserPicker=!showUserPicker" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm cursor-pointer flex flex-wrap gap-1 min-h-[38px]">
                <span v-if="!form[f.k]?.length" class="text-slate-400">请选择</span>
                <span v-for="uid in form[f.k]" :key="uid" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                  {{ (projectMembers.find(m=>m.id===uid) ? memberLabel(projectMembers.find(m=>m.id===uid)) : uid) }}
                </span>
              </div>
              <div v-if="showUserPicker" class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 shadow-lg p-2 space-y-1">
                <label v-for="o in projectMembers" :key="o.id" class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded">
                  <input type="checkbox" :value="o.id" v-model="form[f.k]" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
                  <span>{{ memberLabel(o) }}</span>
                </label>
              </div>
            </div>
            <!-- File upload -->
            <div v-else-if="f.type==='file'">
              <label class="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm text-slate-500">
                <input type="file" accept=".docx,.xlsx,.pptx,.pdf" multiple class="hidden" @change="uploadFile" />
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-3-3m3 3l3-3m-9 6h12"/></svg>
                {{ uploadLoading ? '上传中...' : '点击上传 (docx/xlsx/pptx/pdf)' }}
              </label>
              <div v-for="(a, ai) in uploadQueue" :key="ai" class="flex items-center justify-between mt-1 px-2 py-1 rounded bg-slate-50 dark:bg-slate-700/50 text-xs">
                <span class="truncate">{{ a.name }}</span>
                <button @click="removeFile(ai)" class="text-red-400 hover:text-red-600 ml-2 shrink-0">&times;</button>
              </div>
            </div>

            <!-- Datetime-local -->
            <input v-model="form[f.k]" v-else-if="f.type==='datetime-local'" type="datetime-local" @focus="e.target.showPicker?.()" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />

            <!-- Number input -->
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useConfirmStore } from '@/stores/confirm'
import { useToastStore } from '@/stores/toast'
import { useProjectStore } from '@/stores/project'
import request from '@/api/request'
const confirm = useConfirmStore()
const toast = useToastStore()
const projectStore = useProjectStore()
const tab = ref('comm')
const items = ref<any[]>([])
const showForm = ref(false)
const showDetail = ref(false)
const detailItem = ref<any>(null)
const editing = ref<any>(null)
const form = ref<Record<string,any>>({})
const commTypes = ref<any[]>([])

const projectMembers = ref<any[]>([])
const users = ref<any[]>([])
const uploadQueue = ref<{name:string;url:string}[]>([])

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

const showUserPicker = ref(false)
const uploadLoading = ref(false)

const views: Record<string,{e:string;cols:{k:string;t:string}[];fields:{k:string;t:string;type?:string}[]}> = {
  comm: { e:'comm-records',
    cols:[{k:'subject',t:'主题'},{k:'comm_type_name',t:'类型'},{k:'initiator_name',t:'发起人'},{k:'comm_date',t:'时间'},{k:'duration_minutes',t:'时长(分钟)'},{k:'location',t:'地点'}],
    fields:[
      {k:'subject',t:'主题'},
      {k:'comm_type',t:'沟通类型',type:'select',optionEndpoint:'comm-types'},
      {k:'comm_date',t:'沟通时间',type:'datetime-local'},
      {k:'duration_minutes',t:'沟通时长(分钟)',type:'number'},
      {k:'location',t:'地点'},
      {k:'initiator',t:'发起人',type:'select',optionEndpoint:'project-members'},
      {k:'participants',t:'干系人',type:'multi-select',optionEndpoint:'project-members'},
      {k:'conclusion',t:'结论',type:'textarea'},
      {k:'attachments',t:'附件',type:'file'},
    ] },
  types: { e:'comm-types', cols:[{k:'name',t:'类型名称'},{k:'description',t:'类型描述'},{k:'is_active',t:'启用'}], fields:[{k:'name',t:'类型名称'},{k:'description',t:'类型描述',type:'textarea'},{k:'is_active',t:'是否启用',type:'switch'}] },
}
const cur = computed(() => views[tab.value])
const cols = computed(() => cur.value?.cols || [])
const curFields = computed(() => cur.value?.fields || [])

async function load() {
  if (!cur.value) return
  try { const r = await request.get('/' + cur.value.e + '/', { params: { project: projectStore.activeProjectId || undefined } }); items.value = (r.data.results ?? r.data) as any[] } catch { items.value=[] }
}
function openForm() {
  if (tab.value === 'types') { editing.value=null; form.value={is_active:true}; showForm.value=true; return }
  // comm record form
  const now = new Date()
  // 向前取整到最近半小时
  const m = now.getMinutes()
  if (m < 30) now.setMinutes(0, 0, 0)
  else now.setMinutes(30, 0, 0)
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  editing.value=null
  form.value={comm_date: local, duration_minutes: 30, initiator: '', participants: [], attachments: []}
  projectMembers.value = []
  uploadQueue.value = []
  // 加载项目成员
  const pid = projectStore.activeProjectId
  if (pid) loadProjectMembers(pid)
  showForm.value=true
}
function editItem(r: any) {
  if (tab.value === 'types') {
    editing.value=r; form.value={...r, is_active: !!r.is_active}; showForm.value=true; return
  }
  editing.value=r
  const parts = r.comm_date?.slice(0, 16) || ''
  form.value={
    subject: r.subject,
    comm_type: r.comm_type,
    comm_date: parts,
    duration_minutes: r.duration_minutes || '',
    location: r.location || '',
    initiator: r.initiator || '',
    participants: r.participants || [],
    conclusion: r.conclusion || '',
    attachments: r.attachments || [],
  }
  uploadQueue.value = [...(r.attachments || [])]
  // 加载项目成员
  const pid = projectStore.activeProjectId
  if (pid) loadProjectMembers(pid)
  showForm.value=true
}
async function saveItem() {
  try {
    const payload = { ...form.value }
    if (tab.value === 'types') {
      if (!payload.name) { toast.show('请输入类型名称', 'error'); return }
      if (editing.value) { await request.patch('/' + cur.value!.e + '/' + editing.value.id + '/', payload) }
      else { await request.post('/' + cur.value!.e + '/', payload) }
    } else {
      if (!payload.subject) { toast.show('请输入主题', 'error'); return }
      if (!payload.comm_type) { toast.show('请选择沟通类型', 'error'); return }
      if (!payload.initiator) { toast.show('请选择发起人', 'error'); return }
      if (payload.participants && !Array.isArray(payload.participants)) {
        payload.participants = [payload.participants]
      }
      payload.project = projectStore.activeProjectId
      payload.attachments = uploadQueue.value
      if (editing.value) { await request.patch('/' + cur.value!.e + '/' + editing.value.id + '/', payload) }
      else { await request.post('/' + cur.value!.e + '/', payload) }
    }
    showForm.value=false; load()
  } catch(e: any) {
    const errData = e?.response?.data
    if (errData && typeof errData === 'object') {
      toast.show(Object.values(errData).flat().join('; '), 'error')
    } else {
      toast.show('保存失败', 'error')
    }
  }
}
async function toggleActive(r: any) {
  try { await request.patch('/' + cur.value!.e + '/' + r.id + '/', { is_active: !r.is_active }); load() } catch {}
}

async function deleteItem(id: number) {
  if(!(await confirm.show('确认删除？'))) return
  try { await request.delete('/' + cur.value!.e + '/' + id + '/'); load() } catch {}
}
function openDetail(r: any) { detailItem.value = r; showDetail.value = true }

async function uploadFile(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files.length) return
  uploadLoading.value = true
  try {
    for (const file of input.files) {
      const fd = new FormData()
      fd.append('file', file)
      const r = await request.post('/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      uploadQueue.value.push(r.data)
    }
    // 更新 form 的 attachments
    form.value.attachments = [...uploadQueue.value]
  } catch { toast.show('上传失败', 'error') }
  finally { uploadLoading.value = false; input.value = '' }
}

function removeFile(idx: number) {
  uploadQueue.value.splice(idx, 1)
  form.value.attachments = [...uploadQueue.value]
}

function formatDate(v: string) {
  if (!v) return '—'
  return v.slice(0, 16).replace('T', ' ')
}

// close user picker when clicking outside
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('[data-picker]')) showUserPicker.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

function loadProjectMembers(projectId: any) {
  if (!projectId) { projectMembers.value = []; return }
  request.get('/org-members/', { params: { project: projectId } }).then(r => { projectMembers.value = r.data.results ?? r.data ?? [] }).catch(() => { projectMembers.value = [] })
}

function loadOptions() {
  if (tab.value === 'comm') {
    request.get('/comm-types/', { params: { project: projectStore.activeProjectId || undefined } }).then(r => { commTypes.value = r.data.results ?? r.data ?? [] }).catch(() => {})
  }
}

watch(tab, () => { loadOptions(); load() })
onMounted(() => { loadOptions(); load() })
</script>
