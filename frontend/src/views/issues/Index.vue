<template>
  <div>
    <h1 class="text-xl font-bold mb-4">问题风险模块</h1>
    <div class="flex gap-2 mb-4 flex-wrap">
      <button v-for="t in tabs" :key="t.k" :class="tab===t.k?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab=t.k">{{ t.l }}</button>
      <div class="flex-1"></div>
      <button v-if="tab==='issues'" @click="openIssueForm(null)" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">＋ 新建问题</button>
      <button v-if="tab==='risks'" @click="openRiskForm(null)" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">＋ 新建风险</button>
    </div>

    <!-- ════════════════════ 问题管理 ════════════════════ -->
    <div v-if="tab==='issues'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th class="text-left py-3 px-3 font-medium">问题标题</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">类型</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">严重程度</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">优先级</th>
            <th class="text-left py-3 px-3 font-medium hidden md:table-cell">负责人</th>
            <th class="text-left py-3 px-3 font-medium">状态</th>
            <th class="text-right py-3 px-3 font-medium">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in issueItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td class="py-3 px-3 font-medium">{{ r.title }}</td>
              <td class="py-3 px-3 hidden sm:table-cell">{{ ISSUE_TYPE_LABELS[r.issue_type] || r.issue_type }}</td>
              <td class="py-3 px-3 hidden sm:table-cell"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="severityClass(r.severity)">{{ SEVERITY_LABELS[r.severity] }}</span></td>
              <td class="py-3 px-3 hidden sm:table-cell"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="priorityClass(r.priority)">{{ PRIORITY_LABELS[r.priority] }}</span></td>
              <td class="py-3 px-3 hidden md:table-cell">{{ r.assignee_name || '—' }}</td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="issueStatusClass(r.status)">{{ ISSUE_STATUS_LABELS[r.status] }}</span></td>
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <div class="flex gap-1 justify-end whitespace-nowrap">
                  <button @click="viewIssueDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                  <button @click="openIssueForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                  <button v-if="r.status!=='closed'" @click="doReportRisk(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400">报告风险</button>
                  <button @click="doDeleteIssue(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="issueItems.length===0"><td colspan="7" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无问题数据</span></td></tr>
          </tbody>
        </table>
      </div>
      <Pagination :page="issuePage" :page-size="issuePageSize" :total="issueTotal" @update:page="issuePage=$event; loadIssues()" @update:page-size="issuePageSize=$event; issuePage=1; loadIssues()" />
    </div>

    <!-- ════════════════════ 风险管理 ════════════════════ -->
    <div v-if="tab==='risks'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th class="text-left py-3 px-3 font-medium">风险标题</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">类别</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">概率</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">风险等级</th>
            <th class="text-left py-3 px-3 font-medium hidden md:table-cell">负责人</th>
            <th class="text-left py-3 px-3 font-medium">状态</th>
            <th class="text-right py-3 px-3 font-medium">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in riskItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td class="py-3 px-3 font-medium">{{ r.title }}</td>
              <td class="py-3 px-3 hidden sm:table-cell">{{ RISK_CATEGORY_LABELS[r.category] || r.category }}</td>
              <td class="py-3 px-3 hidden sm:table-cell">{{ PROBABILITY_LABELS[r.probability] || r.probability }}</td>
              <td class="py-3 px-3 hidden sm:table-cell"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="riskLevelClass(r.risk_level)">{{ RISK_LEVEL_LABELS[r.risk_level] || r.risk_level }}</span></td>
              <td class="py-3 px-3 hidden md:table-cell">{{ r.assignee_name || '—' }}</td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="riskStatusClass(r.status)">{{ RISK_STATUS_LABELS[r.status] }}</span></td>
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <div class="flex gap-1 justify-end whitespace-nowrap">
                  <button @click="viewRiskDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                  <button @click="openRiskForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                  <button @click="doConvertToIssue(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400">转为问题</button>
                  <button @click="doDeleteRisk(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="riskItems.length===0"><td colspan="7" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无风险数据</span></td></tr>
          </tbody>
        </table>
      </div>
      <Pagination :page="riskPage" :page-size="riskPageSize" :total="riskTotal" @update:page="riskPage=$event; loadRisks()" @update:page-size="riskPageSize=$event; riskPage=1; loadRisks()" />
    </div>

    <!-- ════════════════════ 监控看板 ════════════════════ -->
    <div v-if="tab==='dashboard'">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="text-xs text-slate-400 mb-1">问题总数</div>
          <div class="text-2xl font-bold">{{ dashIssueTotal }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="text-xs text-slate-400 mb-1">未关闭问题</div>
          <div class="text-2xl font-bold text-orange-600">{{ dashIssueOpen }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="text-xs text-slate-400 mb-1">风险总数</div>
          <div class="text-2xl font-bold">{{ dashRiskTotal }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="text-xs text-slate-400 mb-1">高风险及以上</div>
          <div class="text-2xl font-bold text-red-600">{{ dashRiskHigh }}</div>
        </div>
      </div>

      <!-- 严重程度分布 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <h3 class="text-sm font-semibold mb-3">问题严重程度分布</h3>
        <div v-if="dashIssueBySeverity.length===0" class="text-sm text-slate-400 py-4 text-center">暂无数据</div>
        <div v-else class="space-y-2">
          <div v-for="s in dashIssueBySeverity" :key="s.key" class="flex items-center gap-3">
            <span class="text-xs w-12 text-slate-500">{{ SEVERITY_LABELS[s.key] }}</span>
            <div class="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3">
              <div class="h-3 rounded-full" :class="severityBarColor(s.key)" :style="{width: dashIssueMaxSeverity>0 ? (s.count/dashIssueMaxSeverity*100)+'%' : '0%'}"></div>
            </div>
            <span class="text-xs font-medium w-8 text-right">{{ s.count }}</span>
          </div>
        </div>
      </div>

      <!-- 风险等级分布 + 最新列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 class="text-sm font-semibold mb-3">风险等级分布</h3>
          <div v-if="dashRiskByLevel.length===0" class="text-sm text-slate-400 py-4 text-center">暂无数据</div>
          <div v-else class="space-y-2">
            <div v-for="l in dashRiskByLevel" :key="l.key" class="flex items-center gap-3">
              <span class="text-xs w-12 text-slate-500">{{ RISK_LEVEL_LABELS[l.key] }}</span>
              <div class="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                <div class="h-3 rounded-full" :class="riskLevelBarColor(l.key)" :style="{width: dashRiskMaxLevel>0 ? (l.count/dashRiskMaxLevel*100)+'%' : '0%'}"></div>
              </div>
              <span class="text-xs font-medium w-8 text-right">{{ l.count }}</span>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 class="text-sm font-semibold mb-3">最新动态</h3>
          <div v-if="dashLatest.length===0" class="text-sm text-slate-400 py-4 text-center">暂无动态</div>
          <div v-else class="space-y-3">
            <div v-for="item in dashLatest" :key="item.id" class="flex items-start gap-3 text-sm border-b border-slate-100 dark:border-slate-700/50 pb-2 last:border-0">
              <span class="text-lg mt-0.5">{{ item.kind==='issue'?'⚠️':'🔴' }}</span>
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ item.title }}</div>
                <div class="text-xs text-slate-400 mt-0.5">
                  <span class="px-1.5 py-0.5 rounded text-xs font-medium" :class="item.kind==='issue'?issueStatusClass(item.status):riskStatusClass(item.status)">{{ item.kind==='issue'?ISSUE_STATUS_LABELS[item.status]:RISK_STATUS_LABELS[item.status] }}</span>
                  <span class="ml-2">{{ item.created_at?.slice(0,16) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════ 问题表单弹窗 ════════════════════ -->
    <div v-if="showIssueForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showIssueForm=false">
      <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ issueEditing ? '编辑问题' : '新建问题' }}</h2>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">问题标题 *</label><input v-model="issueForm.title" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">问题描述</label><textarea v-model="issueForm.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">问题类型</label>
            <select v-model="issueForm.issue_type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in ISSUE_TYPE_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">严重程度</label>
            <select v-model="issueForm.severity" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in SEVERITY_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">优先级</label>
            <select v-model="issueForm.priority" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in PRIORITY_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">问题来源</label>
            <select v-model="issueForm.source" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in SOURCE_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">报告人</label>
            <select v-model="issueForm.reporter" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="u in orgMembersWithUser" :key="u.user_id" :value="u.user_id">{{ u.name }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">负责人</label>
            <select v-model="issueForm.assignee" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="u in orgMembersWithUser" :key="u.user_id" :value="u.user_id">{{ u.name }}</option>
            </select>
          </div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">干系人</label>
            <div class="flex flex-wrap gap-2 p-2 border border-slate-300 dark:border-slate-600 rounded-lg min-h-[42px] bg-white dark:bg-slate-700">
              <span v-for="u in selectedIssueStakeholders" :key="u.user_id" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {{ u.name }}
                <button @click="removeIssueStakeholder(u)" class="hover:text-red-500">&times;</button>
              </span>
              <div class="relative" data-picker="stakeholder">
                <input v-model="issueStakeholderSearch" placeholder="搜索添加干系人..." class="text-sm border-0 outline-none bg-transparent min-w-[120px]" @focus="issueStakeholderOpen=true" @input="issueStakeholderOpen=true" />
                <div v-if="issueStakeholderOpen && filteredIssueMembers.length" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                  <button v-for="u in filteredIssueMembers" :key="u.user_id" class="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700" @click="addIssueStakeholder(u)">{{ u.name }}</button>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">期望解决日期</label><SmartDateInput v-model="issueForm.expected_resolution_date" /></div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">问题状态</label>
            <select v-model="issueForm.status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in ISSUE_STATUS_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">解决方案</label><textarea v-model="issueForm.resolution" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">上传文档或截图</label><input type="file" @change="onIssueFileChange" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" /></div>
          <div v-if="issueForm.attachment_url" class="col-span-2 text-xs text-blue-600">当前附件：{{ issueForm.attachment_url }}</div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showIssueForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveIssue" :disabled="issueSaving" class="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{{ issueSaving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- ════════════════════ 问题详情弹窗 ════════════════════ -->
    <div v-if="showIssueDetail && issueDetailItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showIssueDetail=false">
      <div class="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold">问题详情</h2>
          <button @click="showIssueDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">问题标题</span><span class="font-medium">{{ issueDetailItem.title }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">问题描述</span><span class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{{ issueDetailItem.description || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">问题类型</span><span>{{ ISSUE_TYPE_LABELS[issueDetailItem.issue_type] || issueDetailItem.issue_type }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">严重程度</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="severityClass(issueDetailItem.severity)">{{ SEVERITY_LABELS[issueDetailItem.severity] }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">优先级</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="priorityClass(issueDetailItem.priority)">{{ PRIORITY_LABELS[issueDetailItem.priority] }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">问题来源</span><span>{{ SOURCE_LABELS[issueDetailItem.source] || issueDetailItem.source }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">报告人</span><span>{{ issueDetailItem.reporter_name || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">负责人</span><span>{{ issueDetailItem.assignee_name || '—' }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">干系人</span><span>{{ (issueDetailItem.stakeholder_names||[]).join('、') || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">期望解决日期</span><span>{{ issueDetailItem.expected_resolution_date || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">问题状态</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="issueStatusClass(issueDetailItem.status)">{{ ISSUE_STATUS_LABELS[issueDetailItem.status] }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">解决方案</span><span class="whitespace-pre-wrap">{{ issueDetailItem.resolution || '—' }}</span></div>
          <div v-if="issueDetailItem.attachment_url" class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">附件</span><a :href="issueDetailItem.attachment_url" target="_blank" class="text-blue-600 underline text-xs">查看附件</a></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">创建时间</span><span class="text-xs">{{ formatDT(issueDetailItem.created_at) }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">更新时间</span><span class="text-xs">{{ formatDT(issueDetailItem.updated_at) }}</span></div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showIssueDetail=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">关闭</button>
        </div>
      </div>
    </div>

    <!-- ════════════════════ 风险表单弹窗 ════════════════════ -->
    <div v-if="showRiskForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showRiskForm=false">
      <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ riskEditing ? '编辑风险' : '新建风险' }}</h2>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">风险标题 *</label><input v-model="riskForm.title" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">风险描述</label><textarea v-model="riskForm.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">风险类别</label>
            <select v-model="riskForm.category" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in RISK_CATEGORY_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">发生概率</label>
            <select v-model="riskForm.probability" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" @change="autoCalcRiskLevel">
              <option v-for="(l,k) in PROBABILITY_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">影响程度</label>
            <select v-model="riskForm.impact" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" @change="autoCalcRiskLevel">
              <option v-for="(l,k) in IMPACT_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">风险等级</label>
            <div class="flex gap-2 items-center">
              <select v-model="riskForm.risk_level" class="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
                <option v-for="(l,k) in RISK_LEVEL_LABELS" :key="k" :value="k">{{ l }}</option>
              </select>
              <button @click="autoCalcRiskLevel" class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600" title="自动计算">🔄</button>
            </div>
          </div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">早期征兆</label><textarea v-model="riskForm.early_signs" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">应对策略</label>
            <select v-model="riskForm.strategy" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in STRATEGY_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">风险状态</label>
            <select v-model="riskForm.status" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in RISK_STATUS_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">应对计划</label><textarea v-model="riskForm.response_plan" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">报告人</label>
            <select v-model="riskForm.reporter" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="u in orgMembersWithUser" :key="u.user_id" :value="u.user_id">{{ u.name }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">负责人</label>
            <select v-model="riskForm.assignee" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="u in orgMembersWithUser" :key="u.user_id" :value="u.user_id">{{ u.name }}</option>
            </select>
          </div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">干系人</label>
            <div class="flex flex-wrap gap-2 p-2 border border-slate-300 dark:border-slate-600 rounded-lg min-h-[42px] bg-white dark:bg-slate-700">
              <span v-for="u in selectedRiskStakeholders" :key="u.user_id" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {{ u.name }}
                <button @click="removeRiskStakeholder(u)" class="hover:text-red-500">&times;</button>
              </span>
              <div class="relative" data-picker="stakeholder">
                <input v-model="riskStakeholderSearch" placeholder="搜索添加干系人..." class="text-sm border-0 outline-none bg-transparent min-w-[120px]" @focus="riskStakeholderOpen=true" @input="riskStakeholderOpen=true" />
                <div v-if="riskStakeholderOpen && filteredRiskMembers.length" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                  <button v-for="u in filteredRiskMembers" :key="u.user_id" class="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700" @click="addRiskStakeholder(u)">{{ u.name }}</button>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">上传文档或截图</label><input type="file" @change="onRiskFileChange" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" /></div>
          <div v-if="riskForm.attachment_url" class="col-span-2 text-xs text-blue-600">当前附件：{{ riskForm.attachment_url }}</div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showRiskForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveRisk" :disabled="riskSaving" class="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{{ riskSaving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- ════════════════════ 风险详情弹窗 ════════════════════ -->
    <div v-if="showRiskDetail && riskDetailItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showRiskDetail=false">
      <div class="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold">风险详情</h2>
          <button @click="showRiskDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">风险标题</span><span class="font-medium">{{ riskDetailItem.title }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">风险描述</span><span class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{{ riskDetailItem.description || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">风险类别</span><span>{{ RISK_CATEGORY_LABELS[riskDetailItem.category] || riskDetailItem.category }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">发生概率</span><span>{{ PROBABILITY_LABELS[riskDetailItem.probability] }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">影响程度</span><span>{{ IMPACT_LABELS[riskDetailItem.impact] }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">风险等级</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="riskLevelClass(riskDetailItem.risk_level)">{{ RISK_LEVEL_LABELS[riskDetailItem.risk_level] }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">早期征兆</span><span class="whitespace-pre-wrap">{{ riskDetailItem.early_signs || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">应对策略</span><span>{{ STRATEGY_LABELS[riskDetailItem.strategy] || riskDetailItem.strategy }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">风险状态</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="riskStatusClass(riskDetailItem.status)">{{ RISK_STATUS_LABELS[riskDetailItem.status] }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">应对计划</span><span class="whitespace-pre-wrap">{{ riskDetailItem.response_plan || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">报告人</span><span>{{ riskDetailItem.reporter_name || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">负责人</span><span>{{ riskDetailItem.assignee_name || '—' }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">干系人</span><span>{{ (riskDetailItem.stakeholder_names||[]).join('、') || '—' }}</span></div>
          <div v-if="riskDetailItem.attachment_url" class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">附件</span><a :href="riskDetailItem.attachment_url" target="_blank" class="text-blue-600 underline text-xs">查看附件</a></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">创建时间</span><span class="text-xs">{{ formatDT(riskDetailItem.created_at) }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">更新时间</span><span class="text-xs">{{ formatDT(riskDetailItem.updated_at) }}</span></div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showRiskDetail=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">关闭</button>
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
import Pagination from '@/components/Pagination.vue'
import SmartDateInput from '@/components/SmartDateInput.vue'
import {
  getIssues, createIssue, updateIssue, deleteIssue,
  getRisks, createRisk, updateRisk, deleteRisk,
  ISSUE_TYPE_LABELS, SEVERITY_LABELS, PRIORITY_LABELS, SOURCE_LABELS,
  ISSUE_STATUS_LABELS, RISK_CATEGORY_LABELS, PROBABILITY_LABELS, IMPACT_LABELS,
  RISK_LEVEL_LABELS, STRATEGY_LABELS, RISK_STATUS_LABELS,
  severityClass, priorityClass, issueStatusClass, riskLevelClass, riskStatusClass,
} from '@/api/modules/issues_risks'
import type { Issue, Risk } from '@/api/modules/issues_risks'

const projectStore = useProjectStore()
const toast = useToastStore()
const confirm = useConfirmStore()

const tabs = [
  { k: 'issues', l: '问题管理' },
  { k: 'risks', l: '风险管理' },
  { k: 'dashboard', l: '监控看板' },
]
const tab = ref('issues')

// ── 组织成员 ──
const orgMembers = ref<any[]>([])
const orgMembersWithUser = computed(() => orgMembers.value.filter((m: any) => m.user_id != null))

async function loadOrgMembers() {
  try {
    const r = await request.get('/org-members/', { params: { page_size: 9999, project: projectStore.activeProjectId || undefined } })
    orgMembers.value = r.data.results ?? []
  } catch { orgMembers.value = [] }
}

// ═══════════════════════════════ 问题管理 ═══════════════════════════════
const issueItems = ref<Issue[]>([])
const issuePage = ref(1)
const issuePageSize = ref(10)
const issueTotal = ref(0)
const issueLoading = ref(false)

const showIssueForm = ref(false)
const issueEditing = ref<Issue | null>(null)
const issueSaving = ref(false)
const issueFile = ref<File | null>(null)

const showIssueDetail = ref(false)
const issueDetailItem = ref<Issue | null>(null)

const defaultIssueForm = {
  project: null as number | null,
  title: '', description: '',
  issue_type: 'other', severity: 'normal', priority: 'medium', source: 'other',
  reporter: null as number | null, assignee: null as number | null,
  expected_resolution_date: '',
  status: 'new', resolution: '',
  attachment_url: null as string | null,
}
const issueForm = reactive({ ...defaultIssueForm })

// 干系人选择
const issueStakeholderSearch = ref('')
const issueStakeholderOpen = ref(false)
const selectedIssueStakeholders = ref<any[]>([])

const filteredIssueMembers = computed(() => {
  const ids = new Set(selectedIssueStakeholders.value.map(u => u.user_id))
  const q = issueStakeholderSearch.value.trim().toLowerCase()
  return orgMembers.value.filter((u: any) => !ids.has(u.user_id) && (!q || u.name.includes(q)))
})

function addIssueStakeholder(u: any) {
  selectedIssueStakeholders.value.push(u)
  issueStakeholderSearch.value = ''
  issueStakeholderOpen.value = false
}
function removeIssueStakeholder(u: any) {
  selectedIssueStakeholders.value = selectedIssueStakeholders.value.filter(x => x.user_id !== u.user_id)
}

async function loadIssues() {
  issueLoading.value = true
  try {
    const params: Record<string, any> = { page: issuePage.value, page_size: issuePageSize.value, project: projectStore.activeProjectId || undefined }
    const r = await getIssues(params)
    issueItems.value = r.data.results ?? []
    issueTotal.value = r.data.count ?? issueItems.value.length
  } catch { issueItems.value = [] }
  finally { issueLoading.value = false }
}

function openIssueForm(r: Issue | null) {
  issueEditing.value = r
  issueFile.value = null
  selectedIssueStakeholders.value = []
  if (r) {
    Object.assign(issueForm, r)
    if (r.stakeholder_names && r.stakeholders) {
      selectedIssueStakeholders.value = orgMembers.value.filter((u: any) => (r.stakeholders as any)?.includes(u.user_id))
    }
  } else {
    Object.assign(issueForm, { ...defaultIssueForm, project: projectStore.activeProjectId })
  }
  showIssueForm.value = true
}

function onIssueFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) issueFile.value = files[0]
}

async function saveIssue() {
  if (!issueForm.title) { toast.show('请填写问题标题'); return }
  issueSaving.value = true
  try {
    const payload: Record<string, any> = { ...issueForm }
    payload.stakeholder_ids = selectedIssueStakeholders.value.map((u: any) => u.user_id)
    payload.project = projectStore.activeProjectId

    if (issueFile.value) {
      const fd = new FormData()
      for (const k of Object.keys(payload)) { fd.append(k, payload[k] ?? '') }
      fd.append('attachment', issueFile.value)
      if (issueEditing.value) {
        await updateIssue(issueEditing.value.id, fd)
      } else {
        await createIssue(fd)
      }
    } else {
      if (issueEditing.value) {
        await updateIssue(issueEditing.value.id, payload as any)
      } else {
        await createIssue(payload as any)
      }
    }
    showIssueForm.value = false
    toast.show('保存成功', 'success')
    loadIssues()
  } catch (e: any) {
    const data = e?.response?.data
    let msg = '保存失败'
    if (data) {
      if (typeof data === 'string') msg = data
      else if (typeof data === 'object') msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('；') : v}`).join(' | ')
    }
    toast.show(msg)
  }
  finally { issueSaving.value = false }
}

function viewIssueDetail(r: Issue) {
  issueDetailItem.value = r
  showIssueDetail.value = true
}

async function doDeleteIssue(r: Issue) {
  if (!(await confirm.show(`确认删除问题「${r.title}」？此操作不可撤销。`))) return
  try { await deleteIssue(r.id); toast.show('删除成功', 'success'); loadIssues() } catch { toast.show('删除失败', 'error') }
}

function doReportRisk(r: Issue) {
  // 切换到风险管理标签并预填表单
  tab.value = 'risks'
  selectedRiskStakeholders.value = []
  Object.assign(riskForm, {
    ...defaultRiskForm,
    project: projectStore.activeProjectId,
    title: `[来自问题] ${r.title}`,
    description: r.description || '',
    reporter: r.reporter,
    assignee: r.assignee,
  })
  if (r.stakeholders?.length) {
    selectedRiskStakeholders.value = orgMembers.value.filter((u: any) => (r.stakeholders as any)?.includes(u.user_id))
  }
  autoCalcRiskLevel()
  riskEditing.value = null
  riskFile.value = null
  showRiskForm.value = true
}

// ═══════════════════════════════ 风险管理 ═══════════════════════════════
const riskItems = ref<Risk[]>([])
const riskPage = ref(1)
const riskPageSize = ref(10)
const riskTotal = ref(0)
const riskLoading = ref(false)

const showRiskForm = ref(false)
const riskEditing = ref<Risk | null>(null)
const riskSaving = ref(false)
const riskFile = ref<File | null>(null)

const showRiskDetail = ref(false)
const riskDetailItem = ref<Risk | null>(null)

const defaultRiskForm = {
  project: null as number | null,
  title: '', description: '',
  category: 'other', probability: 'medium', impact: 'normal', risk_level: '',
  early_signs: '', strategy: 'accept', response_plan: '',
  reporter: null as number | null, assignee: null as number | null,
  status: 'new',
  attachment_url: null as string | null,
}
const riskForm = reactive({ ...defaultRiskForm })

// 干系人选择
const riskStakeholderSearch = ref('')
const riskStakeholderOpen = ref(false)
const selectedRiskStakeholders = ref<any[]>([])

const filteredRiskMembers = computed(() => {
  const ids = new Set(selectedRiskStakeholders.value.map(u => u.user_id))
  const q = riskStakeholderSearch.value.trim().toLowerCase()
  return orgMembers.value.filter((u: any) => !ids.has(u.user_id) && (!q || u.name.includes(q)))
})

function addRiskStakeholder(u: any) {
  selectedRiskStakeholders.value.push(u)
  riskStakeholderSearch.value = ''
  riskStakeholderOpen.value = false
}
function removeRiskStakeholder(u: any) {
  selectedRiskStakeholders.value = selectedRiskStakeholders.value.filter(x => x.user_id !== u.user_id)
}

// ── 工具函数 ──
function formatDT(s: string | null | undefined): string {
  if (!s) return '—'
  return s.slice(0, 16).replace('T', ' ')
}

// 风险等级自动计算（前端辅助）
const PROB_WEIGHTS: Record<string, number> = { very_high: 5, high: 4, medium: 3, low: 2, very_low: 1 }
const IMPACT_WEIGHTS: Record<string, number> = { fatal: 5, serious: 4, normal: 3, slight: 2 }

function autoCalcRiskLevel() {
  const pw = PROB_WEIGHTS[riskForm.probability] || 3
  const iw = IMPACT_WEIGHTS[riskForm.impact] || 3
  const score = pw * iw
  if (score >= 20) riskForm.risk_level = 'extreme'
  else if (score >= 12) riskForm.risk_level = 'high'
  else if (score >= 6) riskForm.risk_level = 'medium'
  else riskForm.risk_level = 'low'
}

async function loadRisks() {
  riskLoading.value = true
  try {
    const params: Record<string, any> = { page: riskPage.value, page_size: riskPageSize.value, project: projectStore.activeProjectId || undefined }
    const r = await getRisks(params)
    riskItems.value = r.data.results ?? []
    riskTotal.value = r.data.count ?? riskItems.value.length
  } catch { riskItems.value = [] }
  finally { riskLoading.value = false }
}

function openRiskForm(r: Risk | null) {
  riskEditing.value = r
  riskFile.value = null
  selectedRiskStakeholders.value = []
  if (r) {
    Object.assign(riskForm, r)
    if (r.stakeholder_names && r.stakeholders) {
      selectedRiskStakeholders.value = orgMembers.value.filter((u: any) => (r.stakeholders as any)?.includes(u.user_id))
    }
  } else {
    Object.assign(riskForm, { ...defaultRiskForm, project: projectStore.activeProjectId, risk_level: '' })
    autoCalcRiskLevel()
  }
  showRiskForm.value = true
}

function onRiskFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) riskFile.value = files[0]
}

async function saveRisk() {
  if (!riskForm.title) { toast.show('请填写风险标题'); return }
  riskSaving.value = true
  try {
    const payload: Record<string, any> = { ...riskForm }
    payload.stakeholder_ids = selectedRiskStakeholders.value.map((u: any) => u.user_id)
    payload.project = projectStore.activeProjectId

    if (riskFile.value) {
      const fd = new FormData()
      for (const k of Object.keys(payload)) { fd.append(k, payload[k] ?? '') }
      fd.append('attachment', riskFile.value)
      if (riskEditing.value) {
        await updateRisk(riskEditing.value.id, fd)
      } else {
        await createRisk(fd)
      }
    } else {
      if (riskEditing.value) {
        await updateRisk(riskEditing.value.id, payload as any)
      } else {
        await createRisk(payload as any)
      }
    }
    showRiskForm.value = false
    toast.show('保存成功', 'success')
    loadRisks()
  } catch (e: any) {
    const data = e?.response?.data
    let msg = '保存失败'
    if (data) {
      if (typeof data === 'string') msg = data
      else if (typeof data === 'object') msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('；') : v}`).join(' | ')
    }
    toast.show(msg)
  }
  finally { riskSaving.value = false }
}

function viewRiskDetail(r: Risk) {
  riskDetailItem.value = r
  showRiskDetail.value = true
}

async function doDeleteRisk(r: Risk) {
  if (!(await confirm.show(`确认删除风险「${r.title}」？此操作不可撤销。`))) return
  try { await deleteRisk(r.id); toast.show('删除成功', 'success'); loadRisks() } catch { toast.show('删除失败', 'error') }
}

function doConvertToIssue(r: Risk) {
  // 切换到问题管理标签并预填表单
  tab.value = 'issues'
  selectedIssueStakeholders.value = []
  Object.assign(issueForm, {
    ...defaultIssueForm,
    project: projectStore.activeProjectId,
    title: `[来自风险] ${r.title}`,
    description: r.description || '',
    reporter: r.reporter,
    assignee: r.assignee,
  })
  if (r.stakeholders?.length) {
    selectedIssueStakeholders.value = orgMembers.value.filter((u: any) => (r.stakeholders as any)?.includes(u.user_id))
  }
  issueEditing.value = null
  issueFile.value = null
  showIssueForm.value = true
}

// ═══════════════════════════════ 监控看板 ═══════════════════════════════
const allIssues = ref<Issue[]>([])
const allRisks = ref<Risk[]>([])

const dashIssueTotal = computed(() => allIssues.value.length)
const dashIssueOpen = computed(() => allIssues.value.filter(r => r.status !== 'closed').length)
const dashRiskTotal = computed(() => allRisks.value.length)
const dashRiskHigh = computed(() => allRisks.value.filter(r => r.risk_level === 'extreme' || r.risk_level === 'high').length)

const dashIssueBySeverity = computed(() => {
  const map: Record<string, number> = { fatal: 0, serious: 0, normal: 0, tip: 0 }
  allIssues.value.forEach(r => { map[r.severity] = (map[r.severity] || 0) + 1 })
  return Object.entries(map).map(([key, count]) => ({ key, count }))
})
const dashIssueMaxSeverity = computed(() => Math.max(...dashIssueBySeverity.value.map(s => s.count), 1))

const dashRiskByLevel = computed(() => {
  const map: Record<string, number> = { extreme: 0, high: 0, medium: 0, low: 0 }
  allRisks.value.forEach(r => { map[r.risk_level] = (map[r.risk_level] || 0) + 1 })
  return Object.entries(map).map(([key, count]) => ({ key, count }))
})
const dashRiskMaxLevel = computed(() => Math.max(...dashRiskByLevel.value.map(l => l.count), 1))

const dashLatest = computed(() => {
  const items: any[] = [
    ...allIssues.value.slice(0, 10).map(r => ({ ...r, kind: 'issue' })),
    ...allRisks.value.slice(0, 10).map(r => ({ ...r, kind: 'risk' })),
  ]
  items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  return items.slice(0, 10)
})

function severityBarColor(s: string): string {
  const map: Record<string, string> = { fatal: 'bg-red-500', serious: 'bg-orange-500', normal: 'bg-blue-500', tip: 'bg-slate-400' }
  return map[s] || 'bg-blue-500'
}
function riskLevelBarColor(l: string): string {
  const map: Record<string, string> = { extreme: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500' }
  return map[l] || 'bg-slate-400'
}

async function loadDashboard() {
  try {
    const [ir, rr] = await Promise.all([
      getIssues({ page_size: 9999, project: projectStore.activeProjectId || undefined }),
      getRisks({ page_size: 9999, project: projectStore.activeProjectId || undefined }),
    ])
    allIssues.value = ir.data.results ?? []
    allRisks.value = rr.data.results ?? []
  } catch { allIssues.value = []; allRisks.value = [] }
}

// ── Tab switch ──
watch(tab, (v) => {
  if (v === 'issues') loadIssues()
  else if (v === 'risks') loadRisks()
  else if (v === 'dashboard') loadDashboard()
})

onMounted(async () => {
  await loadOrgMembers()
  loadIssues()
})
</script>
