<template>
  <div class="plan-page">
    <div class="page-header">
      <h1>计划管理</h1>
      <t-button theme="primary" @click="showCreatePlan = true">
        <template #icon><t-icon name="add" /></template>新建计划
      </t-button>
    </div>

    <!-- 项目选择 + 筛选 -->
    <t-card :bordered="false" class="filter-bar">
      <t-row :gutter="[16, 16]">
        <t-col :xs="12" :sm="6" :md="4">
          <t-select v-model="currentProject" placeholder="选择项目" @change="fetchPlans">
            <t-option v-for="p in projects" :key="p.id" :value="p.id" :label="p.name" />
          </t-select>
        </t-col>
      </t-row>
    </t-card>

    <!-- 甘特图视图 -->
    <t-card :bordered="false" title="甘特图" v-if="plans.length > 0">
      <div class="gantt-container">
        <!-- 里程碑 -->
        <div v-for="plan in milestones" :key="plan.id" class="gantt-item milestone">
          <div class="gantt-label">{{ plan.name }}
            <t-tag size="small" variant="light">{{ plan.progress }}%</t-tag>
          </div>
          <div class="gantt-bar-wrap">
            <div class="gantt-bar" :style="barStyle(plan)" :class="barClass(plan)"></div>
            <span class="gantt-date">{{ plan.start_date }} ~ {{ plan.end_date }}</span>
          </div>
        </div>

        <!-- 分组计划 -->
        <div v-for="plan in groups" :key="plan.id" class="gantt-item group">
          <div class="gantt-label group-label">{{ plan.name }}
            <t-tag size="small" variant="light">{{ plan.progress }}%</t-tag>
          </div>
          <div class="gantt-bar-wrap">
            <div class="gantt-bar" :style="barStyle(plan)" :class="barClass(plan)"></div>
          </div>
        </div>

        <!-- 详细计划 -->
        <div v-for="plan in details" :key="plan.id" class="gantt-item detail">
          <div class="gantt-label detail-label">{{ plan.name }}</div>
          <div class="gantt-bar-wrap">
            <div class="gantt-bar" :style="barStyle(plan)" :class="barClass(plan)"></div>
          </div>
        </div>
      </div>

      <t-divider />

      <!-- 关联任务 -->
      <div class="task-section">
        <h3>任务列表</h3>
        <t-table :data="tasks" :columns="taskColumns" row-key="id" size="small" />
        <t-empty v-if="tasks.length === 0" description="暂无任务" />
      </div>
    </t-card>

    <t-empty v-else-if="!loading" description="请选择一个项目查看计划" />

    <!-- 新建计划对话框 -->
    <t-dialog v-model:visible="showCreatePlan" header="新建计划" @confirm="handleCreatePlan">
      <t-form :data="planForm">
        <t-form-item name="name" label="计划名称">
          <t-input v-model="planForm.name" />
        </t-form-item>
        <t-form-item name="type" label="类型">
          <t-select v-model="planForm.type">
            <t-option value="milestone" label="里程碑" />
            <t-option value="group" label="分组计划" />
            <t-option value="detail" label="详细计划" />
          </t-select>
        </t-form-item>
        <t-form-item name="project" label="所属项目">
          <t-select v-model="planForm.project" :options="projectOptions" />
        </t-form-item>
        <t-form-item label="时间范围">
          <t-date-range-picker v-model="dateRange" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getProjects } from '@/api/modules/projects'
import { getPlans, createPlan, getPlanTasks } from '@/api/modules/plans'
import type { Project } from '@/api/modules/projects'
import type { Plan, Task } from '@/api/modules/plans'

const projects = ref<Project[]>([])
const projectOptions = computed(() => projects.value.map(p => ({ label: p.name, value: p.id })))
const currentProject = ref<number | null>(null)
const plans = ref<Plan[]>([])
const tasks = ref<Task[]>([])
const loading = ref(false)
const showCreatePlan = ref(false)

const planForm = ref({ name: '', type: 'detail', project: null as number | null })
const dateRange = ref([])

const milestones = computed(() => plans.value.filter(p => p.type === 'milestone'))
const groups = computed(() => plans.value.filter(p => p.type === 'group'))
const details = computed(() => plans.value.filter(p => p.type === 'detail'))

