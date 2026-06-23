<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold">文档管理</h1>
      <button @click="openCreateModal"
        class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
        + 新建文档
      </button>
    </div>

    <!-- 列表 -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div v-if="loading" class="text-center py-12 text-slate-400 text-sm">加载中...</div>
      <div v-else>
        <div v-if="items.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg class="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="text-sm">暂无数据</span>
        </div>
        <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">文档类型</th>
              <th class="text-left py-3 px-3 font-medium">标题</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">版本</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">格式</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">大小</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">上传时间</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">上传人</th>
              <th class="text-left py-3 px-3 font-medium whitespace-nowrap">归档状态</th>
              <th class="text-right py-3 px-3 font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id"
              class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-3 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  :class="docTypeClass(row.doc_type)">{{ docTypeLabel(row.doc_type) }}</span>
              </td>
              <td class="py-3 px-3 font-medium">{{ row.title || '—' }}</td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400">{{ row.version || '—' }}</td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400">{{ row.file_format || '—' }}</td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400">{{ row.file_size || '—' }}</td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ formatTime(row.upload_time) }}</td>
              <td class="py-3 px-3">{{ row.uploader_name || '—' }}</td>
              <td class="py-3 px-3 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  :class="row.archive_status === 'archived' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">
                  {{ row.archive_status === 'archived' ? '已归档' : '未归档' }}
                </span>
              </td>
              <td class="py-3 px-3 whitespace-nowrap text-right">
                <div class="flex gap-1 justify-end whitespace-nowrap">
                  <button @click="viewDetail(row)"
                    class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">
                    详情
                  </button>
                  <button @click="openEditModal(row)"
                    class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                    编辑
                  </button>
                  <button @click="toggleArchive(row)"
                    class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    :class="row.archive_status === 'archived'
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'">
                    {{ row.archive_status === 'archived' ? '取消归档' : '归档' }}
                  </button>
                  <button @click="deleteDocument(row.id)"
                    class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                    删除
                  </button>
                </div>
              </td>
            </tr>
                    <tr v-if="items.length === 0">
              <td colspan="9" class="py-16 text-center text-slate-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <span class="text-sm">暂无数据</span>
              </td>
            </tr>
