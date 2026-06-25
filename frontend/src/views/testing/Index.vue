<template>
  <div>
    <h1 class="text-xl font-bold mb-4">测试管理</h1>
    <div class="flex gap-2 mb-4 flex-wrap">
      <button v-for="t in tabs" :key="t.k" :class="tab===t.k?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'"
        class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab=t.k">{{ t.l }}</button>
      <div class="flex-1"></div>
      <button v-if="tab==='cases'" @click="openCaseForm(null)" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建用例</button>
      <button v-if="tab==='env'" @click="openEnvForm(null)" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建环境</button>
      <button v-if="tab==='plans'" @click="openPlanForm(null)" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建计划</button>
      <button v-if="tab==='exec'" @click="openExecForm(null)" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建执行</button>
      <button v-if="tab==='defects'" @click="openDefectForm(null)" class="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">+ 报告缺陷</button>
    </div>

    <!-- ══════════════ 测试用例 ══════════════ -->
    <div v-if="tab==='cases'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">用例名称</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">类型</th>
          <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">所属模块</th><th class="text-left py-3 px-3 font-medium hidden md:table-cell">优先级</th>
          <th class="text-left py-3 px-3 font-medium">状态</th><th class="text-right py-3 px-3 font-medium">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in caseItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td class="py-3 px-3 font-medium">{{ r.name }}</td>
            <td class="py-3 px-3 hidden sm:table-cell text-slate-500">{{ caseTypeLbl(r.type) }}</td>
            <td class="py-3 px-3 hidden sm:table-cell text-slate-500">{{ r.module || '—' }}</td>
            <td class="py-3 px-3 hidden md:table-cell"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="casePrioCls(r.priority)">{{ casePrioLbl(r.priority) }}</span></td>
            <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="caseStatusCls(r.status)">{{ caseStatusLbl(r.status) }}</span></td>
            <td class="py-3 px-3 text-right whitespace-nowrap">
              <div class="flex gap-1 justify-end whitespace-nowrap">
                <button @click="viewCaseDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                <button @click="openCaseForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button v-if="r.status==='active'" @click="toggleCaseStatus(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">停用</button>
                <button v-else-if="r.status==='inactive'" @click="toggleCaseStatus(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">启用</button>
                <button v-if="['draft','active','inactive'].includes(r.status)" @click="discardCase(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">废弃</button>
                <button v-else @click="recoverCase(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-400">捡回</button>
                <button @click="doDelete('case', r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="caseItems.length===0"><td colspan="6" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无数据</span></td></tr>
        </tbody></table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; loadCases()" @update:page-size="pageSize=$event; page=1; loadCases()" />
    </div>

    <!-- ══════════════ 测试环境 ══════════════ -->
    <div v-if="tab==='env'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">环境名称</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">配置信息</th>
          <th class="text-left py-3 px-3 font-medium hidden md:table-cell">地址信息</th><th class="text-left py-3 px-3 font-medium">状态</th>
          <th class="text-right py-3 px-3 font-medium">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in envItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td class="py-3 px-3 font-medium">{{ r.name }}</td>
            <td class="py-3 px-3 hidden sm:table-cell text-slate-500 truncate max-w-[200px]">{{ r.config_info || '—' }}</td>
            <td class="py-3 px-3 hidden md:table-cell text-slate-500 truncate max-w-[200px]">{{ r.address_info || '—' }}</td>
            <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="envStatusCls(r.status)">{{ envStatusLbl(r.status) }}</span></td>
            <td class="py-3 px-3 text-right whitespace-nowrap">
              <div class="flex gap-1 justify-end whitespace-nowrap">
                <button @click="viewEnvDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                <button @click="openEnvForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button v-if="r.status==='active'" @click="toggleEnvStatus(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">停用</button>
                <button v-else-if="r.status==='inactive'" @click="toggleEnvStatus(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">启用</button>
                <button v-if="['planned','active','inactive'].includes(r.status)" @click="discardEnv(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">废弃</button>
                <button v-else @click="recoverEnv(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-400">捡回</button>
                <button @click="doDelete('env', r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="envItems.length===0"><td colspan="5" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无数据</span></td></tr>
        </tbody></table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; loadEnvs()" @update:page-size="pageSize=$event; page=1; loadEnvs()" />
    </div>

    <!-- ══════════════ 测试计划 ══════════════ -->
    <div v-if="tab==='plans'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">计划名称</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">起止日期</th>
          <th class="text-left py-3 px-3 font-medium hidden md:table-cell">测试环境</th><th class="text-left py-3 px-3 font-medium hidden md:table-cell">负责人</th>
          <th class="text-left py-3 px-3 font-medium">用例数</th><th class="text-right py-3 px-3 font-medium">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in planItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td class="py-3 px-3 font-medium">{{ r.name }}</td>
            <td class="py-3 px-3 hidden sm:table-cell text-slate-500 text-xs">{{ r.start_date||'?' }} ~ {{ r.end_date||'?' }}</td>
            <td class="py-3 px-3 hidden md:table-cell text-slate-500">{{ r.test_environment_name || '—' }}</td>
            <td class="py-3 px-3 hidden md:table-cell text-slate-500">{{ r.assignee_name || '—' }}</td>
            <td class="py-3 px-3">{{ r.test_case_ids?.length || 0 }}</td>
            <td class="py-3 px-3 text-right whitespace-nowrap">
              <div class="flex gap-1 justify-end whitespace-nowrap">
                <button @click="viewPlanDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                <button @click="openPlanForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button @click="doExecute(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">执行</button>
                <button @click="doDelete('plan', r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="planItems.length===0"><td colspan="6" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无数据</span></td></tr>
        </tbody></table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; loadPlans()" @update:page-size="pageSize=$event; page=1; loadPlans()" />
    </div>

    <!-- ══════════════ 测试执行 ══════════════ -->
    <div v-if="tab==='exec'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">计划名称</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">关联用例</th>
          <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">执行人</th><th class="text-left py-3 px-3 font-medium hidden md:table-cell">执行日期</th>
          <th class="text-left py-3 px-3 font-medium">结果</th><th class="text-right py-3 px-3 font-medium">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in execItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td class="py-3 px-3 font-medium text-xs">{{ r.test_plan_name }}</td>
            <td class="py-3 px-3 hidden sm:table-cell">{{ r.test_case_name }}</td>
            <td class="py-3 px-3 hidden sm:table-cell text-slate-500">{{ r.executor_name || '—' }}</td>
            <td class="py-3 px-3 hidden md:table-cell text-slate-500">{{ r.execution_date || '—' }}</td>
            <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="execResultCls(r.result)">{{ execResultLbl(r.result) }}</span></td>
            <td class="py-3 px-3 text-right whitespace-nowrap">
              <div class="flex gap-1 justify-end whitespace-nowrap">
                <button v-if="r.result!=='pass'" @click="reportDefectFromExecList(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400">报告缺陷</button>
                <button @click="viewExecDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                <button @click="openExecForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button @click="doDelete('exec', r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="execItems.length===0"><td colspan="6" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无数据</span></td></tr>
        </tbody></table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; loadExecs()" @update:page-size="pageSize=$event; page=1; loadExecs()" />
    </div>

    <!-- ══════════════ 测试缺陷 ══════════════ -->
    <div v-if="tab==='defects'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">缺陷名称</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">严重程度</th>
          <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">优先级</th><th class="text-left py-3 px-3 font-medium hidden md:table-cell">负责人</th>
          <th class="text-left py-3 px-3 font-medium">状态</th><th class="text-right py-3 px-3 font-medium">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in defectItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td class="py-3 px-3 font-medium">{{ r.name }}</td>
            <td class="py-3 px-3 hidden sm:table-cell"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="sevCls(r.severity)">{{ sevLbl(r.severity) }}</span></td>
            <td class="py-3 px-3 hidden sm:table-cell"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="defPrioCls(r.priority)">{{ defPrioLbl(r.priority) }}</span></td>
            <td class="py-3 px-3 hidden md:table-cell text-slate-500">{{ r.assignee_name || '—' }}</td>
            <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="defStatusCls(r.status)">{{ defStatusLbl(r.status) }}</span></td>
            <td class="py-3 px-3 text-right whitespace-nowrap">
              <div class="flex gap-1 justify-end whitespace-nowrap">
                <button @click="viewDefectDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                <button @click="openDefectForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button @click="doDelete('defect', r.id)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="defectItems.length===0"><td colspan="6" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无数据</span></td></tr>
        </tbody></table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; loadDefects()" @update:page-size="pageSize=$event; page=1; loadDefects()" />
    </div>

    <!-- ══════════════ 测试报告 ══════════════ -->
    <div v-if="tab==='report'" class="space-y-6">
      <div v-if="!reportData" class="flex items-center justify-center py-16 text-slate-400 text-sm">加载中...</div>
      <template v-else>
        <!-- 执行进度 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-lg font-bold mb-4">执行进度</h2>
          <div class="flex items-end gap-8">
            <div class="flex flex-col items-center"><span class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ execTotal }}</span><span class="text-xs text-slate-400 mt-1">总执行数</span></div>
            <div class="flex-1">
              <div class="flex h-6 rounded-full overflow-hidden">
                <div v-for="seg in execSegments" :key="seg.result" :title="seg.label + ': ' + seg.count"
                  class="transition-all" :style="{ width: seg.pct + '%', backgroundColor: seg.color }"></div>
              </div>
              <div class="flex gap-4 mt-2 text-xs flex-wrap">
                <span v-for="seg in execSegments" :key="seg.result" class="flex items-center gap-1">
                  <span class="w-3 h-3 rounded-sm inline-block" :style="{ backgroundColor: seg.color }"></span>
                  {{ seg.label }} <span class="text-slate-400">({{ seg.count }})</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- 通过率 & 缺陷统计 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 class="text-lg font-bold mb-4">测试通过率</h2>
            <div class="flex items-center gap-4">
              <div class="relative w-32 h-32">
                <svg class="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" stroke-width="8" class="dark:stroke-slate-600"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" stroke-width="8" stroke-dasharray="263.9" :stroke-dashoffset="passOffset" stroke-linecap="round"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-2xl font-bold text-green-600 dark:text-green-400">{{ passRate }}%</span>
                </div>
              </div>
              <div class="text-sm space-y-2">
                <div><span class="text-slate-400">通过：</span><span class="font-medium text-green-600">{{ passCount }}</span></div>
                <div><span class="text-slate-400">失败：</span><span class="font-medium text-red-600">{{ failCount }}</span></div>
                <div><span class="text-slate-400">阻塞：</span><span class="font-medium text-yellow-600">{{ blockedCount }}</span></div>
                <div><span class="text-slate-400">跳过：</span><span class="font-medium text-slate-500">{{ skippedCount }}</span></div>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 class="text-lg font-bold mb-4">缺陷统计</h2>
            <div class="space-y-4 text-sm">
              <div class="flex items-center gap-2"><span class="text-slate-400 w-20">总计</span><span class="font-bold text-xl">{{ defectTotal }}</span></div>
              <div class="flex items-center gap-2"><span class="text-slate-400 w-20">未解决</span><span class="font-bold text-xl text-red-600">{{ defectOpen }}</span></div>
              <div class="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div class="text-slate-400 mb-2">按严重程度</div>
                <div v-for="s in defectBySev" :key="s.severity" class="flex items-center gap-2 mb-1">
                  <span class="w-3 h-3 rounded-sm inline-block" :style="{ backgroundColor: sevColor(s.severity) }"></span>
                  <span>{{ sevLbl(s.severity) }}</span>
                  <span class="flex-1 text-right font-medium">{{ s.count }}</span>
                </div>
              </div>
              <div class="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div class="text-slate-400 mb-2">按状态</div>
                <div v-for="s in defectByStatus" :key="s.status" class="flex items-center gap-2 mb-1">
                  <span>{{ defStatusLbl(s.status) }}</span>
                  <span class="flex-1 text-right font-medium">{{ s.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ════════════════════════════════════════ -->
    <!--              Form Modals                  -->
    <!-- ════════════════════════════════════════ -->

    <!-- ── 测试环境表单弹窗 ── -->
    <div v-if="showEnvForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showEnvForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ envEditing ? '编辑' : '新建' }}测试环境</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">环境名称 *</label><input v-model="envForm.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label class="block text-sm font-medium mb-1">环境描述</label><textarea v-model="envForm.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">配置信息</label><textarea v-model="envForm.config_info" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">数据库信息</label><textarea v-model="envForm.db_info" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">地址信息</label><textarea v-model="envForm.address_info" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">环境状态</label>
            <select v-model="envForm.status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in ENV_STATUS_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="envForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showEnvForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveEnv" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>

    <!-- ── 测试用例表单弹窗 ── -->
    <div v-if="showCaseForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCaseForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ caseEditing ? '编辑' : '新建' }}测试用例</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">用例名称 *</label><input v-model="caseForm.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm font-medium mb-1">用例类型</label>
              <select v-model="caseForm.type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option v-for="(l,k) in CASE_TYPE_LABELS" :key="k" :value="k">{{ l }}</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium mb-1">所属模块</label><input v-model="caseForm.module" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
          </div>
          <div><label class="block text-sm font-medium mb-1">测试步骤</label><textarea v-model="caseForm.test_steps" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">预期结果</label><textarea v-model="caseForm.expected_result" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">需求基线</label>
            <div class="relative">
              <input v-model="baselineSearch" placeholder="输入关键字搜索基线..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <div v-if="baselineSearch && filteredBaselines.length" class="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div v-for="bl in filteredBaselines" :key="bl.id" class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30" @click="selectBaseline(bl)">{{ bl.name }} <span class="text-xs text-slate-400">v{{ bl.version }}</span></div>
              </div>
            </div>
          </div>
          <div v-if="caseForm.requirement_baseline" class="relative" data-picker="req-select">
            <label class="block text-sm font-medium mb-1">关联需求（从已选基线中选择）</label>
            <div @click="showReqPicker = !showReqPicker" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm cursor-pointer flex flex-wrap gap-1 min-h-[38px]">
              <span v-if="!caseForm.related_requirements?.length" class="text-slate-400">请选择关联需求</span>
              <span v-for="rid in caseForm.related_requirements" :key="rid" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                {{ baselineReqs.find(r=>r.id===rid)?.name || rid }}
              </span>
            </div>
            <div v-if="showReqPicker" class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 shadow-lg p-2 space-y-1">
              <label v-for="req in baselineReqs" :key="req.id" class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded">
                <input type="checkbox" :value="req.id" v-model="caseForm.related_requirements" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span>{{ req.name }}</span>
              </label>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm font-medium mb-1">优先级</label>
              <select v-model="caseForm.priority" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option v-for="(l,k) in CASE_PRIORITY_LABELS" :key="k" :value="k">{{ l }}</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium mb-1">用例状态</label>
              <select v-model="caseForm.status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option value="draft">草稿</option><option value="active">启用</option><option value="inactive">停用</option>
              </select>
            </div>
          </div>
          <div><label class="block text-sm font-medium mb-1">上传测试文档</label><input type="file" @change="onCaseDocChange" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" /></div>
          <div><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="caseForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showCaseForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveCase" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>

    <!-- ── 测试计划表单弹窗 ── -->
    <div v-if="showPlanForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showPlanForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ planEditing ? '编辑' : '新建' }}测试计划</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">计划名称 *</label><input v-model="planForm.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label class="block text-sm font-medium mb-1">计划目标</label><textarea v-model="planForm.goal" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm font-medium mb-1">开始日期</label><SmartDateInput v-model="planForm.start_date" /></div>
            <div><label class="block text-sm font-medium mb-1">结束日期</label><SmartDateInput v-model="planForm.end_date" /></div>
          </div>
          <div class="relative" data-picker="test-cases">
            <label class="block text-sm font-medium mb-1">测试用例（多选）</label>
            <div @click="showCasePicker = !showCasePicker" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm cursor-pointer flex flex-wrap gap-1 min-h-[38px]">
              <span v-if="!planForm.test_case_ids?.length" class="text-slate-400">请选择测试用例</span>
              <span v-for="cid in planForm.test_case_ids" :key="cid" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                {{ activeCases.find(tc=>tc.id===cid)?.name || cid }}
              </span>
            </div>
            <div v-if="showCasePicker" class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 shadow-lg p-2 space-y-1">
              <label v-for="tc in activeCases" :key="tc.id" class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded">
                <input type="checkbox" :value="tc.id" v-model="planForm.test_case_ids" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span>{{ tc.name }} <span class="text-xs text-slate-400">[{{ caseTypeLbl(tc.type) }}]</span></span>
              </label>
              <div v-if="activeCases.length===0" class="text-xs text-slate-400 text-center py-4">暂无启用的用例</div>
            </div>
          </div>
          <div><label class="block text-sm font-medium mb-1">测试环境</label>
            <select v-model="planForm.test_environment" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option :value="null">请选择</option>
              <option v-for="env in activeEnvs" :key="env.id" :value="env.id">{{ env.name }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">测试负责人</label>
            <select v-model="planForm.assignee" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option :value="null">不指定</option>
              <option v-for="m in orgMembersWithUser" :key="m.user_id" :value="m.user_id">{{ m.name }}</option>
            </select>
          </div>
          <div class="relative" data-picker="stakeholder">
            <label class="block text-sm font-medium mb-1">干系人（多选）</label>
            <div @click="showStakePicker = !showStakePicker" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm cursor-pointer flex flex-wrap gap-1 min-h-[38px]">
              <span v-if="!planForm.stakeholder_ids?.length" class="text-slate-400">请选择干系人</span>
              <span v-for="sid in planForm.stakeholder_ids" :key="sid" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                {{ orgMembersWithUser.find(m=>m.user_id===sid)?.name || sid }}
              </span>
            </div>
            <div v-if="showStakePicker" class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 shadow-lg p-2 space-y-1">
              <label v-for="m in orgMembersWithUser" :key="m.user_id" class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded">
                <input type="checkbox" :value="m.user_id" v-model="planForm.stakeholder_ids" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span>{{ m.name }}</span>
              </label>
            </div>
          </div>
          <div><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="planForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showPlanForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="savePlan" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>

    <!-- ── 测试执行表单弹窗 ── -->
    <div v-if="showExecForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showExecForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ execEditing ? '编辑' : '新建' }}测试执行</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">计划名称 *</label>
            <template v-if="execFromPlan || execEditing">
              <input :value="execEditing ? planSearch : execFromPlan.name" disabled class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-sm" />
            </template>
            <template v-else>
              <input v-model="planSearch" placeholder="输入关键字搜索计划..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <div v-if="planSearch && filteredPlans.length" class="relative">
                <div class="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                  <div v-for="p in filteredPlans" :key="p.id" class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30" @click="selectExecPlan(p)">{{ p.name }}</div>
                </div>
              </div>
            </template>
          </div>
          <div class="relative" data-picker="testcase">
            <label class="block text-sm font-medium mb-1">关联用例 *</label>
            <div @click="showTcPicker = !showTcPicker" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm cursor-pointer flex flex-wrap gap-1 min-h-[38px]">
              <span v-if="!execForm.test_case_ids?.length" class="text-slate-400">请选择测试用例</span>
              <span v-for="tcId in execForm.test_case_ids" :key="tcId" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                {{ planTestCases.find(tc=>tc.id===tcId)?.name || tcId }}
              </span>
            </div>
            <div v-if="showTcPicker" class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 shadow-lg p-2 space-y-1">
              <label v-for="tc in planTestCases" :key="tc.id" class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded">
                <input type="checkbox" :value="tc.id" v-model="execForm.test_case_ids" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span>{{ tc.name }}</span>
              </label>
              <div v-if="planTestCases.length===0" class="text-xs text-slate-400 text-center py-4">请先选择测试计划</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm font-medium mb-1">执行人</label>
              <select v-model="execForm.executor" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option :value="null">不指定</option>
                <option v-for="m in orgMembersWithUser" :key="m.user_id" :value="m.user_id">{{ m.name }}</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium mb-1">执行日期</label><SmartDateInput v-model="execForm.execution_date" /></div>
          </div>
          <div><label class="block text-sm font-medium mb-1">执行结果</label>
            <select v-model="execForm.result" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in EXEC_RESULT_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">执行凭证</label><input type="file" @change="onExecEvidenceChange" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" /></div>
          <div><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="execForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div v-if="execForm.result && execForm.result!=='pass'">
            <button @click="reportDefectFromExec" class="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">报告缺陷</button>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showExecForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveExec" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>

    <!-- ── 测试缺陷表单弹窗 ── -->
    <div v-if="showDefectForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showDefectForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ defectEditing ? '编辑' : '报告' }}缺陷</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">缺陷名称 *</label><input v-model="defectForm.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label class="block text-sm font-medium mb-1">缺陷描述</label><textarea v-model="defectForm.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">关联用例</label>
            <template v-if="defectFromExec">
              <input :value="defectFromExec.test_case_name" disabled class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-sm" />
            </template>
            <template v-else>
              <input v-model="caseSearch" placeholder="输入关键字搜索用例..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <div v-if="caseSearch && filteredAllCases.length" class="relative">
                <div class="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                  <div v-for="tc in filteredAllCases" :key="tc.id" class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30" @click="selectDefectCase(tc)">{{ tc.name }}</div>
                </div>
              </div>
            </template>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm font-medium mb-1">严重程度</label>
              <select v-model="defectForm.severity" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option v-for="(l,k) in DEFECT_SEVERITY_LABELS" :key="k" :value="k">{{ l }}</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium mb-1">优先级</label>
              <select v-model="defectForm.priority" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option v-for="(l,k) in DEFECT_PRIORITY_LABELS" :key="k" :value="k">{{ l }}</option>
              </select>
            </div>
          </div>
          <div><label class="block text-sm font-medium mb-1">负责人</label>
            <select v-model="defectForm.assignee" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option :value="null">不指定</option>
              <option v-for="m in orgMembersWithUser" :key="m.user_id" :value="m.user_id">{{ m.name }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">缺陷状态</label>
            <select v-model="defectForm.status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in DEFECT_STATUS_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="defectForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showDefectForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveDefect" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════ -->
    <!--              Detail Modals               -->
    <!-- ════════════════════════════════════════ -->

    <!-- 用例详情 -->
    <div v-if="showCaseDetail && caseDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCaseDetail=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4"><h2 class="text-lg font-bold">用例详情</h2><button @click="showCaseDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button></div>
        <div class="space-y-4 text-sm">
          <div><span class="text-slate-400 block text-xs mb-0.5">用例名称</span><span class="font-medium">{{ caseDetail.name }}</span></div>
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-slate-400 block text-xs mb-0.5">类型</span><span>{{ caseTypeLbl(caseDetail.type) }}</span></div>
            <div><span class="text-slate-400 block text-xs mb-0.5">所属模块</span><span>{{ caseDetail.module || '—' }}</span></div>
          </div>
          <div><span class="text-slate-400 block text-xs mb-0.5">测试步骤</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ caseDetail.test_steps || '—' }}</div></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">预期结果</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ caseDetail.expected_result || '—' }}</div></div>
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-slate-400 block text-xs mb-0.5">需求基线</span><span>{{ caseDetail.baseline_name || '—' }}</span></div>
            <div><span class="text-slate-400 block text-xs mb-0.5">优先级</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="casePrioCls(caseDetail.priority)">{{ casePrioLbl(caseDetail.priority) }}</span></div>
          </div>
          <div><span class="text-slate-400 block text-xs mb-0.5">状态</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="caseStatusCls(caseDetail.status)">{{ caseStatusLbl(caseDetail.status) }}</span></div>
          <div v-if="caseDetail.notes"><span class="text-slate-400 block text-xs mb-0.5">备注</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ caseDetail.notes }}</div></div>
        </div>
      </div>
    </div>

    <!-- 环境详情 -->
    <div v-if="showEnvDetail && envDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showEnvDetail=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4"><h2 class="text-lg font-bold">环境详情</h2><button @click="showEnvDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button></div>
        <div class="space-y-4 text-sm">
          <div><span class="text-slate-400 block text-xs mb-0.5">环境名称</span><span class="font-medium">{{ envDetail.name }}</span></div>
          <div v-if="envDetail.description"><span class="text-slate-400 block text-xs mb-0.5">环境描述</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ envDetail.description }}</div></div>
          <div v-if="envDetail.config_info"><span class="text-slate-400 block text-xs mb-0.5">配置信息</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ envDetail.config_info }}</div></div>
          <div v-if="envDetail.db_info"><span class="text-slate-400 block text-xs mb-0.5">数据库信息</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ envDetail.db_info }}</div></div>
          <div v-if="envDetail.address_info"><span class="text-slate-400 block text-xs mb-0.5">地址信息</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ envDetail.address_info }}</div></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">状态</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="envStatusCls(envDetail.status)">{{ envStatusLbl(envDetail.status) }}</span></div>
          <div v-if="envDetail.notes"><span class="text-slate-400 block text-xs mb-0.5">备注</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ envDetail.notes }}</div></div>
        </div>
      </div>
    </div>

    <!-- 计划详情 -->
    <div v-if="showPlanDetail && planDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showPlanDetail=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4"><h2 class="text-lg font-bold">计划详情</h2><button @click="showPlanDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button></div>
        <div class="space-y-4 text-sm">
          <div><span class="text-slate-400 block text-xs mb-0.5">计划名称</span><span class="font-medium">{{ planDetail.name }}</span></div>
          <div v-if="planDetail.goal"><span class="text-slate-400 block text-xs mb-0.5">计划目标</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ planDetail.goal }}</div></div>
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-slate-400 block text-xs mb-0.5">开始日期</span><span>{{ planDetail.start_date || '—' }}</span></div>
            <div><span class="text-slate-400 block text-xs mb-0.5">结束日期</span><span>{{ planDetail.end_date || '—' }}</span></div>
          </div>
          <div><span class="text-slate-400 block text-xs mb-0.5">测试用例</span><span>{{ planDetail.test_case_names?.join('、') || '—' }}</span></div>
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-slate-400 block text-xs mb-0.5">测试环境</span><span>{{ planDetail.test_environment_name || '—' }}</span></div>
            <div><span class="text-slate-400 block text-xs mb-0.5">负责人</span><span>{{ planDetail.assignee_name || '—' }}</span></div>
          </div>
          <div v-if="planDetail.notes"><span class="text-slate-400 block text-xs mb-0.5">备注</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ planDetail.notes }}</div></div>
        </div>
      </div>
    </div>

    <!-- 执行详情 -->
    <div v-if="showExecDetail && execDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showExecDetail=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4"><h2 class="text-lg font-bold">执行详情</h2><button @click="showExecDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button></div>
        <div class="space-y-4 text-sm">
          <div><span class="text-slate-400 block text-xs mb-0.5">计划名称</span><span class="font-medium">{{ execDetail.test_plan_name }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">关联用例</span><span>{{ execDetail.test_case_name }}</span></div>
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-slate-400 block text-xs mb-0.5">执行人</span><span>{{ execDetail.executor_name || '—' }}</span></div>
            <div><span class="text-slate-400 block text-xs mb-0.5">执行日期</span><span>{{ execDetail.execution_date || '—' }}</span></div>
          </div>
          <div><span class="text-slate-400 block text-xs mb-0.5">执行结果</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="execResultCls(execDetail.result)">{{ execResultLbl(execDetail.result) }}</span></div>
          <div v-if="execDetail.notes"><span class="text-slate-400 block text-xs mb-0.5">备注</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ execDetail.notes }}</div></div>
        </div>
      </div>
    </div>

    <!-- 缺陷详情 -->
    <div v-if="showDefectDetail && defectDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showDefectDetail=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4"><h2 class="text-lg font-bold">缺陷详情</h2><button @click="showDefectDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button></div>
        <div class="space-y-4 text-sm">
          <div><span class="text-slate-400 block text-xs mb-0.5">缺陷名称</span><span class="font-medium">{{ defectDetail.name }}</span></div>
          <div v-if="defectDetail.description"><span class="text-slate-400 block text-xs mb-0.5">缺陷描述</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ defectDetail.description }}</div></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">关联用例</span><span>{{ defectDetail.test_case_name || '—' }}</span></div>
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-slate-400 block text-xs mb-0.5">严重程度</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="sevCls(defectDetail.severity)">{{ sevLbl(defectDetail.severity) }}</span></div>
            <div><span class="text-slate-400 block text-xs mb-0.5">优先级</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="defPrioCls(defectDetail.priority)">{{ defPrioLbl(defectDetail.priority) }}</span></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-slate-400 block text-xs mb-0.5">负责人</span><span>{{ defectDetail.assignee_name || '—' }}</span></div>
            <div><span class="text-slate-400 block text-xs mb-0.5">状态</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="defStatusCls(defectDetail.status)">{{ defStatusLbl(defectDetail.status) }}</span></div>
          </div>
          <div v-if="defectDetail.notes"><span class="text-slate-400 block text-xs mb-0.5">备注</span><div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 whitespace-pre-wrap">{{ defectDetail.notes }}</div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import request from '@/api/request'
