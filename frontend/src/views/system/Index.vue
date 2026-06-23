<template>
  <div>
    <h1 class="text-xl font-bold mb-4">系统管理</h1>
    <div class="flex gap-2 items-center mb-4">
      <button v-for="t in tabsFiltered()" :key="t.k" class="px-3 py-1.5 rounded-lg text-sm transition"
        :class="tab===t.k?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'"
        @click="tab=t.k">{{ t.l }}</button>
      <div class="flex-1"></div>
      <button v-if="tab==='users'" @click="openCreate" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建用户</button>
      <button v-if="tab==='backup'" @click="createBackup" :disabled="backupLoading"
        class="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">
        {{ backupLoading ? '备份中...' : '+ 创建备份' }}
      </button>
    </div>

    <div v-if="tab==='users'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
              <th v-for="c in cols" :key="c.k" class="text-left py-3 px-3 font-medium">{{ c.t }}</th>
              <th class="text-right py-3 px-3 font-medium w-60 whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td v-for="c in cols" :key="c.k" class="py-3 px-3 whitespace-nowrap">
                <span v-if="c.k==='is_superuser'" class="px-2 py-0.5 rounded text-xs" :class="r.is_superuser ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'">{{ r.is_superuser ? '管理员' : '用户' }}</span>
                <span v-else>{{ r[c.k] ?? '' }}</span>
              </td>
              <td class="py-3 px-3 whitespace-nowrap">
                <div class="flex gap-1 whitespace-nowrap">
                  <button @click="editItem(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition">编辑</button>
                  <button @click="changePwd(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition">修改密码</button>
                  <button v-if="isAdmin" @click="resetPwd(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 transition">重置密码</button>
                  <button v-if="isAdmin && r.id !== currentUserId" @click="deleteItem(r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td :colspan="cols.length + 1" class="py-16 text-center text-slate-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <span class="text-sm">暂无数据</span>
              </td>
            </tr>
          </tbody></table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; fetchData()" @update:page-size="pageSize=$event; page=1; fetchData()" />
    </div>

    <!-- 数据备份 -->
    <div v-if="tab==='backup'">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                <th class="text-left py-3 px-3 font-medium whitespace-nowrap">备份文件名</th>
                <th class="text-left py-3 px-3 font-medium whitespace-nowrap">文件大小</th>
                <th class="text-left py-3 px-3 font-medium whitespace-nowrap">备份日期</th>
                <th class="text-left py-3 px-3 font-medium">备份内容</th>
                <th class="text-right py-3 px-3 font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="backupItems.length === 0">
                <td colspan="5" class="py-16 text-center text-slate-400">
                  <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  <span class="text-sm">暂无备份</span>
                </td>
              </tr>
              <tr v-for="b in backupItems" :key="b.filename" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                <td class="py-3 px-3 font-medium whitespace-nowrap">{{ b.filename }}</td>
                <td class="py-3 px-3 whitespace-nowrap text-slate-500">{{ formatSize(b.file_size) }}</td>
                <td class="py-3 px-3 whitespace-nowrap text-slate-500">{{ formatTime(b.created_at) }}</td>
                <td class="py-3 px-3 text-xs text-slate-500 max-w-xs truncate">
                  {{ b.total_tables }} 张表，{{ b.total_records }} 条记录
                </td>
                <td class="py-3 px-3 whitespace-nowrap text-right">
                  <div class="flex gap-1 justify-end whitespace-nowrap">
                    <button @click="previewBackup(b)" class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-400">预览</button>
                    <button @click="viewBackupDetail(b)" class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                    <button @click="restoreBackup(b)" class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">恢复</button>
                    <button @click="deleteBackup(b)" class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 备份详情弹窗 -->
      <div v-if="backupDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="backupDetail = null">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">备份详情</h2>
            <button @click="backupDetail = null" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-lg">✕</button>
          </div>
          <div class="mb-4 text-sm space-y-1">
            <div><span class="text-slate-400 text-xs">文件名：</span><span class="font-medium break-all">{{ backupDetail.filename }}</span></div>
            <div class="flex gap-4">
              <span><span class="text-slate-400 text-xs">大小：</span>{{ formatSize(backupDetail.file_size) }}</span>
              <span><span class="text-slate-400 text-xs">时间：</span>{{ formatTime(backupDetail.created_at) }}</span>
            </div>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs">
                <th class="text-left py-2 px-3 font-medium">数据表</th>
                <th class="text-right py-2 px-3 font-medium w-20">记录数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in detailPageItems" :key="item.k" class="border-b border-slate-100 dark:border-slate-700/50 text-xs">
                <td class="py-2 px-3 text-slate-600 dark:text-slate-300">{{ item.k }}</td>
                <td class="py-2 px-3 text-right text-slate-500">{{ item.v }}</td>
              </tr>
            </tbody>
          </table>
          <!-- 分页 -->
          <div v-if="detailTotalPages > 1" class="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
            <button @click="detailPage--" :disabled="detailPage <= 1" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-30">&lt;</button>
            <span>第 {{ detailPage }} / {{ detailTotalPages }} 页（共 {{ detailTotalRecords }} 条）</span>
            <button @click="detailPage++" :disabled="detailPage >= detailTotalPages" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-30">&gt;</button>
          </div>
          <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button @click="backupDetail = null" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">关闭</button>
          </div>
        </div>
      </div>

      <!-- 备份预览弹窗 -->
      <div v-if="previewContent" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="previewContent = null">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl mx-4 p-6 overflow-hidden" style="max-height:85vh;">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">备份文件预览</h2>
            <button @click="previewContent = null" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-lg">✕</button>
          </div>
          <pre class="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-xs text-slate-600 dark:text-slate-300" style="height:calc(85vh - 120px); overflow:auto; white-space:pre; font-family:'SF Mono',Monaco,'Cascadia Code',monospace;">{{ previewContent }}</pre>
        </div>
      </div>
    </div>

    <!-- 新建/编辑用户弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ editing ? '编辑用户' : '新建用户' }}</h2>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm font-medium mb-1">用户名 *</label><input v-model="form.username" :disabled="editing" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" /></div>
            <div><label class="block text-sm font-medium mb-1">姓名 *</label><input v-model="form.real_name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" @input="onNameInput" /></div>
          </div>
          <div><label class="block text-sm font-medium mb-1">邮箱</label><input v-model="form.email" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm font-medium mb-1">部门</label><input v-model="form.department" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
            <div><label class="block text-sm font-medium mb-1">职位</label><input v-model="form.position" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
          </div>
          <!-- 新建时才显示密码和类型 -->
          <template v-if="!editing">
            <div><label class="block text-sm font-medium mb-1">用户类型</label>
              <select v-model="form.user_type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option value="user">用户</option><option value="admin">管理员</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium mb-1">密码 *（至少8位，含大小写字母和数字）</label><input v-model="form.password" type="password" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label class="block text-sm font-medium mb-1">确认密码 *</label><input v-model="form.password2" type="password" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </template>
          <p v-if="formError" class="text-red-500 text-sm">{{ formError }}</p>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveItem" :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- 密码弹窗 -->
    <div v-if="pwdDialog.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="pwdDialog.show=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ pwdDialog.mode === 'change' ? '修改密码' : '重置密码' }} - {{ pwdDialog.username }}</h2>
        <div class="space-y-3">
          <div v-if="pwdDialog.mode==='change'"><label class="block text-sm font-medium mb-1">旧密码</label><input v-model="pwdForm.old_password" type="password" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label class="block text-sm font-medium mb-1">新密码（至少8位，含大小写字母和数字）</label><input v-model="pwdForm.new_password" type="password" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label class="block text-sm font-medium mb-1">确认新密码</label><input v-model="pwdForm.new_password2" type="password" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <p v-if="pwdError" class="text-red-500 text-sm">{{ pwdError }}</p>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="pwdDialog.show=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="submitPwd" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">确认{{ pwdDialog.mode === 'change' ? '修改' : '重置' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useConfirmStore } from '@/stores/confirm'
import Pagination from '@/components/Pagination.vue'
const confirm = useConfirmStore()


// ── API helper ──
const api = async (url: string, opts: any = {}): Promise<Response> => {
  const token = sessionStorage.getItem('pmos-token')
  const headers: Record<string,string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  if (opts.headers) Object.assign(headers, opts.headers)
  return fetch(url, { ...opts, headers })
}

// ── State ──
const tab = ref('users')
const search = ref('')
const items = ref<any[]>([])
const showForm = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const editing = ref<any>(null)
const saving = ref(false)
const formError = ref('')
const currentUserId = ref<number|null>(null)
const isAdmin = ref(false)
const backupLoading = ref(false)
const backupItems = ref<any[]>([])
const backupDetail = ref<any>(null)
const previewContent = ref<string | null>(null)
const detailPage = ref(1)
const PAGE_SIZE = 10

const detailEntries = computed(() => {
  if (!backupDetail.value?.summary) return []
  return Object.entries(backupDetail.value.summary).map(([k, v]) => ({ k, v }))
})
const detailTotalPages = computed(() => Math.ceil(detailEntries.value.length / PAGE_SIZE))
const detailTotalRecords = computed(() => backupDetail.value?.total_records || 0)
const detailPageItems = computed(() => {
  const start = (detailPage.value - 1) * PAGE_SIZE
  return detailEntries.value.slice(start, start + PAGE_SIZE)
})

const form = ref<Record<string,any>>({})

const tabs = [
  { k: 'users', l: '用户管理', e: 'users', cols: [
    { k: 'username', t: '用户名' }, { k: 'real_name', t: '姓名' },
    { k: 'email', t: '邮箱' }, { k: 'department', t: '部门' },
    { k: 'position', t: '职位' }, { k: 'is_superuser', t: '类型' },
  ]},
  { k: 'backup', l: '数据备份', e: '', cols: [] },
]

const cur = computed(() => tabs.find(t => t.k === tab.value))
const cols = computed(() => cur.value?.cols || [])

// ── Data ──
async function fetchData() { await load() }

async function load() {
  if (!cur.value) return
  try {
    let url = '/api/v1/' + cur.value.e + '/?page=' + page.value + '&page_size=' + pageSize.value
    if (cur.value.e === 'users') url += '&ordering=username'
    if (search.value) url += '&search=' + encodeURIComponent(search.value)
    const r = await api(url)
    const d = await r.json()
    items.value = d.results ?? []
    total.value = d.count ?? items.value.length
  } catch { items.value = [] }
}

// ── Create / Edit ──
function openCreate() {
  editing.value = null
  form.value = { username: '', real_name: '', email: '', department: '', position: '', user_type: 'user', password: '', password2: '' }
  formError.value = ''
  showForm.value = true
}

function onNameInput() {
  if (editing.value) return
  const name = form.value.real_name?.trim()
  if (!name) return
  clearTimeout((window as any)._nameTimer)
  ;(window as any)._nameTimer = setTimeout(async () => {
    try {
      const r = await api('/api/v1/users/generate_username/?name=' + encodeURIComponent(name))
      const d = await r.json()
      if (d.username) {
        if (!form.value.username) form.value.username = d.username
        if (!form.value.email) form.value.email = d.email || d.username + '@pmos.com'
      }
    } catch {}
  }, 500)
}

function editItem(r: any) {
  editing.value = r
  form.value = { username: r.username, real_name: r.real_name, email: r.email || '', department: r.department || '', position: r.position || '' }
  formError.value = ''
  showForm.value = true
}

async function saveItem() {
  formError.value = ''
  saving.value = true
  try {
    if (editing.value) {
      await api('/api/v1/users/' + editing.value.id + '/', {
        method: 'PATCH', body: JSON.stringify(form.value),
      })
    } else {
      if (!form.value.password || !form.value.password2) { formError.value = '请输入密码'; saving.value = false; return }
      if (form.value.password !== form.value.password2) { formError.value = '两次输入的密码不一致'; saving.value = false; return }
      await api('/api/v1/users/', {
        method: 'POST', body: JSON.stringify(form.value),
      })
    }
    showForm.value = false
    load()
  } catch (e: any) {
    try { const d = await e.json?.(); formError.value = d?.detail || JSON.stringify(d) || '保存失败' } catch { formError.value = '保存失败' }
  }
  finally { saving.value = false }
}

async function deleteItem(id: number) {
  if (!(await confirm.show('确认删除此用户？'))) return
  try { await api('/api/v1/users/' + id + '/', { method: 'DELETE' }); load() } catch {}
}

function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i]
}
function formatTime(t: string): string {
  if (!t) return '—'
  try {
    const d = new Date(t)
    const pad2 = (n: number) => String(n).padStart(2, '0')
    const pad3 = (n: number) => String(n).padStart(3, '0')
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}.${pad3(d.getMilliseconds())}`
  } catch { return t }
}

async function loadBackups() {
  try {
    const r = await api('/api/v1/system/backup/')
    if (r.ok) backupItems.value = await r.json()
  } catch {}
}

async function createBackup() {
  backupLoading.value = true
  try {
    const r = await api('/api/v1/system/backup/', { method: 'POST' })
    if (r.ok) { await loadBackups() }
    else { alert('创建备份失败') }
  } catch { alert('创建备份失败') }
  finally { backupLoading.value = false }
}

async function viewBackupDetail(b: any) {
  try {
    const r = await api('/api/v1/system/backup/' + encodeURIComponent(b.filename) + '/')
    if (r.ok) backupDetail.value = await r.json()
  } catch {}
}

async function restoreBackup(b: any) {
  if (!(await confirm.show('确认从该备份恢复数据？将覆盖当前数据！'))) return
  try {
    const r = await api('/api/v1/system/backup/' + encodeURIComponent(b.filename) + '/', { method: 'POST' })
    if (r.ok) { alert('数据恢复成功'); await loadBackups() }
    else { alert('恢复失败') }
  } catch { alert('恢复失败') }
}

async function deleteBackup(b: any) {
  if (!(await confirm.show('确认删除此备份文件？'))) return
  try {
    const r = await api('/api/v1/system/backup/' + encodeURIComponent(b.filename) + '/', { method: 'DELETE' })
    if (r.ok) await loadBackups()
  } catch {}
}

async function previewBackup(b: any) {
  try {
    const r = await api('/api/v1/system/backup/' + encodeURIComponent(b.filename) + '/?raw=true')
    if (r.ok) {
      previewContent.value = await r.text()
    } else {
      previewContent.value = '无法读取备份文件'
    }
  } catch {
    previewContent.value = '加载失败'
  }
}

function tabsFiltered() {
  return tabs.filter(t => t.k !== 'backup' || isAdmin.value)
}

// ── Password dialogs ──
const pwdDialog = ref({ show: false, mode: 'change', userId: null as number|null, username: '' })
const pwdError = ref('')
const pwdForm = ref({ old_password: '', new_password: '', new_password2: '' })

function changePwd(r: any) {
  pwdForm.value = { old_password: '', new_password: '', new_password2: '' }
  pwdError.value = ''
  pwdDialog.value = { show: true, mode: 'change', userId: r.id, username: r.real_name || r.username }
}
function resetPwd(r: any) {
  pwdForm.value = { old_password: '', new_password: '', new_password2: '' }
  pwdError.value = ''
  pwdDialog.value = { show: true, mode: 'reset', userId: r.id, username: r.real_name || r.username }
}
async function submitPwd() {
  pwdError.value = ''
  if (pwdForm.value.new_password !== pwdForm.value.new_password2) {
    pwdError.value = '两次输入的新密码不一致'; return
  }
  try {
    const ep = pwdDialog.value.mode === 'change' ? 'change_password' : 'reset_password'
    const body: any = { new_password: pwdForm.value.new_password }
    if (pwdDialog.value.mode === 'change') body.old_password = pwdForm.value.old_password
    const r = await api('/api/v1/users/' + pwdDialog.value.userId + '/' + ep + '/', {
      method: 'POST', body: JSON.stringify(body),
    })
    const d = await r.json()
    if (!r.ok) { pwdError.value = d.detail || '操作失败'; return }
    pwdDialog.value.show = false
  } catch { pwdError.value = '网络错误' }
}

watch(tab, () => { search.value = ''; load() })

onMounted(async () => {
  try {
    const r = await api('/api/v1/users/me/')
    const u = await r.json()
    currentUserId.value = u.id
    isAdmin.value = u.is_superuser
  } catch {}
  load()
  loadBackups()
})
</script>
