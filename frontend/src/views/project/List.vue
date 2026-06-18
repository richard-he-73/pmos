<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <h1 class="text-xl font-bold">项目管理</h1>
      <button @click="openCreate" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition shrink-0">
        ＋ 新建项目
      </button>
    </div>

    <!-- 搜索/筛选栏 -->
    <div class="flex flex-wrap gap-2 mb-4">
      <input v-model="search" placeholder="搜索项目名称/编号..."
        class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm flex-1 min-w-[200px] outline-none focus:ring-2 focus:ring-blue-500"
        @input="onSearch" />
      <select v-model="statusFilter" @change="fetchData"
        class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none">
        <option value="">全部状态</option>
        <option value="planning">规划中</option>
        <option value="active">进行中</option>
        <option value="closed">已结束</option>
      </select>
    </div>

    <!-- 表格 -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div v-if="loading" class="text-center py-12 text-slate-400 text-sm">加载中...</div>
      <div v-else-if="items.length === 0" class="text-center py-12 text-slate-400 text-sm">暂无项目</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
              <th class="text-left py-3 px-4 font-medium">编号</th>
              <th class="text-left py-3 px-4 font-medium">名称</th>
              <th class="text-left py-3 px-4 font-medium hidden sm:table-cell">状态</th>
              <th class="text-left py-3 px-4 font-medium hidden md:table-cell">负责人</th>
              <th class="text-left py-3 px-4 font-medium hidden lg:table-cell">时间</th>
              <th class="text-right py-3 px-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in items" :key="p.id"
              class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">{{ p.code }}</td>
              <td class="py-3 px-4 font-medium cursor-pointer" @click="viewDetail(p)">{{ p.name }}</td>
              <td class="py-3 px-4 hidden sm:table-cell">
                <span class="px-2 py-0.5 rounded text-xs font-medium" :class="statusClass(p.status)">{{ statusText(p.status) }}</span>
              </td>
              <td class="py-3 px-4 hidden md:table-cell text-slate-500">{{ p.owner_name || '—' }}</td>
              <td class="py-3 px-4 hidden lg:table-cell text-slate-400 text-xs">{{ p.start_date || '—' }} ~ {{ p.end_date || '—' }}</td>
              <td class="py-3 px-4 text-right whitespace-nowrap">
                <button @click="openEdit(p)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs mr-3">编辑</button>
                <button @click="handleDelete(p)" class="text-red-500 hover:text-red-700 text-xs">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showForm = false">
      <div class="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
        <h2 class="text-lg font-bold mb-4">{{ isEdit ? '编辑项目' : '新建项目' }}</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">项目名称 *</label>
            <input v-model="form.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">项目编号 *</label>
            <input v-model="form.code" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">负责人</label>
            <select v-model="form.owner" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.real_name || u.username }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">开始日期</label>
              <input v-model="form.start_date" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">结束日期</label>
              <input v-model="form.end_date" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">描述</label>
            <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showForm = false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">取消</button>
          <button @click="handleSave" :disabled="saving" class="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">
            {{ saving ? '保存中...' : '保存' }}
          </button>
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
const statusFilter = ref('')
const showForm = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const users = ref<any[]>([])

const form = reactive({ name: '', code: '', owner: null as number | null, start_date: '', end_date: '', description: '' })

function statusClass(s: string) {
  return ({ planning: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20', active: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20', closed: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700' })[s] || ''
}
function statusText(s: string) { return ({ planning: '规划中', active: '进行中', closed: '已结束' })[s] || s }

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchData, 300)
}

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value
    const r = await getProjects(params)
    items.value = r.data.results || []
  } catch { items.value = [] }
  finally { loading.value = false }
}

function openCreate() {
  isEdit.value = false
  editingId.value = null
  form.name = ''; form.code = ''; form.owner = null; form.start_date = ''; form.end_date = ''; form.description = ''
  showForm.value = true
}

function openEdit(p: Project) {
  isEdit.value = true
  editingId.value = p.id
  form.name = p.name; form.code = p.code; form.owner = p.owner; form.start_date = p.start_date || ''; form.end_date = p.end_date || ''; form.description = p.description
  showForm.value = true
}

async function handleSave() {
  if (!form.name || !form.code) return
  saving.value = true
  try {
    if (isEdit.value && editingId.value) {
      await updateProject(editingId.value, form as any)
    } else {
      await createProject(form as any)
    }
    showForm.value = false
    fetchData()
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

async function handleDelete(p: Project) {
  if (!confirm(`确认删除项目「${p.name}」？此操作不可撤销。`)) return
  try { await deleteProject(p.id); fetchData() } catch {}
}

function viewDetail(p: Project) { router.push('/projects/' + p.id) }

onMounted(async () => {
  await fetchData()
  try { const r = await fetch('/api/v1/users/'); users.value = await r.json() } catch {}
})
</script>
