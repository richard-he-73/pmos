<template>
  <div v-if="project">
    <button @click="router.back()" class="text-sm text-blue-600 mb-3">&larr; 返回</button>
    <div class="flex items-center gap-3 mb-6 flex-wrap">
      <h1 class="text-xl font-bold">{{ project.name }}</h1>
      <span class="px-2 py-0.5 rounded text-xs font-medium" :class="stCls(project.status)">{{ stTxt(project.status) }}</span>
      <span class="text-sm text-slate-400">{{ project.code }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 基本信息 -->
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 class="text-sm font-semibold text-slate-500 mb-3">基本信息</h2>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="text-slate-400">负责人</span><p class="font-medium">{{ project.owner_name || '—' }}</p></div>
            <div><span class="text-slate-400">项目类型</span><p>{{ typeTxt(project.project_type) }}</p></div>
            <div><span class="text-slate-400">项目领域</span><p>{{ domainTxt(project.project_domain) }}</p></div>
            <div><span class="text-slate-400">咨询方向</span><p>{{ directionTxt(project.consulting_direction) }}</p></div>
            <div><span class="text-slate-400">开始日期</span><p>{{ project.start_date || '—' }}</p></div>
            <div><span class="text-slate-400">结束日期</span><p>{{ project.end_date || '—' }}</p></div>
            <div><span class="text-slate-400">合同金额</span><p class="font-medium">{{ project.contract_price ? '¥' + Number(project.contract_price).toLocaleString() : '—' }}</p></div>
            <div><span class="text-slate-400">预算金额</span><p class="font-medium">{{ project.budget_price ? '¥' + Number(project.budget_price).toLocaleString() : '—' }}</p></div>
            <div><span class="text-slate-400">合同状态</span><p>{{ contractTxt(project.contract_status) }}</p></div>
            <div><span class="text-slate-400">创建时间</span><p class="text-xs text-slate-400">{{ project.created_at?.slice(0, 10) }}</p></div>
            <div class="col-span-2"><span class="text-slate-400">描述</span><p class="text-slate-600 dark:text-slate-300 mt-1">{{ project.description || '暂无描述' }}</p></div>
          </div>
        </div>

        <!-- 团队信息 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 class="text-sm font-semibold text-slate-500 mb-3">团队信息 ({{ teamMembers.length }})</h2>
          <div v-if="teamMembers.length === 0" class="text-sm text-slate-400 text-center py-4">暂无成员</div>
          <div v-else class="space-y-2">
            <div v-for="m in teamMembers" :key="m.id" class="flex items-center gap-3 text-sm">
              <span class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-400">{{ (m.name || '?')[0] }}</span>
              <div class="flex-1">
                <span class="font-medium">{{ m.name }}</span>
                <span class="text-slate-400 ml-2 text-xs">{{ rankTxt(m.rank) }}</span>
              </div>
              <span class="text-xs text-slate-400">{{ statusTxt(m.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="space-y-4">
        <!-- 项目统计 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 class="text-sm font-semibold text-slate-500 mb-3">项目统计</h2>
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-blue-600">{{ stats.tasks.total }}</div><div class="text-xs text-slate-400">任务总数</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-green-600">{{ stats.tasks.completed }}</div><div class="text-xs text-slate-400">已完成任务</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-orange-600">{{ stats.defects.total }}</div><div class="text-xs text-slate-400">缺陷总数</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-red-600">{{ stats.defects.open }}</div><div class="text-xs text-slate-400">未关闭缺陷</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-purple-600">{{ stats.plans.total }}</div><div class="text-xs text-slate-400">计划总数</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-teal-600">{{ stats.test_cases.total }}</div><div class="text-xs text-slate-400">测试用例</div></div>
          </div>
        </div>
        <!-- 计划概要 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 class="text-sm font-semibold text-slate-500 mb-3">计划概要</h2>
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-blue-600">{{ plans.length }}</div><div class="text-xs text-slate-400">总计划数</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-green-600">{{ plans.filter(p => p.status?.startsWith('completed')).length }}</div><div class="text-xs text-slate-400">已完成</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-yellow-600">{{ plans.filter(p => p.status === 'in_progress').length }}</div><div class="text-xs text-slate-400">执行中</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-orange-600">{{ plans.filter(p => p.status === 'suspended').length }}</div><div class="text-xs text-slate-400">已挂起</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-red-600">{{ plans.filter(p => p.status === 'delayed').length }}</div><div class="text-xs text-slate-400">已延期</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-slate-500">{{ plans.filter(p => p.status === 'not_started').length }}</div><div class="text-xs text-slate-400">未开始</div></div>
          </div>
        </div>
        <!-- 资源概要 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 class="text-sm font-semibold text-slate-500 mb-3">资源概要</h2>
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-blue-600">{{ teamMembers.length }}</div><div class="text-xs text-slate-400">资源总数</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-green-600">{{ teamMembers.filter(c => c.status === 'entered').length }}</div><div class="text-xs text-slate-400">已入场</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-yellow-600">{{ teamMembers.filter(c => c.status === 'pending_entry').length }}</div><div class="text-xs text-slate-400">待入场</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-orange-600">{{ teamMembers.filter(c => c.status === 'pending_exit').length }}</div><div class="text-xs text-slate-400">待离场</div></div>
            <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div class="text-xl font-bold text-red-600">{{ teamMembers.filter(c => c.status === 'exited').length }}</div><div class="text-xs text-slate-400">已离场</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProject } from '@/api/modules/projects'
import { getProjectDetailStats } from '@/api/modules/statistics'
import { getPlans } from '@/api/modules/plans'
import { getConsultants } from '@/api/modules/resources'

const route = useRoute()
const router = useRouter()
const project = ref<any>(null)
const plans = ref<any[]>([])
const teamMembers = ref<any[]>([])
const stats = ref({ plans: { total: 0, completed: 0, in_progress: 0 }, tasks: { total: 0, completed: 0, in_progress: 0 }, defects: { total: 0, open: 0, by_severity: [] as { severity: string; count: number }[] }, test_cases: { total: 0, by_type: [] as { type: string; count: number }[], by_status: [] as { status: string; count: number }[] }, test_executions: { total: 0, by_result: [] as { result: string; count: number }[] } })

function stCls(s: string) {
  return { planning: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20', active: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20', pending_acceptance: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20', closed: 'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800' }[s] || ''
}
function stTxt(s: string) { return { planning: '计划中', active: '进行中', pending_acceptance: '待验收', closed: '已结项' }[s] || s }
function typeTxt(s: string) { return { monthly: '人月型', fixed: '项目制', resource_pool: '资源池' }[s] || s }
function domainTxt(s: string) { return { overall_planning: '整体规划', project_management: '项目管理', professional_consulting: '专业咨询' }[s] || s }
function directionTxt(s: string) { return { core: '核心', credit: '信贷', credit_card: '信用卡', payment: '支付', channel: '渠道', operations: '运营', finance_accounting: '财会', digital_transform: '数字化转型', ai: '人工智能', other: '其他' }[s] || s }
function contractTxt(s: string) { return { draft: '草拟中', pending_legal: '待法审', pending_sign: '待签章', signed: '已签署', archived: '已归档' }[s] || s }
function rankTxt(s: string) { return { director: '咨询总监', senior: '高级咨询师', consultant: '咨询师', assistant: '咨询助理', other: '其他' }[s] || s || '' }
function statusTxt(s: string) { return { pending_entry: '待入场', entered: '已入场', pending_exit: '待离场', exited: '已离场' }[s] || s || '' }

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const [pr, st, pl, tm] = await Promise.all([
      getProject(id),
      getProjectDetailStats(id).catch(() => null),
      getPlans({ page_size: 999, project: id }).catch(() => null),
      getConsultants({ page_size: 999, project: id }).catch(() => null),
    ])
    project.value = pr.data
    if (st) stats.value = st.data
    if (pl?.data?.results) plans.value = pl.data.results
    if (tm?.data?.results) teamMembers.value = tm.data.results
  } catch {}
})
</script>
