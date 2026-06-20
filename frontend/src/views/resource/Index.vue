<template>
  <div>
    <h1 class="text-xl font-bold mb-4">资源管理</h1>
    <div class="flex justify-end mb-3">
      <button @click="openForm" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建资源</button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">姓名</th>
          <th class="text-left py-3 px-3 font-medium">性别</th>
          <th class="text-left py-3 px-3 font-medium">年龄</th>
          <th class="text-left py-3 px-3 font-medium">职级</th>
          <th class="text-left py-3 px-3 font-medium">可用状态</th>
          <th class="text-left py-3 px-3 font-medium">入场日期</th>
          <th class="text-left py-3 px-3 font-medium">离场日期</th>
          <th class="text-left py-3 px-4 font-medium w-24">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td class="py-3 px-4 font-medium">{{ r.name }}</td>
            <td class="py-3 px-4">{{ genderText(r.gender) }}</td>
            <td class="py-3 px-4">{{ r.age ?? '—' }}</td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded text-xs font-medium" :class="rankClass(r.rank)">{{ rankText(r.rank) }}</span>
            </td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded text-xs font-medium" :class="statusClass(r.status)">{{ statusText(r.status) }}</span>
            </td>
            <td class="py-3 px-4 text-slate-500 text-xs">{{ r.entry_date || '—' }}</td>
            <td class="py-3 px-4 text-slate-500 text-xs">{{ r.exit_date || '—' }}</td>
            <td class="py-3 px-4 whitespace-nowrap">
              <button @click="editItem(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
              <button @click="deleteItem(r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
            </td>
          </tr>
        </tbody></table>
        <div v-if="items.length===0" class="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg class="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span class="text-sm">暂无数据</span>
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ editing ? '编辑资源' : '新建资源' }}</h2>
        <div class="space-y-3">
          <!-- 姓名 -->
          <div>
            <label class="block text-sm font-medium mb-1">姓名 *</label>
            <input v-model="form.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <!-- 性别 -->
          <div>
            <label class="block text-sm font-medium mb-1">性别 *</label>
            <select v-model="form.gender" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <!-- 年龄 -->
          <div>
            <label class="block text-sm font-medium mb-1">年龄</label>
            <input v-model="form.age" type="number" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <!-- 职级 -->
          <div>
            <label class="block text-sm font-medium mb-1">职级 *</label>
            <select v-model="form.rank" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="director">咨询总监</option>
              <option value="senior">高级咨询师</option>
              <option value="consultant">咨询师</option>
              <option value="assistant">咨询助理</option>
              <option value="other">其他</option>
            </select>
          </div>
          <!-- 可用状态 -->
          <div>
            <label class="block text-sm font-medium mb-1">可用状态 *</label>
            <select v-model="form.status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="pending_entry">待入场</option>
              <option value="entered">已入场</option>
              <option value="pending_exit">待离场</option>
              <option value="exited">已离场</option>
            </select>
          </div>
          <!-- 入场日期 -->
          <div>
            <label class="block text-sm font-medium mb-1">入场日期</label>
            <input v-model="form.entry_date" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <!-- 离场日期 -->
          <div>
            <label class="block text-sm font-medium mb-1">离场日期</label>
            <input v-model="form.exit_date" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
const toast = useToastStore()
const confirm = useConfirmStore()

const items = ref<any[]>([])
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref<any>({})

async function load() {
  try { const r = await request.get('/consultants/'); items.value = (r.data.results ?? r.data) as any[] } catch { items.value = [] }
}

function openForm() { editing.value = null; form.value = { rank: 'consultant', status: 'pending_entry' }; showForm.value = true }
function editItem(r: any) { editing.value = r; form.value = { ...r }; showForm.value = true }

async function saveItem() {
  if (!form.value.name || !form.value.gender) { toast.show('请填写姓名和性别', 'error'); return }
  const payload = { ...form.value }
  if (payload.age === '' || payload.age === null) payload.age = null
  if (!payload.entry_date) payload.entry_date = null
  if (!payload.exit_date) payload.exit_date = null
  try {
    if (editing.value) { await request.patch('/consultants/' + editing.value.id + '/', payload) }
    else { await request.post('/consultants/', payload) }
    showForm.value = false; load()
  } catch (e: any) {
    const msg = e?.response?.data ? JSON.stringify(e.response.data) : '保存失败'
    toast.show(msg, 'error')
  }
}

async function deleteItem(id: number) {
  if (!(await confirm.show('确认删除此资源？'))) return
  try { await request.delete('/consultants/' + id + '/'); toast.show('删除成功', 'success'); load() } catch { toast.show('删除失败', 'error') }
}

function genderText(v: string) { return ({ male: '男', female: '女' })[v] || v }
function rankText(v: string) { return ({ director: '咨询总监', senior: '高级咨询师', consultant: '咨询师', assistant: '咨询助理', other: '其他' })[v] || v }
function rankClass(v: string) {
  return ({
    director: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
    senior: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    consultant: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    assistant: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    other: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700',
  })[v] || ''
}
function statusText(v: string) { return ({ pending_entry: '待入场', entered: '已入场', pending_exit: '待离场', exited: '已离场' })[v] || v }
function statusClass(v: string) {
  return ({
    pending_entry: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    entered: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    pending_exit: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
    exited: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700',
  })[v] || ''
}

onMounted(load)
</script>
