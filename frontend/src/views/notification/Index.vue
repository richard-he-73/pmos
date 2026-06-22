<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold">消息通知</h1>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
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
                    class="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">
                    详情
                  </button>
                  <button @click="toggleRead(row)"
                    class="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                    :class="row.is_read
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'">
                    {{ row.is_read ? '未读' : '已读' }}
                  </button>
                  <button @click="deleteNotification(row.id)"
                    class="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import request from '@/api/request'

const projectStore = useProjectStore()
const toast = useToastStore()
const confirmStore = useConfirmStore()

const items = ref<any[]>([])
const loading = ref(true)
const showDetail = ref(false)
const detailItem = ref<any>(null)

const senderMap: Record<string, string> = {
  task_assigned: '任务分配',
  task_updated: '任务更新',
  bug_reported: '缺陷报告',
  bug_assigned: '缺陷分配',
  project_created: '项目创建',
  project_updated: '项目更新',
  project_member_added: '项目成员',
  requirement_updated: '需求更新',
  plan_updated: '计划更新',
  release_planned: '投产计划',
  system_notice: '系统通知',
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
    const params: Record<string, string> = {}
    if (projectStore.activeProjectId) {
      params.project = String(projectStore.activeProjectId)
    }
    const r = await request.get('/notifications/', { params })
    items.value = r.data.results ?? r.data ?? []
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNotifications()
})
</script>
