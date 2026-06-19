<template>
  <div>
    <h1 class="text-xl font-bold mb-4">系统管理</h1>
    <div class="flex gap-2 mb-4">
      <button v-for="t in tabs" :key="t.k" class="px-3 py-1.5 rounded-lg text-sm transition"
        :class="tab===t.k?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'"
        @click="tab=t.k">{{ t.l }}</button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div v-if="tab==='users'" class="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 items-center justify-between">
        <input v-model="search" placeholder="搜索用户名/姓名..." class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none w-60" @input="load" />
        <button @click="openCreate" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建用户</button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
              <th v-for="c in cols" :key="c.k" class="text-left py-3 px-3 font-medium">{{ c.t }}</th>
              <th class="text-left py-3 px-3 font-medium w-48">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td v-for="c in cols" :key="c.k" class="py-3 px-3">
                <span v-if="c.k==='is_superuser'" class="px-2 py-0.5 rounded text-xs" :class="r.is_superuser ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'">{{ r.is_superuser ? '管理员' : '用户' }}</span>
                <span v-else>{{ r[c.k] ?? '' }}</span>
              </td>
              <td class="py-3 px-3">
                <div class="flex flex-wrap gap-1.5">
                  <button @click="editItem(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition">编辑</button>
                  <button @click="changePwd(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition">修改密码</button>
                  <button v-if="isAdmin" @click="resetPwd(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 transition">重置密码</button>
                  <button v-if="isAdmin && r.id !== currentUserId" @click="deleteItem(r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition">删除</button>
                </div>
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

    <!-- 新建/编辑用户弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ editing ? '编辑用户' : '新建用户' }}</h2>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm font-medium mb-1">用户名 *</label><input v-model="form.username" :disabled="editing" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" /></div>
            <div><label class="block text-sm font-medium mb-1">姓名 *</label><input v-model="form.real_name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
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

    <!-- 修改密码弹窗 -->
    <PasswordDialog ref="pwdDialog" @done="fetchData" />
  
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
const editing = ref<any>(null)
const saving = ref(false)
const formError = ref('')
const currentUserId = ref<number|null>(null)
const isAdmin = ref(false)

const form = ref<Record<string,any>>({})

const tabs = [
  { k: 'users', l: '用户管理', e: 'users', cols: [
    { k: 'username', t: '用户名' }, { k: 'real_name', t: '姓名' },
    { k: 'email', t: '邮箱' }, { k: 'department', t: '部门' },
    { k: 'position', t: '职位' }, { k: 'is_superuser', t: '类型' },
  ]},
  { k: 'roles', l: '角色管理', e: 'roles', cols: [
    { k: 'name', t: '角色' }, { k: 'code', t: '编码' }, { k: 'is_system', t: '内置' },
  ]},
]

const cur = computed(() => tabs.find(t => t.k === tab.value))
const cols = computed(() => cur.value?.cols || [])

// ── Data ──
async function fetchData() { await load() }

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

// ── Create / Edit ──
function openCreate() {
  editing.value = null
  form.value = { username: '', real_name: '', email: '', department: '', position: '', user_type: 'user', password: '', password2: '' }
  formError.value = ''
  showForm.value = true
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
  if (!confirm('确认删除此用户？')) return
  try { await api('/api/v1/users/' + id + '/', { method: 'DELETE' }); load() } catch {}
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
})
</script>
