<template>
  <div class="dashboard-page">
    <!-- 欢迎语 -->
    <div class="welcome-section">
      <h1>欢迎回来，{{ username }}</h1>
      <p class="text-secondary">{{ currentTime }}</p>
    </div>

    <!-- 统计卡片 -->
    <t-row :gutter="[16, 16]">
      <t-col :xs="12" :sm="6" :lg="3">
        <t-card :bordered="false" class="stat-card" @click="$router.push('/projects')">
          <div class="stat-inner">
            <t-icon name="folder" class="stat-icon blue" />
            <div>
              <div class="stat-value">{{ overview?.total || '-' }}</div>
              <div class="stat-label">项目总数</div>
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :xs="12" :sm="6" :lg="3">
        <t-card :bordered="false" class="stat-card" @click="$router.push('/tasks')">
          <div class="stat-inner">
            <t-icon name="check-circle" class="stat-icon green" />
            <div>
              <div class="stat-value">{{ taskCount || '-' }}</div>
              <div class="stat-label">待完成任务</div>
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :xs="12" :sm="6" :lg="3">
        <t-card :bordered="false" class="stat-card" @click="$router.push('/bugs')">
          <div class="stat-inner">
            <t-icon name="bug" class="stat-icon orange" />
            <div>
              <div class="stat-value">{{ bugCount || '-' }}</div>
              <div class="stat-label">未关闭缺陷</div>
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :xs="12" :sm="6" :lg="3">
        <t-card :bordered="false" class="stat-card" @click="$router.push('/plans')">
          <div class="stat-inner">
            <t-icon name="timeline" class="stat-icon purple" />
            <div>
              <div class="stat-value">{{ overview?.by_status?.length || '-' }}</div>
              <div class="stat-label">计划跟进</div>
            </div>
          </div>
        </t-card>
      </t-col>
    </t-row>

    <!-- 近期项目 -->
    <t-card :bordered="false" class="section-card" title="我的项目">
      <template #actions>
        <t-button theme="primary" size="small" @click="$router.push('/projects')">查看全部</t-button>
      </template>
      <t-table
        :data="projects"
        :columns="projectColumns"
        row-key="id"
        size="small"
        :loading="projectLoading"
        @row-click="handleRowClick"
        style="cursor: pointer"
      />
      <t-empty v-if="!projectLoading && projects.length === 0" description="暂无项目数据" />
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getProjects } from '@/api/modules/projects'
import { getProjectOverview } from '@/api/modules/statistics'
import type { Project } from '@/api/modules/projects'
import type { StatsOverview } from '@/api/modules/statistics'

const router = useRouter()

const authStore = useAuthStore()
const username = computed(() => authStore.currentUser?.real_name || authStore.currentUser?.username || '用户')

const currentTime = ref(new Date().toLocaleString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
}))

const overview = ref<StatsOverview | null>(null)
const projects = ref<Project[]>([])
const projectLoading = ref(false)

const taskCount = ref(0)
const bugCount = ref(0)

const projectColumns = [
  { colKey: 'code', title: '编号', width: 120 },
  { colKey: 'name', title: '项目名称', ellipsis: true },
  { colKey: 'status', title: '状态', width: 100,
    cell: ({ row }: { row: Project }) => ({
      planning: { text: '规划中', theme: 'warning' as const },
      active: { text: '进行中', theme: 'primary' as const },
      closed: { text: '已结束', theme: 'default' as const },
    }[row.status]),
  },
  { colKey: 'owner_name', title: '负责人', width: 120 },
  { colKey: 'created_at', title: '创建时间', width: 180 },
]

function handleRowClick({ row }: { row: Project }) {
  router.push(`/projects/${row.id}`)
}

onMounted(async () => {
  try {
    const [ovRes, projRes] = await Promise.all([
      getProjectOverview(),
      getProjects({ limit: 10 }),
    ])
    overview.value = ovRes.data
    projects.value = projRes.data.results || []
  } catch (err) {
    console.error('Failed to load dashboard data', err)
  } finally {
    projectLoading.value = false
  }
})
</script>

<style scoped>
.dashboard-page { padding: var(--pmos-spacing-md); }
.welcome-section { margin-bottom: var(--pmos-spacing-lg); }
.welcome-section h1 { margin: 0; font-size: var(--pmos-font-size-xl); }
.text-secondary { color: var(--pmos-text-secondary); margin: var(--pmos-spacing-xs) 0 0; }

.stat-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--pmos-shadow); }
.stat-inner { display: flex; align-items: center; gap: var(--pmos-spacing-md); }
.stat-icon { font-size: 32px; }
.stat-icon.blue { color: var(--pmos-info); }
.stat-icon.green { color: var(--pmos-success); }
.stat-icon.orange { color: var(--pmos-warning); }
.stat-icon.purple { color: #7c3aed; }
.stat-value { font-size: 24px; font-weight: 700; line-height: 1.2; }
.stat-label { font-size: var(--pmos-font-size-sm); color: var(--pmos-text-secondary); }

.section-card { margin-top: var(--pmos-spacing-lg); }
</style>