import SmartDateInput from '@/components/SmartDateInput.vue'
import Pagination from '@/components/Pagination.vue'
import {
  getTestEnvironments, createTestEnvironment, updateTestEnvironment, deleteTestEnvironment,
  getTestCases, createTestCase, updateTestCase, deleteTestCase,
  getTestPlans, createTestPlan, updateTestPlan, deleteTestPlan,
  getTestExecutions, createTestExecution, updateTestExecution, deleteTestExecution,
  getTestDefects, createTestDefect, updateTestDefect, deleteTestDefect,
  getTestReport,
  ENV_STATUS_LABELS,
  CASE_TYPE_LABELS, CASE_PRIORITY_LABELS, CASE_STATUS_LABELS,
  EXEC_RESULT_LABELS,
  DEFECT_SEVERITY_LABELS, DEFECT_PRIORITY_LABELS, DEFECT_STATUS_LABELS,
} from '@/api/modules/testing'
import type {
  TestEnvironment, TestCase, TestPlan, TestExecution, TestDefect,
} from '@/api/modules/testing'

const projectStore = useProjectStore()
const toast = useToastStore()
const confirm = useConfirmStore()

// ── Tabs ──
const tabs = [
  { k: 'cases', l: '测试用例' }, { k: 'env', l: '测试环境' },
  { k: 'plans', l: '测试计划' }, { k: 'exec', l: '测试执行' },
  { k: 'defects', l: '测试缺陷' }, { k: 'report', l: '测试报告' },
]
const tab = ref('cases')