const taskColumns = [
  { colKey: 'name', title: '任务名称', ellipsis: true, minWidth: 200 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'priority', title: '优先级', width: 80 },
  { colKey: 'assignee_name', title: '负责人', width: 120 },
  { colKey: 'start_date', title: '开始', width: 100 },
  { colKey: 'due_date', title: '截止', width: 100 },
]

// Calculate date range for gantt scaling
const dateRange_ = computed(() => {
  if (plans.value.length === 0) return { min: '2024-01-01', max: '2024-12-31', days: 365 }
  const dates = plans.value.flatMap(p => [p.start_date, p.end_date])
  const min = dates.sort()[0]
  const max = dates.sort().reverse()[0]
  const d1 = new Date(min)
  const d2 = new Date(max)
  const days = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 86400)) + 30
  return { min, max: max, days: Math.max(days, 30) }
})

function barStyle(plan: Plan) {
  const range = dateRange_.value
  const start = new Date(plan.start_date)
  const end = new Date(plan.end_date)
  const totalMs = new Date(range.max).getTime() - new Date(range.min).getTime()
  const leftMs = start.getTime() - new Date(range.min).getTime()
  const durMs = end.getTime() - start.getTime()
  const leftPct = (leftMs / totalMs) * 100
  const widthPct = (durMs / totalMs) * 100
  return { left: `${Math.max(leftPct, 0)}%`, width: `${Math.max(widthPct, 3)}%` }
}

function barClass(plan: Plan) {
  return {
    'bar-completed': plan.status === 'completed',
    'bar-delayed': plan.status === 'delayed',
    'bar-active': plan.status === 'in_progress',
  }
}

async function fetchPlans() {
  if (!currentProject.value) return
  loading.value = true
  try {
    const plansRes = await getPlans({ project: currentProject.value })
    plans.value = plansRes.data || []
    // Load tasks for the first plan
    if (plans.value.length > 0) {
      const firstPlan = plans.value[0]
      const tasksRes = await getPlanTasks(firstPlan.id)
      tasks.value = tasksRes.data || []
    }
  } finally {
    loading.value = false
  }
}

async function handleCreatePlan() {
  if (currentProject.value) planForm.value.project = currentProject.value
  await createPlan({ ...planForm.value, start_date: dateRange.value[0], end_date: dateRange.value[1] } as any)
  showCreatePlan.value = false
  fetchPlans()
}

onMounted(async () => {
  const projRes = await getProjects()
  projects.value = projRes.data.results || []
  if (projects.value.length > 0) {
    currentProject.value = projects.value[0].id
    fetchPlans()
  }
})
</script>

<style scoped>
.plan-page { padding: var(--pmos-spacing-md); }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; font-size: var(--pmos-font-size-xl); }
.filter-bar { margin-bottom: var(--pmos-spacing-md); }

.gantt-container { position: relative; }
.gantt-item { display: flex; align-items: center; margin-bottom: 4px; min-height: 32px; }
.gantt-label { width: 200px; flex-shrink: 0; font-size: var(--pmos-font-size-sm); display: flex; align-items: center; gap: 4px; }
.gantt-label.milestone { font-weight: 700; }
.gantt-label.group { padding-left: 20px; font-weight: 600; }
.gantt-label.detail { padding-left: 40px; }

.gantt-bar-wrap { position: relative; flex: 1; height: 28px; background: var(--pmos-bg-secondary); border-radius: 4px; overflow: visible; }
.gantt-bar { position: absolute; height: 100%; border-radius: 4px; min-width: 4px; background: var(--pmos-info); transition: all 0.3s; }
.gantt-bar.bar-completed { background: var(--pmos-success); }
.gantt-bar.bar-delayed { background: var(--pmos-error); }
.gantt-bar.bar-active { background: var(--pmos-warning); }
.gantt-date { position: absolute; left: calc(100% + 8px); white-space: nowrap; font-size: 11px; color: var(--pmos-text-tertiary); }

.task-section { margin-top: var(--pmos-spacing-md); }
.task-section h3 { margin: 0 0 var(--pmos-spacing-sm); }
</style>