</tbody>
        </table>
        </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; fetchDocuments()" @update:page-size="pageSize=$event; page=1; fetchDocuments()" />
      </div>
    </div>

    <!-- 新建/编辑文档弹窗 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ editingId ? '编辑文档' : '新建文档' }}</h2>

        <div class="space-y-3">
          <!-- 文档类型 -->
          <div>
            <label class="block text-sm font-medium mb-1">文档类型 *</label>
            <select v-model="form.doc_type"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="report">报告</option>
              <option value="plan">方案</option>
              <option value="requirement">需求</option>
              <option value="minutes">纪要</option>
              <option value="other">其他</option>
            </select>
          </div>

          <!-- 文档标题 -->
          <div>
            <label class="block text-sm font-medium mb-1">文档标题</label>
            <input v-model="form.title" placeholder="上传文件后自动识别"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- 文档版本 -->
          <div>
            <label class="block text-sm font-medium mb-1">文档版本</label>
            <input v-model="form.version" placeholder="如 V1.0"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- 文档格式 -->
            <div>
              <label class="block text-sm font-medium mb-1">文档格式</label>
              <input v-model="form.file_format" placeholder="上传后自动识别"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <!-- 文档大小 -->
            <div>
              <label class="block text-sm font-medium mb-1">文档大小</label>
              <input v-model="form.file_size" placeholder="上传后自动识别"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <!-- 上传时间 / 最后变更时间（仅编辑时显示，只读） -->
          <div v-if="editingId" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">上传时间</label>
              <input :value="formatTimeDetail(form.upload_time)" type="text" readonly
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-500 outline-none cursor-default" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">最后变更时间</label>
              <input :value="formatTimeDetail(form.updated_at || form.upload_time)" type="text" readonly
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-500 outline-none cursor-default" />
            </div>
          </div>

          <!-- 上传人 -->
          <div>
            <label class="block text-sm font-medium mb-1">上传人</label>
            <input v-model="form.uploader_name" :placeholder="currentUserName || '当前用户'"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- 归档状态 -->
          <div>
            <label class="block text-sm font-medium mb-1">归档状态</label>
            <select v-model="form.archive_status"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="unarchived">未归档</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          <!-- 上传区域 -->
          <div>
            <label class="block text-sm font-medium mb-1">上传文件</label>
            <div
              class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition"
              @click="triggerFileUpload" @dragover.prevent @drop.prevent="handleDrop">
              <svg v-if="!selectedFile && !existingFileUrl" class="w-10 h-10 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p v-if="!selectedFile && !existingFileUrl" class="text-sm text-slate-500 dark:text-slate-400">
                点击或拖拽文件到此处上传
              </p>
              <div v-else-if="existingFileUrl && !selectedFile" class="flex items-center justify-center gap-2 text-sm">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span class="text-slate-700 dark:text-slate-200 font-medium truncate max-w-[200px]">{{ existingFileName }}</span>
                <span v-if="editingId" class="text-xs text-slate-400 ml-1">（点击更换）</span>
              </div>
              <div v-else-if="selectedFile" class="flex items-center justify-center gap-2 text-sm">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-slate-700 dark:text-slate-200 font-medium">{{ selectedFile.name }}</span>
                <span class="text-slate-400">({{ formatFileSize(selectedFile.size) }})</span>
                <button @click.stop="removeFile" class="text-red-500 hover:text-red-700 ml-1">&times;</button>
              </div>
            </div>
            <input ref="fileInputRef" type="file" class="hidden" @change="handleFileSelect" />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button @click="showModal = false"
            class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            取消
          </button>
          <button @click="submitForm"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetail && detailItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="closeDetail">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">文档详情</h2>
          <button @click="closeDetail" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="col-span-2 sm:col-span-1">
            <span class="text-slate-400 block text-xs mb-0.5">文档类型</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="docTypeClass(detailItem.doc_type)">{{ docTypeLabel(detailItem.doc_type) }}</span>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <span class="text-slate-400 block text-xs mb-0.5">归档状态</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="detailItem.archive_status === 'archived' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">
              {{ detailItem.archive_status === 'archived' ? '已归档' : '未归档' }}
            </span>
          </div>
          <div class="col-span-2">
            <span class="text-slate-400 block text-xs mb-0.5">文档标题</span>
            <span class="font-medium">{{ detailItem.title || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">文档版本</span>
            <span>{{ detailItem.version || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">文档格式</span>
            <span>{{ detailItem.file_format || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">文档大小</span>
            <span>{{ detailItem.file_size || '—' }}</span>
          </div>
          <div class="col-span-2" v-if="detailItem.file">
            <span class="text-slate-400 block text-xs mb-0.5">已上传文件</span>
            <a :href="detailItem.file" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all">{{ extractFileName(detailItem.file) }}</a>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">上传时间</span>
            <span>{{ formatTimeDetail(detailItem.upload_time) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">上传人</span>
            <span>{{ detailItem.uploader_name || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">最后变更时间</span>
            <span>{{ lastModifiedDisplay(detailItem.updated_at, detailItem.created_at, detailItem.upload_time) }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectStore } from '@/stores/project'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import request from '@/api/request'
import Pagination from '@/components/Pagination.vue'

const authStore = useAuthStore()
const projectStore = useProjectStore()
const toast = useToastStore()
const confirmStore = useConfirmStore()

const items = ref<any[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(true)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const showDetail = ref(false)
const detailItem = ref<any>(null)

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const currentUserName = computed(() => authStore.currentUser?.real_name || authStore.currentUser?.username || '')

const existingFileUrl = ref('')
const existingFileName = computed(() => existingFileUrl.value ? extractFileName(existingFileUrl.value) : '')

const form = ref({
  doc_type: 'report',
  title: '',
  version: '',
  file_format: '',
  file_size: '',
  upload_time: '',
  uploader_name: '',
  archive_status: 'unarchived',
  updated_at: '',
})

const docTypeMap: Record<string, string> = {
  report: '报告',
  plan: '方案',
  requirement: '需求',
  minutes: '纪要',
  other: '其他',
}

function docTypeLabel(type: string) {
  return docTypeMap[type] || type
}

function docTypeClass(type: string) {
  const map: Record<string, string> = {
    report: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    plan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    requirement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    minutes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    other: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  }
  return map[type] || map.other
}

function formatTime(t: string | null | undefined) {
  if (!t) return '—'
  try {
    const d = new Date(t)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return t
  }
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

function lastModifiedDisplay(updatedAt: string | null | undefined, createdAt: string | null | undefined, uploadTime: string | null | undefined): string {
  if (!updatedAt) return formatTimeDetail(uploadTime)
  // 如果 updated_at 与 created_at 非常接近（<2秒），说明从未编辑过，此时最后变更时间应与上传时间一致
  if (createdAt) {
    const diff = Math.abs(new Date(updatedAt).getTime() - new Date(createdAt).getTime())
    if (diff < 2000) return formatTimeDetail(uploadTime) || formatTimeDetail(updatedAt)
  }
  return formatTimeDetail(updatedAt)
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i]
}

function extractFileName(url: string): string {
  if (!url) return ''
  try {
    const parts = url.split('/')
    const raw = decodeURIComponent(parts[parts.length - 1] || '')
    // 去掉 Django 可能追加的随机后缀（如 _j2ZNrpM）
    return raw.replace(/_[a-zA-Z0-9]{7}\.[a-z]+$|_[a-zA-Z0-9]{7}$/i, '') || raw
  } catch {
    return url
  }
}

function openCreateModal() {
  editingId.value = null
  // 重置表单
  form.value = {
    doc_type: 'report',
    title: '',
    version: '',
    file_format: '',
    file_size: '',
    upload_time: '',
    uploader_name: currentUserName.value,
    archive_status: 'unarchived',
    updated_at: '',
  }
  selectedFile.value = null
  existingFileUrl.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
  showModal.value = true
}

function openEditModal(row: any) {
  editingId.value = row.id
  existingFileUrl.value = row.file || ''
  form.value = {
    doc_type: row.doc_type || 'other',
    title: row.title || '',
    version: row.version || '',
    file_format: row.file_format || '',
    file_size: row.file_size || '',
    upload_time: row.upload_time || '',
    uploader_name: row.uploader_name || currentUserName.value,
    archive_status: row.archive_status || 'unarchived',
    // 最后变更时间为当前编辑时间
    updated_at: new Date().toISOString(),
  }
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
  showModal.value = true
}

function viewDetail(row: any) {
  detailItem.value = row
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  detailItem.value = null
}

async function toggleArchive(row: any) {
  const newStatus = row.archive_status === 'archived' ? 'unarchived' : 'archived'
  const label = newStatus === 'archived' ? '归档' : '取消归档'
  try {
    await request.patch(`/documents/${row.id}/`, { archive_status: newStatus })
    toast.show(`文档已${label}`, 'success')
    await fetchDocuments()
  } catch {
    toast.show(`${label}失败`, 'error')
  }
}

function triggerFileUpload() {
  fileInputRef.value?.click()
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  selectedFile.value = file

  // 从文件名提取标题（去除扩展名）
  const dotIndex = file.name.lastIndexOf('.')
  const nameWithoutExt = dotIndex > 0 ? file.name.substring(0, dotIndex) : file.name
  form.value.title = nameWithoutExt

  // 提取扩展名作为格式
  const ext = dotIndex > 0 ? file.name.substring(dotIndex + 1).toUpperCase() : ''
  form.value.file_format = ext

  // 文件大小
  form.value.file_size = formatFileSize(file.size)

  // 上传时间（当前时间，精确到毫秒）
  const now = new Date()
  const pad2 = (n: number) => String(n).padStart(2, '0')
  const pad3 = (n: number) => String(n).padStart(3, '0')
  // datetime-local 格式：YYYY-MM-DDTHH:mm:ss.sss
  form.value.upload_time = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}T${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}.${pad3(now.getMilliseconds())}`
}

function removeFile() {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function submitForm() {
  if (submitting.value) return
  submitting.value = true

  try {
    const fd = new FormData()
    fd.append('doc_type', form.value.doc_type)
    fd.append('title', form.value.title)
    fd.append('version', form.value.version)
    fd.append('file_format', form.value.file_format)
    fd.append('file_size', form.value.file_size)
    if (form.value.upload_time) {
      // 将本地 datetime-local 字符串转为 ISO 8601
      const dt = new Date(form.value.upload_time)
      fd.append('upload_time', dt.toISOString())
    }
    if (form.value.uploader_name && form.value.uploader_name !== currentUserName.value) {
      // 如果上传人姓名修改了，尝试查找对应的用户 ID
      // 先尝试用名字查找用户
      try {
        const userRes = await request.get('/users/', { params: { search: form.value.uploader_name } })
        if (userRes.data?.results?.length > 0) {
          fd.append('uploader', userRes.data.results[0].id)
        }
      } catch {
        // 查找失败则使用当前用户（由后端兜底）
      }
    }
    fd.append('archive_status', form.value.archive_status)
    if (selectedFile.value) {
      fd.append('file', selectedFile.value)
    }
    if (projectStore.activeProjectId) {
      fd.append('project', String(projectStore.activeProjectId))
    }

    const isEdit = editingId.value !== null
    if (isEdit) {
      await request.put(`/documents/${editingId.value}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // 保存成功后更新最后变更时间
      form.value.updated_at = new Date().toISOString()
      toast.show('文档更新成功', 'success')
    } else {
      await request.post('/documents/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.show('文档创建成功', 'success')
    }
    showModal.value = false
    await fetchDocuments()
  } catch (e: any) {
    const isEdit = editingId.value !== null
    const detail = e?.response?.data?.detail || e?.response?.data || (isEdit ? '更新失败' : '创建失败')
    const msg = typeof detail === 'string' ? detail : JSON.stringify(detail)
    toast.show(msg, 'error')
  } finally {
    submitting.value = false
  }
}

async function deleteDocument(id: number) {
  if (!(await confirmStore.show('确认删除此文档？'))) return
  try {
    await request.delete(`/documents/${id}/`)
    toast.show('文档已删除', 'success')
    await fetchDocuments()
  } catch {
    toast.show('删除失败', 'error')
  }
}

async function fetchDocuments() {
  try {
    const params: Record<string, any> = {
      page: page.value,
      page_size: pageSize.value,
    }
    if (projectStore.activeProjectId) {
      params.project = String(projectStore.activeProjectId)
    }
    const r = await request.get('/documents/', { params })
    items.value = (r.data.results ?? r.data) as any[]
    total.value = r.data.count ?? items.value.length
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDocuments()
})
</script>