// ── Pagination ──
const page = ref(1), pageSize = ref(10), total = ref(0)

// ── Data ──
const caseItems = ref<TestCase[]>([])
const envItems = ref<TestEnvironment[]>([])
const planItems = ref<TestPlan[]>([])
const execItems = ref<TestExecution[]>([])
const defectItems = ref<TestDefect[]>([])
const orgMembers = ref<any[]>([])
const orgMembersWithUser = computed(() => orgMembers.value.filter((m: any) => m.user_id != null))

// ── Load functions ──
async function loadCases() {
  try {
    const r = await getTestCases({ page: page.value, page_size: pageSize.value, project: projectStore.activeProjectId || undefined })
    caseItems.value = r.data.results ?? []
    total.value = r.data.count ?? caseItems.value.length
  } catch { caseItems.value = [] }
}
async function loadEnvs() {
  try {
    const r = await getTestEnvironments({ page: page.value, page_size: pageSize.value, project: projectStore.activeProjectId || undefined })
    envItems.value = r.data.results ?? []
    total.value = r.data.count ?? envItems.value.length
  } catch { envItems.value = [] }
}
async function loadPlans() {
  try {
    const r = await getTestPlans({ page: page.value, page_size: pageSize.value, project: projectStore.activeProjectId || undefined })
    planItems.value = r.data.results ?? []
    total.value = r.data.count ?? planItems.value.length
  } catch { planItems.value = [] }
}
async function loadExecs() {
  try {
    const r = await getTestExecutions({ page: page.value, page_size: pageSize.value, project: projectStore.activeProjectId || undefined })
    execItems.value = r.data.results ?? []
    total.value = r.data.count ?? execItems.value.length
  } catch { execItems.value = [] }
}
async function loadDefects() {
  try {
    const r = await getTestDefects({ page: page.value, page_size: pageSize.value, project: projectStore.activeProjectId || undefined })
    defectItems.value = r.data.results ?? []
    total.value = r.data.count ?? defectItems.value.length
  } catch { defectItems.value = [] }
}

