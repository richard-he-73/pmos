<template>
  <div>
    <h1 class="text-xl font-bold mb-4">计划管理</h1>

    <!-- 三级 Tab -->
    <div class="flex gap-2 mb-4">
      <button v-for="t in planTabs" :key="t.key" :class="planTab===t.key?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'"
        class="px-3 py-1.5 rounded-lg text-sm transition" @click="planTab=t.key">{{ t.label }}</button>
      <div class="flex-1"></div>
      <button @click="openForm" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建计划</button>
    </div>

    <Card>
      <!-- 列表 -->
      <div v-if="loading" class="text-center py-12 text-slate-400 text-sm">加载中...</div>
      <div v-else-if="filteredPlans.length===0" class="text-center py-8 text-slate-400">暂无{{ currentTabLabel }}计划</div>
      <div v-else class="space-y-2">
        <div v-for="p in filteredPlans" :key="p.id"
          class="flex items-center gap-3 py-2.5 px-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded transition">
          <span class="text-sm shrink-0">{{ p.type==='milestone'?'📌':p.type==='middle'?'📋':'📝' }}</span>
          <span class="text-sm font-medium min-w-[120px]">{{ p.name }}</span>
          <span class="text-xs text-slate-400 shrink-0 w-20">{{ statusText(p.status) }}</span>
          <div class="flex-1 h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden min-w-[80px]">
            <div class="h-full rounded-full transition-all" :class="statusBarClass(p.status)" :style="{width: (p.progress||0) + '%'}"></div>
          </div>
          <span class="text-xs text-slate-400 w-10 text-right shrink-0">{{ p.progress||0 }}%</span>
          <span class="text-xs text-slate-400 w-44 hidden md:block shrink-0">{{ p.start_date||'—' }} ~ {{ p.end_date||'—' }}</span>
          <span v-if="p.parent_name" class="text-xs text-slate-400 w-28 hidden lg:block truncate shrink-0">归属: {{ p.parent_name }}</span>
          <span class="text-xs text-slate-400 w-20 hidden lg:block truncate shrink-0">{{ p.assignee_name || '—' }}</span>
          <div class="shrink-0 flex gap-1">
            <button @click="editPlan(p)" class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
            <button @click="deletePlan(p.id)" class="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 新建/编辑弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ editing ? '编辑' : '新建' }}{{ currentTabLabel }}计划</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">计划名称 *</label>
            <input v-model="form.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">计划描述</label>
            <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <!-- 归属（中层/详细计划时显示） -->
          <div v-if="planTab!=='milestone'">
            <label class="block text-sm font-medium mb-1">{{ planTab==='middle' ? '归属里程碑计划' : '归属中层计划' }} *</label>
            <select v-model="form.parent" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="p in parentOptions" :key="p.id" :value="p.id">{{ p.name }} ({{ p.start_date||'?' }} ~ {{ p.end_date||'?' }})</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">责任人</label>
              <select v-model="form.assignee" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option value="">不指定</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.real_name || u.username }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">干系人</label>
              <input v-model="form.stakeholders" placeholder="逗号分隔" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">计划开始日期 *</label>
              <input v-model="form.start_date" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">计划结束日期 *</label>
              <input v-model="form.end_date" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">计划状态</label>
              <select v-model="form.status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option value="not_started">未开始</option>
                <option value="in_progress">执行中</option>
                <option value="suspended">已挂起</option>
                <option value="delayed">已延期</option>
                <option value="completed_late">延期完成</option>
                <option value="completed_on_time">按期完成</option>
                <option value="completed_early">提前完成</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">计划进度 (%)</label>
              <input v-model="form.progress" type="number" min="0" max="100" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="savePlan" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import request from '@/api/request'
import Card from '@/components/Card.vue'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
const toast = useToastStore()
const confirmStore = useConfirmStore()

const planTab = ref('milestone')
const planTabs = [
  { key: 'milestone', label: '里程碑计划' },
  { key: 'middle', label: '中层计划' },
  { key: 'detail', label: '详细计划' },
]
const currentTabLabel = computed(() => planTabs.find(t => t.key === planTab.value)?.label || '')

const allPlans = ref<any[]>([])
const users = ref<any[]>([])
const loading = ref(false)
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref<any>({})

const filteredPlans = computed(() => allPlans.value.filter(p => p.type === planTab.value))

const parentOptions = computed(() => {
  if (planTab.value === 'middle') return allPlans.value.filter(p => p.type === 'milestone')
  if (planTab.value === 'detail') return allPlans.value.filter(p => p.type === 'middle')
  return []
})

function statusText(v: string) {
  return { not_started: '未开始', in_progress: '执行中', suspended: '已挂起', delayed: '已延期', completed_late: '延期完成', completed_on_time: '按期完成', completed_early: '提前完成' }[v] || v || ''
}
function statusBarClass(v: string) {
  return { not_started: 'bg-slate-400', in_progress: 'bg-blue-500', suspended: 'bg-yellow-500', delayed: 'bg-red-500', completed_late: 'bg-orange-500', completed_on_time: 'bg-green-500', completed_early: 'bg-green-600' }[v] || 'bg-slate-400'
}

async function load() {
  loading.value = true
  try { const r = await request.get('/plans/'); allPlans.value = (r.data.results ?? r.data) as any[] } catch { allPlans.value = [] }
  finally { loading.value = false }
}
async function loadUsers() { try { const r = await request.get('/users/'); users.value = (r.data.results ?? r.data) as any[] } catch {} }

function openForm() {
  editing.value = null
  form.value = { type: planTab.value, status: 'not_started', progress: 0 }
  showForm.value = true
}
function editPlan(p: any) {
  editing.value = p
  form.value = { ...p }
  showForm.value = true
}

async function savePlan() {
  if (!form.value.name) { toast.show('请输入计划名称', 'error'); return }
  const payload = { ...form.value, type: planTab.value }
  if (!payload.start_date) { toast.show('请选择开始日期', 'error'); return }
  if (!payload.end_date) { toast.show('请选择结束日期', 'error'); return }
  for (const k of ['parent', 'assignee']) {
    if (k in payload && payload[k] === '') payload[k] = null
  }
  if (payload.parent === '') payload.parent = null
  try {
    if (editing.value) { await request.patch('/plans/' + editing.value.id + '/', payload) }
    else { await request.post('/plans/', payload) }
    showForm.value = false; load()
  } catch (e: any) {
    const errData = e?.response?.data
    if (errData && typeof errData === 'object') {
      toast.show(Object.values(errData).flat().join('; '), 'error')
    } else {
      toast.show('保存失败', 'error')
    }
  }
}

async function deletePlan(id: number) {
  if (!(await confirmStore.show('确认删除此计划？'))) return
  try { await request.delete('/plans/' + id + '/'); toast.show('删除成功', 'success'); load() } catch { toast.show('删除失败', 'error') }
}

watch(planTab, () => {})
onMounted(() => { load(); loadUsers() })
</script>
