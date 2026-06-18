<template>
  <div class="project-detail">
    <t-card :bordered="false" :loading="loading">
      <template v-if="project">
        <div class="detail-header">
          <t-button variant="text" @click="$router.back()">
            <t-icon name="chevron-left" /> 返回
          </t-button>
          <div class="header-info">
            <h1>{{ project.name }}</h1>
            <t-tag :theme="statusTag.theme">{{ statusTag.text }}</t-tag>
            <span class="code">{{ project.code }}</span>
          </div>
          <t-button variant="outline">编辑</t-button>
        </div>

        <t-row :gutter="[24, 24]">
          <t-col :span="16">
            <t-card :bordered="false" title="基本信息" class="section">
              <t-descriptions :column="2" bordered>
                <t-descriptions-item label="负责人">{{ project.owner_name }}</t-descriptions-item>
                <t-descriptions-item label="状态">{{ statusTag.text }}</t-descriptions-item>
                <t-descriptions-item label="开始日期">{{ project.start_date || '-' }}</t-descriptions-item>
                <t-descriptions-item label="结束日期">{{ project.end_date || '-' }}</t-descriptions-item>
                <t-descriptions-item label="描述" :span="2">{{ project.description || '暂无描述' }}</t-descriptions-item>
              </t-descriptions>
            </t-card>

            <t-card :bordered="false" title="计划与任务" class="section">
              <t-table :data="plans" :columns="planColumns" row-key="id" size="small" />
              <t-empty v-if="plans.length === 0" description="暂无计划数据" />
            </t-card>
          </t-col>

          <t-col :span="8">
            <t-card :bordered="false" title="项目成员" class="section">
              <t-list v-if="members.length > 0">
                <t-list-item v-for="m in members" :key="m.id">
                  <span>{{ m.user_name }}</span>
                </t-list-item>
              </t-list>
              <t-empty v-else description="暂无成员" />
            </t-card>

            <t-card :bordered="false" title="项目统计" class="section">
              <div class="stat-grid">
                <div class="stat-item">
                  <span class="stat-num blue">{{ stats.tasks.total }}</span>
                  <span class="stat-lbl">任务</span>
                </div>
                <div class="stat-item">
                  <span class="stat-num green">{{ stats.tasks.completed }}</span>
                  <span class="stat-lbl">已完成</span>
                </div>
                <div class="stat-item">
                  <span class="stat-num orange">{{ stats.bugs.total }}</span>
                  <span class="stat-lbl">缺陷</span>
                </div>
                <div class="stat-item">
                  <span class="stat-num red">{{ stats.bugs.open }}</span>
                  <span class="stat-lbl">未关闭</span>
                </div>
              </div>
            </t-card>
          </t-col>
        </t-row>
      </template>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProject } from '@/api/modules/projects'
import { getProjectDetailStats } from '@/api/modules/statistics'
import type { Project } from '@/api/modules/projects'

const route = useRoute()
const loading = ref(true)
const project = ref<Project | null>(null)
const plans = ref<any[]>([])
const members = ref<any[]>([])
const stats = ref({ tasks: { total: 0, completed: 0 }, bugs: { total: 0, open: 0 } })

const statusTag = computed(() => {
  const map: Record<string, { theme: string; text: string }> = {
    planning: { theme: 'warning', text: '规划中' },
    active: { theme: 'primary', text: '进行中' },
    closed: { theme: 'default', text: '已结束' },
  }
  return map[project.value?.status || ''] || { theme: 'default', text: '未知' }
})

const planColumns = [
  { colKey: 'name', title: '计划名称' },
  { colKey: 'type', title: '类型', width: 80 },
  { colKey: 'progress', title: '进度', width: 80 },
  { colKey: 'start_date', title: '开始', width: 100 },
  { colKey: 'end_date', title: '结束', width: 100 },
]

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const [projRes] = await Promise.all([
      getProject(id),
      getProjectDetailStats(id).catch(() => null),
    ])
    project.value = projRes.data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.project-detail { padding: var(--pmos-spacing-md); }
.detail-header { display: flex; align-items: center; gap: var(--pmos-spacing-md); margin-bottom: var(--pmos-spacing-lg); }
.header-info { flex: 1; display: flex; align-items: center; gap: var(--pmos-spacing-sm); }
.header-info h1 { margin: 0; font-size: var(--pmos-font-size-lg); }
.code { color: var(--pmos-text-secondary); font-size: var(--pmos-font-size-sm); }
.section { margin-bottom: var(--pmos-spacing-md); }
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--pmos-spacing-sm); }
.stat-item { text-align: center; padding: var(--pmos-spacing-sm); border-radius: 6px; background: var(--pmos-bg-secondary); }
.stat-num { display: block; font-size: 24px; font-weight: 700; }
.stat-lbl { font-size: var(--pmos-font-size-sm); color: var(--pmos-text-secondary); }
.blue { color: var(--pmos-info); }
.green { color: var(--pmos-success); }
.orange { color: var(--pmos-warning); }
.red { color: var(--pmos-error); }
</style>