// ── Helper label/color functions ──
function caseTypeLbl(v: string) { return (CASE_TYPE_LABELS as any)[v] || v }
function casePrioLbl(v: string) { return (CASE_PRIORITY_LABELS as any)[v] || v }
function caseStatusLbl(v: string) { return (CASE_STATUS_LABELS as any)[v] || v }
function envStatusLbl(v: string) { return (ENV_STATUS_LABELS as any)[v] || v }
function execResultLbl(v: string) { return (EXEC_RESULT_LABELS as any)[v] || v }
function sevLbl(v: string) { return (DEFECT_SEVERITY_LABELS as any)[v] || v }
function defPrioLbl(v: string) { return (DEFECT_PRIORITY_LABELS as any)[v] || v }
function defStatusLbl(v: string) { return (DEFECT_STATUS_LABELS as any)[v] || v }

function casePrioCls(v: string) {
  return { p0: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', p1: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', p2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', p3: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' }[v] || ''
}
function caseStatusCls(v: string) {
  return { draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', inactive: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400', discarded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }[v] || ''
}
function envStatusCls(v: string) {
  return { planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', inactive: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400', discarded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }[v] || ''
}
function execResultCls(v: string) {
  return { pass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', fail: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', blocked: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', skipped: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' }[v] || ''
}
function sevCls(v: string) {
  return { fatal: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', serious: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', suggestion: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' }[v] || ''
}
function defPrioCls(v: string) {
  return { p0: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', p1: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', p2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', p3: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' }[v] || ''
}
function defStatusCls(v: string) {
  return { reproducing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', located: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', retesting: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', suspended: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400', resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }[v] || ''
}
function sevColor(v: string) {
  return { fatal: '#ef4444', serious: '#f97316', normal: '#3b82f6', suggestion: '#94a3b8' }[v] || '#94a3b8'
}

// ── Detail state ──
const showCaseDetail = ref(false), caseDetail = ref<any>(null)
const showEnvDetail = ref(false), envDetail = ref<any>(null)
const showPlanDetail = ref(false), planDetail = ref<any>(null)
const showExecDetail = ref(false), execDetail = ref<any>(null)
const showDefectDetail = ref(false), defectDetail = ref<any>(null)

function viewCaseDetail(r: any) { caseDetail.value = r; showCaseDetail.value = true }
function viewEnvDetail(r: any) { envDetail.value = r; showEnvDetail.value = true }
function viewPlanDetail(r: any) { planDetail.value = r; showPlanDetail.value = true }
function viewExecDetail(r: any) { execDetail.value = r; showExecDetail.value = true }
function viewDefectDetail(r: any) { defectDetail.value = r; showDefectDetail.value = true }

// ── Delete ──
async function doDelete(type: string, id: number) {
  const labels: Record<string, string> = { case: '用例', env: '环境', plan: '计划', exec: '执行', defect: '缺陷' }
  if (!(await confirm.show(`确认删除此${labels[type]||'记录'}？`))) return
  try {
    if (type === 'case') { await deleteTestCase(id); loadCases() }
    else if (type === 'env') { await deleteTestEnvironment(id); loadEnvs() }
    else if (type === 'plan') { await deleteTestPlan(id); loadPlans() }
    else if (type === 'exec') { await deleteTestExecution(id); loadExecs() }
    else if (type === 'defect') { await deleteTestDefect(id); loadDefects() }
    toast.show('删除成功', 'success')
  } catch { toast.show('删除失败', 'error') }
}

// ═══════════════════════════════════════════
//  测试环境 Form
// ═══════════════════════════════════════════
const showEnvForm = ref(false), envEditing = ref<any>(null)
const envForm = reactive<Record<string, any>>({ name: '', description: '', config_info: '', db_info: '', address_info: '', status: 'planned', notes: '' })

function openEnvForm(r: any) {
  envEditing.value = r
  if (r) { Object.assign(envForm, r) }
  else { Object.assign(envForm, { name: '', description: '', config_info: '', db_info: '', address_info: '', status: 'planned', notes: '' }) }
  showEnvForm.value = true
}
async function saveEnv() {
  if (!envForm.name?.trim()) { toast.show('请输入环境名称', 'error'); return }
  try {
    if (envEditing.value) { await updateTestEnvironment(envEditing.value.id, { ...envForm } as any) }
    else { await createTestEnvironment({ ...envForm, project: projectStore.activeProjectId } as any) }
    showEnvForm.value = false; toast.show('保存成功', 'success'); loadEnvs()
  } catch { toast.show('保存失败', 'error') }
}
async function toggleEnvStatus(r: TestEnvironment) {
  const newStatus = r.status === 'active' ? 'inactive' : 'active'
  try { await updateTestEnvironment(r.id, { status: newStatus } as any); toast.show(newStatus === 'active' ? '已启用' : '已停用', 'success'); loadEnvs() } catch { toast.show('操作失败', 'error') }
}
async function discardEnv(r: TestEnvironment) {
  if (!(await confirm.show(`确认废弃环境「${r.name}」？`))) return
  try { await updateTestEnvironment(r.id, { status: 'discarded' } as any); toast.show('已废弃', 'success'); loadEnvs() } catch { toast.show('操作失败', 'error') }
}
async function recoverEnv(r: TestEnvironment) {
  if (!(await confirm.show(`确认捡回环境「${r.name}」？`))) return
  try { await updateTestEnvironment(r.id, { status: 'planned' } as any); toast.show('已捡回', 'success'); loadEnvs() } catch { toast.show('操作失败', 'error') }
}

// ═══════════════════════════════════════════
//  测试用例 Form
// ═══════════════════════════════════════════
const showCaseForm = ref(false), caseEditing = ref<any>(null)
const caseForm = reactive<Record<string, any>>({ name: '', type: 'functional', module: '', test_steps: '', expected_result: '', requirement_baseline: null, related_requirements: [], priority: 'p2', status: 'active', notes: '' })
const caseDocFile = ref<File | null>(null)
const baselines = ref<any[]>([])
const baselineSearch = ref('')
const baselineReqs = ref<any[]>([])

const filteredBaselines = computed(() =>
  baselines.value.filter((bl: any) => !baselineSearch.value || bl.name.includes(baselineSearch.value) || bl.version.includes(baselineSearch.value))
)
function loadBaselinesForSearch() {
  request.get('/req-baselines/', { params: { page_size: 9999, project: projectStore.activeProjectId || undefined } })
    .then(r => { baselines.value = r.data.results ?? [] })
    .catch(() => { baselines.value = [] })
}
async function selectBaseline(bl: any) {
  caseForm.requirement_baseline = bl.id
  baselineSearch.value = bl.name + ' v' + bl.version
  try {
    const r = await request.get(`/req-baselines/${bl.id}/`)
    baselineReqs.value = r.data.requirements_data ?? []
  } catch { baselineReqs.value = [] }
}
function onCaseDocChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) caseDocFile.value = files[0]
}
function openCaseForm(r: any) {
  showReqPicker.value = false
  caseEditing.value = r
  caseDocFile.value = null
  if (r) {
    Object.assign(caseForm, { name: r.name, type: r.type, module: r.module, test_steps: r.test_steps, expected_result: r.expected_result, requirement_baseline: r.requirement_baseline, related_requirements: r.related_requirements || [], priority: r.priority, status: r.status, notes: r.notes })
    baselineSearch.value = r.baseline_name ? (r.baseline_name + ' v' + (r.baseline_version || '')) : ''
    if (r.requirement_baseline) {
      request.get(`/req-baselines/${r.requirement_baseline}/`).then(res => { baselineReqs.value = res.data.requirements_data ?? [] }).catch(() => {})
    }
  } else {
    Object.assign(caseForm, { name: '', type: 'functional', module: '', test_steps: '', expected_result: '', requirement_baseline: null, related_requirements: [], priority: 'p2', status: 'active', notes: '' })
    baselineSearch.value = ''
    baselineReqs.value = []
  }
  showCaseForm.value = true
  loadBaselinesForSearch()
}
async function saveCase() {
  if (!caseForm.name?.trim()) { toast.show('请输入用例名称', 'error'); return }
  const payload: Record<string, any> = { ...caseForm, project: projectStore.activeProjectId }
  try {
    if (caseEditing.value) {
      if (caseDocFile.value) {
        const fd = new FormData()
        for (const k of Object.keys(payload)) { fd.append(k, payload[k] ?? '') }
        fd.append('test_document', caseDocFile.value)
        await updateTestCase(caseEditing.value.id, fd)
      } else {
        await updateTestCase(caseEditing.value.id, payload as any)
      }
    } else {
      if (caseDocFile.value) {
        const fd = new FormData()
        for (const k of Object.keys(payload)) { fd.append(k, payload[k] ?? '') }
        fd.append('test_document', caseDocFile.value)
        await createTestCase(fd)
      } else {
        await createTestCase(payload as any)
      }
    }
    showCaseForm.value = false; toast.show('保存成功', 'success'); loadCases()
  } catch { toast.show('保存失败', 'error') }
}
async function toggleCaseStatus(r: TestCase) {
  const newStatus = r.status === 'active' ? 'inactive' : 'active'
  try { await updateTestCase(r.id, { status: newStatus } as any); toast.show(newStatus === 'active' ? '已启用' : '已停用', 'success'); loadCases() } catch { toast.show('操作失败', 'error') }
}
async function discardCase(r: TestCase) {
  if (!(await confirm.show(`确认废弃用例「${r.name}」？`))) return
  try { await updateTestCase(r.id, { status: 'discarded' } as any); toast.show('已废弃', 'success'); loadCases() } catch { toast.show('操作失败', 'error') }
}
async function recoverCase(r: TestCase) {
  if (!(await confirm.show(`确认捡回用例「${r.name}」？`))) return
  try { await updateTestCase(r.id, { status: 'draft' } as any); toast.show('已捡回', 'success'); loadCases() } catch { toast.show('操作失败', 'error') }
}

