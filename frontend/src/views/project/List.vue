<template>
  <div class="project-page">
    <div class="page-header">
      <h1>项目管理</h1>
      <t-button theme="primary" @click="showCreateDialog = true">
        <template #icon><t-icon name="add" /></template>
        新建项目
      </t-button>
    </div>

    <!-- 筛选栏 -->
    <t-card :bordered="false" class="filter-bar">
      <t-row :gutter="[16, 16]" align="middle">
        <t-col :xs="12" :sm="6" :md="4">
          <t-input v-model="filters.search" placeholder="搜索项目名称/编号" clearable @change="fetchData">
            <template #prefix-icon><t-icon name="search" /></template>
          </t-input>
        </t-col>
        <t-col :xs="6" :sm="3" :md="2">
          <t-select v-model="filters.status" placeholder="状态" clearable @change="fetchData">
            <t-option value="planning" label="规划中" />
            <t-option value="active" label="进行中" />
            <t-option value="closed" label="已结束" />
          </t-select>
        </t-col>
      </t-row>
    </t-card>

    <!-- 数据表格 -->
    <t-card :bordered="false">
      <t-table
        :data="projects"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        hover
        @row-click="handleRowClick"
        @page-change="onPageChange"
      />
    </t-card>

    <!-- 新建项目对话框 -->
    <t-dialog v-model:visible="showCreateDialog" header="新建项目" :confirm-btn="createConfirmBtn" @confirm="handleCreate">
      <t-form :data="formData" :rules="formRules" ref="createFormRef">
        <t-form-item name="name" label="项目名称">
          <t-input v-model="formData.name" placeholder="请输入项目名称" />
        </t-form-item>
        <t-form-item name="code" label="项目编号">
          <t-input v-model="formData.code" placeholder="例如 PROJ-2024-001" />
        </t-form-item>
        <t-form-item name="owner" label="项目负责人">
          <t-select v-model="formData.owner" :options="userOptions" placeholder="选择负责人" />
        </t-form-item>
        <t-form-item name="start_date" label="开始日期">
          <t-date-picker v-model="formData.start_date" />
        </t-form-item>
        <t-form-item name="end_date" label="结束日期">
          <t-date-picker v-model="formData.end_date" />
        </t-form-item>
        <t-form-item name="description" label="描述">
          <t-textarea v-model="formData.description" :rows="3" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProjects, createProject } from '@/api/modules/projects'
import type { Project } from '@/api/modules/projects'

const router = useRouter()

const projects = ref<Project[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)

const filters = reactive({ search: '', status: '' })
const pagination = reactive({ defaultPageSize: 20, total: 0, current: 1 })

const columns = [
  { colKey: 'code', title: '编号', width: 150, sortable: true },
  { colKey: 'name', title: '项目名称', ellipsis: true, minWidth: 200 },
  {
    colKey: 'status', title: '状态', width: 100,
    cell: ({ row }: { row: Project }) => {
      const map: Record<string, string> = {
        planning: '规划中',
        active: '进行中',
        closed: '已结束',
      }
      return map[row.status] || row.status
    },
  },
  { colKey: 'owner_name', title: '负责人', width: 120 },
  { colKey: 'start_date', title: '开始日期', width: 120 },
  { colKey: 'end_date', title: '结束日期', width: 120 },
  { colKey: 'created_at', title: '创建时间', width: 180 },
]

function handleRowClick({ row }: { row: Project }) {
  router.push(`/projects/${row.id}`)
}

const formData = reactive({
  name: '', code: '', owner: null as number | null,
  start_date: '', end_date: '', description: '',
})
const formRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
}
const userOptions = ref<{ label: string; value: number }[]>([])
const createConfirmBtn = { content: '创建', loading: false }

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: pagination.current,
      page_size: pagination.defaultPageSize,
    }
    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status

    const res = await getProjects(params)
    projects.value = res.data.results || []
    pagination.total = res.data.count
  } finally {
    loading.value = false
  }
}

function onPageChange(pageInfo: any) {
  pagination.current = pageInfo.current
  fetchData()
}

async function handleCreate() {
  createConfirmBtn.loading = true
  try {
    await createProject(formData as any)
    showCreateDialog.value = false
    fetchData()
  } finally {
    createConfirmBtn.loading = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.project-page { padding: var(--pmos-spacing-md); }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; font-size: var(--pmos-font-size-xl); }
.filter-bar { margin-bottom: var(--pmos-spacing-md); }
</style>
