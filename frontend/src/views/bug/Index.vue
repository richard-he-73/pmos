<template>
  <div>
    <h1 class="text-xl font-bold mb-4">缺陷管理</h1>
    <div class="flex gap-2 mb-4">
      <button @click="openForm" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建缺陷</button>
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div v-if="loading" class="text-center py-8 text-slate-400">加载中...</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th class="text-left py-3 px-3 font-medium">标题</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">严重程度</th>
            <th class="text-left py-3 px-3 font-medium">状态</th><th class="text-left py-3 px-3 font-medium hidden md:table-cell">模块</th>
            <th class="text-right py-3 px-3 font-medium">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="row in items" :key="row.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td class="py-3 px-3 font-medium">{{ row.title }}</td>
              <td class="py-3 px-3 hidden sm:table-cell"><span class="px-2 py-0.5 rounded text-xs" :class="severityCls(row.severity)">{{ severityTxt(row.severity) }}</span></td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs" :class="statusCls(row.status)">{{ statusTxt(row.status) }}</span></td>
              <td class="py-3 px-3 hidden md:table-cell text-slate-500">{{ row.module || '—' }}</td>
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <div class="flex gap-1 justify-end whitespace-nowrap">
                  <button @click="editItem(row)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                  <button @click="deleteItem(row.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
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
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; load()" @update:page-size="pageSize=$event; page=1; load()" />
    </div>

    <!-- 表单弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ editing ? '编辑' : '新建' }}缺陷</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">标题</label><input v-model="form.title" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label class="block text-sm font-medium mb-1">描述</label><textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm font-medium mb-1">严重程度</label>
              <select v-model="form.severity" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option value="critical">致命</option><option value="major">严重</option><option value="minor" selected>一般</option><option value="trivial">轻微</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium mb-1">状态</label>
              <select v-model="form.status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option value="new">新建</option><option value="confirmed">已确认</option><option value="in_progress">修复中</option><option value="resolved">已解决</option><option value="closed">已关闭</option>
              </select>
            </div>
          </div>
          <div><label class="block text-sm font-medium mb-1">模块</label><input v-model="form.module" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
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
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useToastStore } from '@/stores/toast'
import { getBugs, createBug, updateBug } from '@/api/modules/testing'

const projectStore = useProjectStore()
const toast = useToastStore()
const items = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref<Record<string, any>>({})

function severityCls(s: string) { return { critical:'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20', major:'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20', minor:'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20', trivial:'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-700' }[s]||'' }
function severityTxt(s: string) { return { critical:'致命', major:'严重', minor:'一般', trivial:'轻微' }[s]||s }
function statusCls(s: string) { return { new:'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-700', confirmed:'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20', in_progress:'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20', resolved:'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20', closed:'text-slate-400 bg-slate-100 dark:text-slate-500 dark:bg-slate-800' }[s]||'' }
function statusTxt(s: string) { return { new:'新建', confirmed:'已确认', in_progress:'修复中', resolved:'已解决', closed:'已关闭' }[s]||s }

async function load() {
  loading.value = true
  try {
    const r = await getBugs({ page: page.value, page_size: pageSize.value, project: projectStore.activeProjectId || undefined })
    items.value = r.data.results ?? []
    total.value = r.data.count ?? items.value.length
  } catch { items.value = [] }
  finally { loading.value = false }
}

function openForm() { editing.value = null; form.value = { project: projectStore.activeProjectId, severity: 'minor', status: 'new', module: '' }; showForm.value = true }
function editItem(r: any) { editing.value = r; form.value = { ...r }; showForm.value = true }

async function saveItem() {
  try {
    if (editing.value) { await updateBug(editing.value.id, form.value) }
    else { await createBug(form.value) }
    showForm.value = false
    toast.show('保存成功', 'success')
    load()
  } catch { toast.show('保存失败', 'error') }
}

async function deleteItem(id: number) {
  try {
    await deleteBug(id)
    toast.show('删除成功', 'success')
    load()
  } catch { toast.show('删除失败', 'error') }
}

// 引用从 testing.ts 导出但没有的 deleteBug
import { deleteBug } from '@/api/modules/testing'
import Pagination from '@/components/Pagination.vue'

onMounted(load)
</script>