// ═══════════════════════════════════════════
//  测试计划 Form
// ═══════════════════════════════════════════
const showCasePicker = ref(false)
const showStakePicker = ref(false)
const showReqPicker = ref(false)
const showPlanForm = ref(false), planEditing = ref<any>(null)
const planForm = reactive<Record<string, any>>({ name: '', goal: '', start_date: '', end_date: '', test_case_ids: [], test_environment: null, assignee: null, stakeholder_ids: [], notes: '' })
const activeCases = ref<TestCase[]>([])
const activeEnvs = ref<TestEnvironment[]>([])

async function loadActiveCases() {
  try {
    const r = await getTestCases({ page_size: 9999, status: 'active', project: projectStore.activeProjectId || undefined })
    activeCases.value = r.data.results ?? []
  } catch { activeCases.value = [] }
}
async function loadActiveEnvs() {
  try {
    const r = await getTestEnvironments({ page_size: 9999, status: 'active', project: projectStore.activeProjectId || undefined })
    activeEnvs.value = r.data.results ?? []
  } catch { activeEnvs.value = [] }
}

function openPlanForm(r: any) {
  showCasePicker.value = false
  showStakePicker.value = false
  planEditing.value = r
  if (r) {
    Object.assign(planForm, {
      name: r.name, goal: r.goal || '', start_date: r.start_date || '', end_date: r.end_date || '',
      test_case_ids: r.test_case_ids || [], test_environment: r.test_environment,
      assignee: r.assignee, stakeholder_ids: r.stakeholder_ids || [], notes: r.notes || '',
    })
  } else {
    Object.assign(planForm, { name: '', goal: '', start_date: '', end_date: '', test_case_ids: [], test_environment: null, assignee: null, stakeholder_ids: [], notes: '' })
  }
  loadActiveCases(); loadActiveEnvs()
  showPlanForm.value = true
}
async function savePlan() {
  if (!planForm.name?.trim()) { toast.show('请输入计划名称', 'error'); return }
  try {
    const payload = { ...planForm, project: projectStore.activeProjectId }
    if (planEditing.value) { await updateTestPlan(planEditing.value.id, payload as any) }
    else { await createTestPlan(payload as any) }
    showPlanForm.value = false; toast.show('保存成功，已通知相关人员', 'success'); loadPlans()
  } catch { toast.show('保存失败', 'error') }
}
async function doExecute(r: TestPlan) {
  tab.value = 'exec'
  // 等待 exec tab 渲染后打开新建表单，带入计划数据
  await new Promise(r => setTimeout(r, 100))
  openExecForm(null, r)
}

