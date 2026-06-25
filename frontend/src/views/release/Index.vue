<template>
  <div>
    <h1 class="text-xl font-bold mb-4">投产管理</h1>
    <div class="flex gap-2 mb-4 flex-wrap">
      <button v-for="t in tabs" :key="t.k" :class="tab===t.k?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab=t.k">{{ t.l }}</button>
      <div class="flex-1"></div>
      <button v-if="tab==='drill'" @click="openDrillForm(null)" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">＋ 新建演练</button>
      <button v-if="tab==='plan'" @click="openPlanForm(null)" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">＋ 新建计划</button>
    </div>

    <!-- ════════════════════ 投产演练 ════════════════════ -->
    <div v-if="tab==='drill'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th class="text-left py-3 px-3 font-medium">演练名称</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">场景</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">环境</th>
            <th class="text-left py-3 px-3 font-medium hidden md:table-cell">负责人</th>
            <th class="text-left py-3 px-3 font-medium">结论</th>
            <th class="text-right py-3 px-3 font-medium">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in drillItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td class="py-3 px-3 font-medium">{{ r.name }}</td>
              <td class="py-3 px-3 hidden sm:table-cell">{{ DRILL_SCENARIO_LABELS[r.scenario] || r.scenario }}</td>
              <td class="py-3 px-3 hidden sm:table-cell">{{ DRILL_ENV_LABELS[r.target_environment] || r.target_environment }}</td>
              <td class="py-3 px-3 hidden md:table-cell">{{ r.assignee_name || '—' }}</td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="drillConclusionClass(r.conclusion)">{{ DRILL_CONCLUSION_LABELS[r.conclusion] }}</span></td>
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <div class="flex gap-1 justify-end whitespace-nowrap">
                  <button @click="viewDrillDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                  <button @click="openDrillForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                  <button @click="doDeleteDrill(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="drillItems.length===0"><td colspan="6" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无演练数据</span></td></tr>
          </tbody>
        </table>
      </div>
      <Pagination :page="drillPage" :page-size="drillPageSize" :total="drillTotal" @update:page="drillPage=$event; loadDrills()" @update:page-size="drillPageSize=$event; drillPage=1; loadDrills()" />
    </div>

    <!-- ════════════════════ 投产计划 ════════════════════ -->
    <div v-if="tab==='plan'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
            <th class="text-left py-3 px-3 font-medium">计划名称</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">发布类型</th>
            <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">目标环境</th>
            <th class="text-left py-3 px-3 font-medium hidden md:table-cell">负责人</th>
            <th class="text-left py-3 px-3 font-medium">创建时间</th>
            <th class="text-right py-3 px-3 font-medium">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in planItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td class="py-3 px-3 font-medium">{{ r.name }}</td>
              <td class="py-3 px-3 hidden sm:table-cell">{{ PLAN_TYPE_LABELS[r.release_type] || r.release_type }}</td>
              <td class="py-3 px-3 hidden sm:table-cell">{{ PLAN_ENV_LABELS[r.target_environment] || r.target_environment }}</td>
              <td class="py-3 px-3 hidden md:table-cell">{{ r.assignee_name || '—' }}</td>
              <td class="py-3 px-3 text-xs text-slate-400">{{ r.created_at?.slice(0,10) }}</td>
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <div class="flex gap-1 justify-end whitespace-nowrap">
                  <button @click="viewPlanDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                  <button @click="openPlanForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                  <button @click="doDeletePlan(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="planItems.length===0"><td colspan="6" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无计划数据</span></td></tr>
          </tbody>
        </table>
      </div>
      <Pagination :page="planPage" :page-size="planPageSize" :total="planTotal" @update:page="planPage=$event; loadPlans()" @update:page-size="planPageSize=$event; planPage=1; loadPlans()" />
    </div>

    <!-- ════════════════════ 演练表单弹窗 ════════════════════ -->
    <div v-if="showDrillForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showDrillForm=false">
      <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ drillEditing ? '编辑演练' : '新建演练' }}</h2>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">演练名称 *</label><input v-model="drillForm.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">演练描述</label><textarea v-model="drillForm.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">目标环境</label>
            <select v-model="drillForm.target_environment" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in DRILL_ENV_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">演练场景</label>
            <select v-model="drillForm.scenario" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in DRILL_SCENARIO_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">演练步骤</label><textarea v-model="drillForm.steps" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">前置条件</label><textarea v-model="drillForm.prerequisites" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">预期结果</label><textarea v-model="drillForm.expected_results" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">判定标准</label><textarea v-model="drillForm.criteria" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">负责人</label>
            <select v-model="drillForm.assignee" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="u in orgMembersWithUser" :key="u.user_id" :value="u.user_id">{{ u.name }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">干系人</label>
            <div class="flex flex-wrap gap-2 p-2 border border-slate-300 dark:border-slate-600 rounded-lg min-h-[42px] bg-white dark:bg-slate-700">
              <span v-for="u in selectedDrillStakeholders" :key="u.user_id" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {{ u.name }}<button @click="removeDrillStakeholder(u)" class="hover:text-red-500">&times;</button>
              </span>
              <div class="relative" data-picker="stakeholder">
                <input v-model="drillStakeholderSearch" placeholder="搜索添加..." class="text-sm border-0 outline-none bg-transparent min-w-[120px]" @focus="drillStakeholderOpen=true" @input="drillStakeholderOpen=true" />
                <div v-if="drillStakeholderOpen && filteredDrillMembers.length" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                  <button v-for="u in filteredDrillMembers" :key="u.user_id" class="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700" @click="addDrillStakeholder(u)">{{ u.name }}</button>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-sm font-medium mb-1">演练结论</label>
            <select v-model="drillForm.conclusion" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in DRILL_CONCLUSION_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="col-span-2 sm:col-span-1"></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="drillForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">上传文件或截图</label><input type="file" @change="onDrillFileChange" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" /></div>
          <div v-if="drillForm.attachment_url" class="col-span-2 text-xs text-blue-600">当前附件：{{ drillForm.attachment_url }}</div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showDrillForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveDrill" :disabled="drillSaving" class="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{{ drillSaving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- ════════════════════ 演练详情弹窗 ════════════════════ -->
    <div v-if="showDrillDetail && drillDetailItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showDrillDetail=false">
      <div class="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold">演练详情</h2>
          <button @click="showDrillDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">演练名称</span><span class="font-medium">{{ drillDetailItem.name }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">演练描述</span><span class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{{ drillDetailItem.description || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">目标环境</span><span>{{ DRILL_ENV_LABELS[drillDetailItem.target_environment] }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">演练场景</span><span>{{ DRILL_SCENARIO_LABELS[drillDetailItem.scenario] }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">演练步骤</span><span class="whitespace-pre-wrap">{{ drillDetailItem.steps || '—' }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">前置条件</span><span class="whitespace-pre-wrap">{{ drillDetailItem.prerequisites || '—' }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">预期结果</span><span class="whitespace-pre-wrap">{{ drillDetailItem.expected_results || '—' }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">判定标准</span><span class="whitespace-pre-wrap">{{ drillDetailItem.criteria || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">负责人</span><span>{{ drillDetailItem.assignee_name || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">干系人</span><span>{{ (drillDetailItem.stakeholder_names||[]).join('、') || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">演练结论</span><span class="px-2 py-0.5 rounded text-xs font-medium" :class="drillConclusionClass(drillDetailItem.conclusion)">{{ DRILL_CONCLUSION_LABELS[drillDetailItem.conclusion] }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">备注说明</span><span class="whitespace-pre-wrap">{{ drillDetailItem.notes || '—' }}</span></div>
          <div v-if="drillDetailItem.attachment_url" class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">附件</span><a :href="drillDetailItem.attachment_url" target="_blank" class="text-blue-600 underline text-xs">查看附件</a></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">创建时间</span><span class="text-xs">{{ formatDT(drillDetailItem.created_at) }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">更新时间</span><span class="text-xs">{{ formatDT(drillDetailItem.updated_at) }}</span></div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showDrillDetail=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">关闭</button>
        </div>
      </div>
    </div>

    <!-- ════════════════════ 计划表单弹窗 ════════════════════ -->
    <div v-if="showPlanForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showPlanForm=false">
      <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ planEditing ? '编辑计划' : '新建计划' }}</h2>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">计划名称 *</label><input v-model="planForm.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label class="block text-sm font-medium mb-1">发布类型</label>
            <select v-model="planForm.release_type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in PLAN_TYPE_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">目标环境</label>
            <select v-model="planForm.target_environment" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in PLAN_ENV_LABELS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">上线内容</label><textarea v-model="planForm.content" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">负责人</label>
            <select v-model="planForm.assignee" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="">请选择</option>
              <option v-for="u in orgMembersWithUser" :key="u.user_id" :value="u.user_id">{{ u.name }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">干系人</label>
            <div class="flex flex-wrap gap-2 p-2 border border-slate-300 dark:border-slate-600 rounded-lg min-h-[42px] bg-white dark:bg-slate-700">
              <span v-for="u in selectedPlanStakeholders" :key="u.user_id" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {{ u.name }}<button @click="removePlanStakeholder(u)" class="hover:text-red-500">&times;</button>
              </span>
              <div class="relative" data-picker="stakeholder">
                <input v-model="planStakeholderSearch" placeholder="搜索添加..." class="text-sm border-0 outline-none bg-transparent min-w-[120px]" @focus="planStakeholderOpen=true" @input="planStakeholderOpen=true" />
                <div v-if="planStakeholderOpen && filteredPlanMembers.length" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                  <button v-for="u in filteredPlanMembers" :key="u.user_id" class="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700" @click="addPlanStakeholder(u)">{{ u.name }}</button>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="planForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">上传文件或截图</label><input type="file" @change="onPlanFileChange" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" /></div>
          <div v-if="planForm.attachment_url" class="col-span-2 text-xs text-blue-600">当前附件：{{ planForm.attachment_url }}</div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showPlanForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="savePlan" :disabled="planSaving" class="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{{ planSaving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- ════════════════════ 计划详情弹窗 ════════════════════ -->
    <div v-if="showPlanDetail && planDetailItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="showPlanDetail=false">
      <div class="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold">计划详情</h2>
          <button @click="showPlanDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">计划名称</span><span class="font-medium">{{ planDetailItem.name }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">发布类型</span><span>{{ PLAN_TYPE_LABELS[planDetailItem.release_type] }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">目标环境</span><span>{{ PLAN_ENV_LABELS[planDetailItem.target_environment] }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">上线内容</span><span class="whitespace-pre-wrap">{{ planDetailItem.content || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">负责人</span><span>{{ planDetailItem.assignee_name || '—' }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">干系人</span><span>{{ (planDetailItem.stakeholder_names||[]).join('、') || '—' }}</span></div>
          <div class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">备注说明</span><span class="whitespace-pre-wrap">{{ planDetailItem.notes || '—' }}</span></div>
          <div v-if="planDetailItem.attachment_url" class="col-span-2"><span class="text-slate-400 block text-xs mb-0.5">附件</span><a :href="planDetailItem.attachment_url" target="_blank" class="text-blue-600 underline text-xs">查看附件</a></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">创建时间</span><span class="text-xs">{{ formatDT(planDetailItem.created_at) }}</span></div>
          <div><span class="text-slate-400 block text-xs mb-0.5">更新时间</span><span class="text-xs">{{ formatDT(planDetailItem.updated_at) }}</span></div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showPlanDetail=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">关闭</button>
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
import {
  getReleaseDrills, createReleaseDrill, updateReleaseDrill, deleteReleaseDrill,
  getReleasePlans, createReleasePlan, updateReleasePlan, deleteReleasePlan,
  DRILL_ENV_LABELS, DRILL_SCENARIO_LABELS, DRILL_CONCLUSION_LABELS,
  PLAN_TYPE_LABELS, PLAN_ENV_LABELS,
  drillConclusionClass,
} from '@/api/modules/releases'
import type { ReleaseDrill, ReleasePlan } from '@/api/modules/releases'

const projectStore = useProjectStore()
const toast = useToastStore()
const confirm = useConfirmStore()

const tabs = [
  { k: 'drill', l: '投产演练' },
  { k: 'plan', l: '投产计划' },
]
const tab = ref('drill')

// ── 组织成员 ──
const orgMembers = ref<any[]>([])
const orgMembersWithUser = computed(() => orgMembers.value.filter((m: any) => m.user_id != null))

async function loadOrgMembers() {
  try {
    const r = await request.get('/org-members/', { params: { page_size: 9999, project: projectStore.activeProjectId || undefined } })
    orgMembers.value = r.data.results ?? []
  } catch { orgMembers.value = [] }
}

// ── 工具函数 ──
function formatDT(s: string | null | undefined): string {
  if (!s) return '—'
  return s.slice(0, 16).replace('T', ' ')
}

// ═══════════════════════════════ 投产演练 ═══════════════════════════════
const drillItems = ref<ReleaseDrill[]>([])
const drillPage = ref(1)
const drillPageSize = ref(10)
const drillTotal = ref(0)
const drillLoading = ref(false)

const showDrillForm = ref(false)
const drillEditing = ref<ReleaseDrill | null>(null)
const drillSaving = ref(false)
const drillFile = ref<File | null>(null)

const showDrillDetail = ref(false)
const drillDetailItem = ref<ReleaseDrill | null>(null)

const defaultDrillForm = {
  project: null as number | null,
  name: '', description: '',
  target_environment: 'test', scenario: 'normal_deploy',
  steps: '', prerequisites: '', expected_results: '', criteria: '',
  assignee: null as number | null,
  conclusion: 'pending', notes: '',
  attachment_url: null as string | null,
}
const drillForm = reactive({ ...defaultDrillForm })

const drillStakeholderSearch = ref('')
const drillStakeholderOpen = ref(false)
const selectedDrillStakeholders = ref<any[]>([])

const filteredDrillMembers = computed(() => {
  const ids = new Set(selectedDrillStakeholders.value.map((u: any) => u.user_id))
  const q = drillStakeholderSearch.value.trim().toLowerCase()
  return orgMembers.value.filter((u: any) => !ids.has(u.user_id) && (!q || u.name.includes(q)))
})

function addDrillStakeholder(u: any) { selectedDrillStakeholders.value.push(u); drillStakeholderSearch.value = ''; drillStakeholderOpen.value = false }
function removeDrillStakeholder(u: any) { selectedDrillStakeholders.value = selectedDrillStakeholders.value.filter((x: any) => x.user_id !== u.user_id) }

async function loadDrills() {
  drillLoading.value = true
  try {
    const params: Record<string, any> = { page: drillPage.value, page_size: drillPageSize.value, project: projectStore.activeProjectId || undefined }
    const r = await getReleaseDrills(params)
    drillItems.value = r.data.results ?? []
    drillTotal.value = r.data.count ?? drillItems.value.length
  } catch { drillItems.value = [] }
  finally { drillLoading.value = false }
}

function openDrillForm(r: ReleaseDrill | null) {
  drillEditing.value = r
  drillFile.value = null
  selectedDrillStakeholders.value = []
  if (r) {
    Object.assign(drillForm, r)
    if (r.stakeholders?.length) {
      selectedDrillStakeholders.value = orgMembers.value.filter((u: any) => (r.stakeholders as any)?.includes(u.user_id))
    }
  } else {
    Object.assign(drillForm, { ...defaultDrillForm, project: projectStore.activeProjectId })
  }
  showDrillForm.value = true
}

function onDrillFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) drillFile.value = files[0]
}

async function saveDrill() {
  if (!drillForm.name) { toast.show('请填写演练名称'); return }
  drillSaving.value = true
  try {
    const payload: Record<string, any> = { ...drillForm }
    payload.stakeholder_ids = selectedDrillStakeholders.value.map((u: any) => u.user_id)
    payload.project = projectStore.activeProjectId
    if (drillFile.value) {
      const fd = new FormData()
      for (const k of Object.keys(payload)) fd.append(k, payload[k] ?? '')
      fd.append('attachment', drillFile.value)
      if (drillEditing.value) await updateReleaseDrill(drillEditing.value.id, fd)
      else await createReleaseDrill(fd)
    } else {
      if (drillEditing.value) await updateReleaseDrill(drillEditing.value.id, payload as any)
      else await createReleaseDrill(payload as any)
    }
    showDrillForm.value = false
    toast.show('保存成功', 'success')
    loadDrills()
  } catch (e: any) {
    const data = e?.response?.data
    let msg = '保存失败'
    if (data) {
      if (typeof data === 'string') msg = data
      else if (typeof data === 'object') msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('；') : v}`).join(' | ')
    }
    toast.show(msg)
  }
  finally { drillSaving.value = false }
}

function viewDrillDetail(r: ReleaseDrill) { drillDetailItem.value = r; showDrillDetail.value = true }

async function doDeleteDrill(r: ReleaseDrill) {
  if (!(await confirm.show(`确认删除演练「${r.name}」？`))) return
  try { await deleteReleaseDrill(r.id); toast.show('删除成功', 'success'); loadDrills() } catch { toast.show('删除失败', 'error') }
}

// ═══════════════════════════════ 投产计划 ═══════════════════════════════
const planItems = ref<ReleasePlan[]>([])
const planPage = ref(1)
const planPageSize = ref(10)
const planTotal = ref(0)
const planLoading = ref(false)

const showPlanForm = ref(false)
const planEditing = ref<ReleasePlan | null>(null)
const planSaving = ref(false)
const planFile = ref<File | null>(null)

const showPlanDetail = ref(false)
const planDetailItem = ref<ReleasePlan | null>(null)

const defaultPlanForm = {
  project: null as number | null,
  name: '',
  release_type: 'regular', target_environment: 'production',
  content: '',
  assignee: null as number | null,
  notes: '',
  attachment_url: null as string | null,
}
const planForm = reactive({ ...defaultPlanForm })

const planStakeholderSearch = ref('')
const planStakeholderOpen = ref(false)
const selectedPlanStakeholders = ref<any[]>([])

const filteredPlanMembers = computed(() => {
  const ids = new Set(selectedPlanStakeholders.value.map((u: any) => u.user_id))
  const q = planStakeholderSearch.value.trim().toLowerCase()
  return orgMembers.value.filter((u: any) => !ids.has(u.user_id) && (!q || u.name.includes(q)))
})

function addPlanStakeholder(u: any) { selectedPlanStakeholders.value.push(u); planStakeholderSearch.value = ''; planStakeholderOpen.value = false }
function removePlanStakeholder(u: any) { selectedPlanStakeholders.value = selectedPlanStakeholders.value.filter((x: any) => x.user_id !== u.user_id) }

async function loadPlans() {
  planLoading.value = true
  try {
    const params: Record<string, any> = { page: planPage.value, page_size: planPageSize.value, project: projectStore.activeProjectId || undefined }
    const r = await getReleasePlans(params)
    planItems.value = r.data.results ?? []
    planTotal.value = r.data.count ?? planItems.value.length
  } catch { planItems.value = [] }
  finally { planLoading.value = false }
}

function openPlanForm(r: ReleasePlan | null) {
  planEditing.value = r
  planFile.value = null
  selectedPlanStakeholders.value = []
  if (r) {
    Object.assign(planForm, r)
    if (r.stakeholders?.length) {
      selectedPlanStakeholders.value = orgMembers.value.filter((u: any) => (r.stakeholders as any)?.includes(u.user_id))
    }
  } else {
    Object.assign(planForm, { ...defaultPlanForm, project: projectStore.activeProjectId })
  }
  showPlanForm.value = true
}

function onPlanFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) planFile.value = files[0]
}

async function savePlan() {
  if (!planForm.name) { toast.show('请填写计划名称'); return }
  planSaving.value = true
  try {
    const payload: Record<string, any> = { ...planForm }
    payload.stakeholder_ids = selectedPlanStakeholders.value.map((u: any) => u.user_id)
    payload.project = projectStore.activeProjectId
    if (planFile.value) {
      const fd = new FormData()
      for (const k of Object.keys(payload)) fd.append(k, payload[k] ?? '')
      fd.append('attachment', planFile.value)
      if (planEditing.value) await updateReleasePlan(planEditing.value.id, fd)
      else await createReleasePlan(fd)
    } else {
      if (planEditing.value) await updateReleasePlan(planEditing.value.id, payload as any)
      else await createReleasePlan(payload as any)
    }
    showPlanForm.value = false
    toast.show('保存成功', 'success')
    loadPlans()
  } catch (e: any) {
    const data = e?.response?.data
    let msg = '保存失败'
    if (data) {
      if (typeof data === 'string') msg = data
      else if (typeof data === 'object') msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('；') : v}`).join(' | ')
    }
    toast.show(msg)
  }
  finally { planSaving.value = false }
}

function viewPlanDetail(r: ReleasePlan) { planDetailItem.value = r; showPlanDetail.value = true }

async function doDeletePlan(r: ReleasePlan) {
  if (!(await confirm.show(`确认删除计划「${r.name}」？`))) return
  try { await deleteReleasePlan(r.id); toast.show('删除成功', 'success'); loadPlans() } catch { toast.show('删除失败', 'error') }
}

// ── Tab switch ──
watch(tab, (v) => {
  if (v === 'drill') loadDrills()
  else if (v === 'plan') loadPlans()
})

onMounted(async () => {
  await loadOrgMembers()
  loadDrills()
})
</script>