// ═══════════════════════════════════════════
//  测试执行 Form
// ═══════════════════════════════════════════
const showExecForm = ref(false), execEditing = ref<any>(null)
const execForm = reactive<Record<string, any>>({ test_plan: null, test_case_ids: [], executor: null, execution_date: '', result: 'pass', notes: '' })
const execFromPlan = ref<any>(null) // Set when jumped from TestPlan
const planSearch = ref('')
const selectedPlanId = ref<number | null>(null)
const planTestCases = ref<TestCase[]>([])
const showTcPicker = ref(false)
const execEvidenceFile = ref<File | null>(null)

const filteredPlans = computed(() =>
  planItems.value.filter(p => !planSearch.value || p.name.includes(planSearch.value))
)

function openExecForm(r: any, fromPlan?: any) {
  showTcPicker.value = false
  execEditing.value = r
  execFromPlan.value = fromPlan || null
  execEvidenceFile.value = null
  if (fromPlan) {
    // Jumped from TestPlan execute button — 只带入计划名称，其他置空
    execForm.test_plan = fromPlan.id
    execForm.test_case_ids = []
    execForm.executor = null
    execForm.execution_date = new Date().toISOString().slice(0, 10)
    execForm.result = 'pass'
    execForm.notes = ''
    selectedPlanId.value = fromPlan.id
    planSearch.value = fromPlan.name
    loadPlanTestCases(fromPlan.id)
  } else if (r) {
    Object.assign(execForm, { test_plan: r.test_plan, test_case_ids: r.test_case ? [r.test_case] : [], executor: r.executor, execution_date: r.execution_date || '', result: r.result, notes: r.notes || '' })
    selectedPlanId.value = r.test_plan
    loadPlanTestCases(r.test_plan)
    planSearch.value = r.test_plan_name || ''
  } else {
    Object.assign(execForm, { test_plan: null, test_case_ids: [], executor: projectStore.activeProjectId ? null : null, execution_date: new Date().toISOString().slice(0, 10), result: 'pass', notes: '' })
    selectedPlanId.value = null
    planTestCases.value = []
    planSearch.value = ''
  }
  showExecForm.value = true
}
function selectExecPlan(p: TestPlan) {
  execForm.test_plan = p.id
  selectedPlanId.value = p.id
  planSearch.value = p.name
  loadPlanTestCases(p.id)
}
async function loadPlanTestCases(planId: number) {
  try {
    const r = await getTestCases({ page_size: 9999, test_plan: planId, project: projectStore.activeProjectId || undefined })
    planTestCases.value = r.data.results ?? []
  } catch { planTestCases.value = [] }
}
function onExecEvidenceChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) execEvidenceFile.value = files[0]
}
async function saveExec() {
  if (!execForm.test_plan) { toast.show('请选择测试计划', 'error'); return }
  if (!execForm.test_case_ids?.length) { toast.show('请选择关联用例', 'error'); return }
  try {
    if (execEditing.value) {
      const payload = { ...execForm, test_case: execForm.test_case_ids[0], project: projectStore.activeProjectId, execution_date: execForm.execution_date || undefined }
      await updateTestExecution(execEditing.value.id, payload as any)
    } else {
      for (const tcId of execForm.test_case_ids) {
        await createTestExecution({ test_plan: execForm.test_plan, test_case: tcId, executor: execForm.executor, execution_date: execForm.execution_date, result: execForm.result, notes: execForm.notes, project: projectStore.activeProjectId } as any)
      }
    }
    showExecForm.value = false; toast.show('保存成功', 'success'); loadExecs()
  } catch { toast.show('保存失败', 'error') }
}
async function reportDefectFromExec() {
  if (!execForm.test_plan) { toast.show('请先选择测试计划', 'error'); return }
  if (!execForm.test_case_ids?.length) { toast.show('请先选择关联用例', 'error'); return }
  // 先保存执行记录
  if (execEditing.value) {
    try {
      const payload = { ...execForm, test_case: execForm.test_case_ids[0], project: projectStore.activeProjectId, execution_date: execForm.execution_date || undefined }
      await updateTestExecution(execEditing.value.id, payload as any)
    } catch { toast.show('保存执行记录失败', 'error'); return }
  } else if (execForm.test_case_ids?.length) {
    try {
      for (const tcId of execForm.test_case_ids) {
        await createTestExecution({ test_plan: execForm.test_plan, test_case: tcId, executor: execForm.executor, execution_date: execForm.execution_date, result: execForm.result, notes: execForm.notes, project: projectStore.activeProjectId } as any)
      }
      loadExecs()
    } catch { toast.show('保存执行记录失败', 'error'); return }
  }
  showExecForm.value = false
  const firstTcId = execForm.test_case_ids?.[0]
  const tcName = planTestCases.value.find(tc => tc.id === firstTcId)?.name || ''
  defectFromExec.value = { test_case_id: firstTcId, test_case_name: tcName }
  tab.value = 'defects'
  setTimeout(() => openDefectForm(null), 100)
}
function reportDefectFromExecList(r: any) {
  defectFromExec.value = { test_case_id: r.test_case, test_case_name: r.test_case_name }
  tab.value = 'defects'
  setTimeout(() => openDefectForm(null), 100)
}

// ═══════════════════════════════════════════
//  测试缺陷 Form
// ═══════════════════════════════════════════
const showDefectForm = ref(false), defectEditing = ref<any>(null)
const defectForm = reactive<Record<string, any>>({ name: '', description: '', related_test_case: null, severity: 'normal', priority: 'p2', assignee: null, status: 'reproducing', notes: '' })
const defectFromExec = ref<any>(null) // Set when jumped from TestExecution
const caseSearch = ref('')
const allCases = ref<TestCase[]>([])

const filteredAllCases = computed(() =>
  allCases.value.filter(tc => !caseSearch.value || tc.name.includes(caseSearch.value))
)

function openDefectForm(r: any) {
  defectEditing.value = r
  if (r) {
    Object.assign(defectForm, { name: r.name, description: r.description || '', related_test_case: r.related_test_case, severity: r.severity, priority: r.priority, assignee: r.assignee, status: r.status, notes: r.notes || '' })
  } else if (defectFromExec.value) {
    Object.assign(defectForm, { name: '', description: '', related_test_case: defectFromExec.value.test_case_id, severity: 'normal', priority: 'p2', assignee: null, status: 'reproducing', notes: '' })
  } else {
    Object.assign(defectForm, { name: '', description: '', related_test_case: null, severity: 'normal', priority: 'p2', assignee: null, status: 'reproducing', notes: '' })
    caseSearch.value = ''
  }
  loadAllCases()
  showDefectForm.value = true
}
async function loadAllCases() {
  try {
    const r = await getTestCases({ page_size: 9999, project: projectStore.activeProjectId || undefined })
    allCases.value = r.data.results ?? []
  } catch { allCases.value = [] }
}
function selectDefectCase(tc: TestCase) {
  defectForm.related_test_case = tc.id
  caseSearch.value = tc.name
}
async function saveDefect() {
  if (!defectForm.name?.trim()) { toast.show('请输入缺陷名称', 'error'); return }
  try {
    const payload = { ...defectForm, project: projectStore.activeProjectId }
    if (defectEditing.value) { await updateTestDefect(defectEditing.value.id, payload as any) }
    else { await createTestDefect(payload as any) }
    showDefectForm.value = false; defectFromExec.value = null
    toast.show('保存成功，已通知相关负责人', 'success'); loadDefects()
  } catch { toast.show('保存失败', 'error') }
}

// ═══════════════════════════════════════════
//  测试报告
// ═══════════════════════════════════════════
const reportData = ref<any>(null)

const execTotal = computed(() => reportData.value?.test_executions?.total || 0)
const execSegments = computed(() => {
  const byResult = reportData.value?.test_executions?.by_result || []
  const total = execTotal.value || 1
  const colors: Record<string, string> = { pass: '#22c55e', fail: '#ef4444', blocked: '#eab308', skipped: '#94a3b8' }
  const labels: Record<string, string> = { pass: '通过', fail: '失败', blocked: '阻塞', skipped: '跳过' }
  return byResult.map((r: any) => ({
    result: r.result, count: r.count, label: labels[r.result] || r.result,
    pct: (r.count / total) * 100, color: colors[r.result] || '#94a3b8',
  }))
})
const passCount = computed(() => reportData.value?.test_executions?.by_result?.find((r: any) => r.result === 'pass')?.count || 0)
const failCount = computed(() => reportData.value?.test_executions?.by_result?.find((r: any) => r.result === 'fail')?.count || 0)
const blockedCount = computed(() => reportData.value?.test_executions?.by_result?.find((r: any) => r.result === 'blocked')?.count || 0)
const skippedCount = computed(() => reportData.value?.test_executions?.by_result?.find((r: any) => r.result === 'skipped')?.count || 0)
const passRate = computed(() => {
  const total = passCount.value + failCount.value + blockedCount.value + skippedCount.value
  return total ? Math.round((passCount.value / total) * 100) : 0
})
const passOffset = computed(() => {
  return 263.9 - (263.9 * passRate.value / 100) // circumference = 2 * pi * 42
})
const defectTotal = computed(() => reportData.value?.defects?.total || 0)
const defectOpen = computed(() => reportData.value?.defects?.open || 0)
const defectBySev = computed(() => reportData.value?.defects?.by_severity || [])
const defectByStatus = computed(() => reportData.value?.defects?.by_status || [])

async function loadReport() {
  if (!projectStore.activeProjectId) { reportData.value = null; return }
  try {
    const r = await getTestReport(projectStore.activeProjectId)
    reportData.value = r.data
  } catch { reportData.value = null }
}

// ── Load org members ──
async function loadOrgMembers() {
  try {
    const r = await request.get('/org-members/', { params: { page_size: 9999, project: projectStore.activeProjectId || undefined } })
    orgMembers.value = r.data.results ?? []
  } catch { orgMembers.value = [] }
}

// ── Watch tab changes ──
watch(tab, (v) => {
  page.value = 1
  if (v === 'cases') loadCases()
  else if (v === 'env') loadEnvs()
  else if (v === 'plans') loadPlans()
  else if (v === 'exec') loadExecs()
  else if (v === 'defects') loadDefects()
  else if (v === 'report') loadReport()
})

onMounted(async () => {
  await loadOrgMembers()
  loadCases()
})
</script>
