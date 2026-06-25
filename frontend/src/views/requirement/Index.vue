<template>
  <div>
    <h1 class="text-xl font-bold mb-4">需求管理</h1>
    <div class="flex gap-2 mb-4 flex-wrap">
      <button v-for="t in tabs" :key="t.k" :class="tab===t.k?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-700'" class="px-3 py-1.5 rounded-lg text-sm transition" @click="tab=t.k">{{ t.l }}</button>
      <div class="flex-1"></div>
      <button v-if="tab==='submit'" @click="openForm(null)" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建需求</button>
      <button v-if="tab==='change'" @click="openChangeForm()" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 新建变更</button>
      <button v-if="tab==='baseline'" @click="openBaselineForm()" class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">生成基线</button>
    </div>

    <!-- 需求提交列表 -->
    <div v-if="tab==='submit'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">需求名称</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">需求类型</th>
          <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">需求负责人</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">完成日期</th><th class="text-left py-3 px-3 font-medium">状态</th><th class="text-right py-3 px-3 font-medium">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in items" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td class="py-3 px-3 font-medium">{{ r.name }}</td>
            <td class="py-3 px-3 hidden sm:table-cell">{{ typeLabels[r.type] || r.type }}</td>
            <td class="py-3 px-3 hidden sm:table-cell">{{ r.assignee_name || '—' }}</td>
            <td class="py-3 px-3 hidden sm:table-cell">{{ r.due_date || '—' }}</td>
            <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="statusCls(r.status)">{{ statusLabels[r.status] }}</span></td>
            <td class="py-3 px-3 text-right whitespace-nowrap">
              <div class="flex gap-1 justify-end whitespace-nowrap">
                <button @click="viewDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
                <button @click="openForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button v-if="r.status==='submitted'" @click="doSubmitReview(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">提交评审</button>
                <button v-if="r.status==='pending_review'" @click="doWithdraw(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400">撤回评审</button>
                <button @click="doDelete(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="items.length===0"><td colspan="6" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无数据</span></td></tr>
        </tbody></table>
      </div>
      <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="page=$event; load()" @update:page-size="pageSize=$event; page=1; load()" />
    </div>

    <!-- 需求评审列表 -->
    <div v-if="tab==='review'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">需求名称</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">需求类型</th>
          <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">需求负责人</th><th class="text-left py-3 px-3 font-medium hidden sm:table-cell">完成日期</th><th class="text-left py-3 px-3 font-medium">评审负责人</th><th class="text-left py-3 px-3 font-medium">状态</th><th class="text-right py-3 px-3 font-medium">操作</th>
        </tr></thead><tbody>
          <tr v-for="r in reviewItems" :key="r.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td class="py-3 px-3 font-medium">{{ r.name }}</td>
            <td class="py-3 px-3 hidden sm:table-cell">{{ typeLabels[r.type] || r.type }}</td>
            <td class="py-3 px-3 hidden sm:table-cell">{{ r.assignee_name || '—' }}</td>
            <td class="py-3 px-3 hidden sm:table-cell">{{ r.due_date || '—' }}</td>
            <td class="py-3 px-3">{{ r.review_assignee_name || '不指定' }}</td>
            <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="statusCls(r.status)">{{ statusLabels[r.status] }}</span></td>
            <td class="py-3 px-3 text-right whitespace-nowrap">
              <div class="flex gap-1 justify-end whitespace-nowrap">
                <button v-if="r.status==='pending_review'" @click="openReviewForm(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">发起评审</button>
                <button @click="viewDetail(r)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
              </div>
            </td>
          </tr>
          <tr v-if="reviewItems.length===0"><td colspan="7" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无待评审需求</span></td></tr>
        </tbody></table>
      </div>
      <Pagination :page="reviewPage" :page-size="reviewPageSize" :total="reviewTotal" @update:page="reviewPage=$event; loadReviewItems()" @update:page-size="reviewPageSize=$event; reviewPage=1; loadReviewItems()" />
    </div>

    <!-- 需求基线列表 -->
    <div v-if="tab==='baseline'" class="space-y-4">
      <div v-for="bl in baselines" :key="bl.id" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <span class="text-sm font-semibold">{{ bl.name }}</span>
          <span class="text-xs text-slate-400 font-mono">v{{ bl.version }}</span>
          <span class="text-xs text-slate-400">{{ typeLabels[bl.type] || bl.type }}</span>
          <div class="flex-1"></div>
          <span class="text-xs text-slate-400">{{ bl.created_by_name || '' }} {{ bl.created_at?.slice(0,10) }}</span>
          <button @click="deleteBaseline(bl)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">删除</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm"><thead><tr class="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50">
            <th class="text-left py-2 px-3 font-medium text-xs">需求名称</th><th class="text-left py-2 px-3 font-medium text-xs">需求描述</th><th class="text-left py-2 px-3 font-medium text-xs hidden sm:table-cell">类型</th><th class="text-left py-2 px-3 font-medium text-xs hidden sm:table-cell">需求负责人</th><th class="text-left py-2 px-3 font-medium text-xs hidden sm:table-cell">完成日期</th><th class="text-left py-2 px-3 font-medium text-xs">变更次数</th>
          </tr></thead><tbody>
            <tr v-for="req in (bl.requirements_data||[])" :key="req.id" class="border-b border-slate-100 dark:border-slate-700/50">
              <td class="py-2 px-3 text-xs">{{ req.name }}</td>
              <td class="py-2 px-3 text-xs truncate max-w-[200px]">{{ req.description || '—' }}</td>
              <td class="py-2 px-3 text-xs hidden sm:table-cell">{{ typeLabels[req.type] || req.type }}</td>
              <td class="py-2 px-3 text-xs hidden sm:table-cell">{{ req.assignee_name || '—' }}</td>
              <td class="py-2 px-3 text-xs hidden sm:table-cell">{{ req.due_date || '—' }}</td>
              <td class="py-2 px-3 text-xs">{{ bl.change_counts?.[req.id] ?? 0 }}</td>
            </tr>
          </tbody></table>
        </div>
      </div>
      <div v-if="baselines.length===0" class="flex flex-col items-center justify-center py-16 text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无基线数据</span></div>
    </div>

    <!-- 需求变更列表 -->
    <div v-if="tab==='change'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm"><thead><tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
          <th class="text-left py-3 px-3 font-medium">基线</th><th class="text-left py-3 px-3 font-medium">变更对象</th>
          <th class="text-left py-3 px-3 font-medium hidden sm:table-cell">负责人</th><th class="text-left py-3 px-3 font-medium">审批状态</th><th class="text-right py-3 px-3 font-medium">操作</th>
        </tr></thead><tbody>
          <tr v-for="c in changes" :key="c.id" class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <td class="py-3 px-3"><span class="text-xs font-mono">{{ c.baseline_name }} v{{ c.baseline_version }}</span></td>
            <td class="py-3 px-3">{{ c.object_desc }}</td>
            <td class="py-3 px-3 hidden sm:table-cell">{{ c.assignee_name || '—' }}</td>
            <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-xs font-medium" :class="approvalCls(c.approval_status)">{{ approvalLabels[c.approval_status] }}</span></td>
            <td class="py-3 px-3 text-right whitespace-nowrap">
              <div class="flex gap-1 justify-end whitespace-nowrap">
                <button v-if="c.approval_status==='pending'" @click="editChange(c)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">编辑</button>
                <button v-if="c.approval_status==='pending'" @click="openApproveDialog(c, 'approved')" class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">审批通过</button>
                <button v-if="c.approval_status==='pending'" @click="openApproveDialog(c, 'rejected')" class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">驳回</button>
                <button @click="viewChangeDetail(c)" class="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">详情</button>
              </div>
            </td>
          </tr>
          <tr v-if="changes.length===0"><td colspan="6" class="py-16 text-center text-slate-400"><svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-sm">暂无数据</span></td></tr>
        </tbody></table>
      </div>
    </div>

    <!-- 需求表单弹窗 -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ editing ? '编辑' : '新建' }}需求</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">需求类型 *</label>
            <select v-model="form.type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in typeLabels" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">需求名称 *</label><input v-model="form.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
          <div><label class="block text-sm font-medium mb-1">需求描述</label><textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">需求负责人</label>
            <select v-model="form.assignee" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option :value="null">不指定</option>
              <option v-for="m in orgMembers" :key="m.id" :value="m.id">{{ memberLabel(m) }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">需求完成日期</label><SmartDateInput v-model="form.due_date" /></div>
          <div><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showForm=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveForm" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>

    <!-- 提交评审弹窗 -->
    <div v-if="showReviewAssign" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showReviewAssign=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">提交评审</h2>
        <div><label class="block text-sm font-medium mb-1">评审负责人</label>
          <select v-model="reviewAssigneeId" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
            <option :value="null">不指定</option>
            <option v-for="m in orgMembers" :key="m.id" :value="m.id">{{ memberLabel(m) }}</option>
          </select>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showReviewAssign=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="confirmSubmitReview" class="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700">提交评审</button>
        </div>
      </div>
    </div>

    <!-- 评审弹窗 -->
    <div v-if="showReview" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showReview=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">发起评审 - {{ reviewTarget?.name }}</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">评审结论 *</label>
            <select v-model="reviewForm.conclusion" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="pass">通过</option><option value="conditional_pass">有条件通过</option><option value="fail">不通过</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">评审方式 *</label>
            <select v-model="reviewForm.review_method" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option value="meeting">会议</option><option value="email">邮件</option><option value="circulation">传签</option><option value="other">其他</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">评审日期</label><SmartDateInput v-model="reviewForm.review_date" /></div>
          <div class="relative" data-picker="stakeholder">
            <label class="block text-sm font-medium mb-1">评审干系人</label>
            <div @click="reviewStakePicker = !reviewStakePicker" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm cursor-pointer flex flex-wrap gap-1 min-h-[38px]">
              <span v-if="!reviewForm.stakeholders_ids?.length" class="text-slate-400">请选择评审干系人</span>
              <span v-for="sid in reviewForm.stakeholders_ids" :key="sid" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                {{ (orgMembers.find(m=>m.id===sid) ? memberLabel(orgMembers.find(m=>m.id===sid)) : sid) }}
              </span>
            </div>
            <div v-if="reviewStakePicker" class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 shadow-lg p-2 space-y-1">
              <label v-for="m in orgMembers" :key="m.id" class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded">
                <input type="checkbox" :value="m.id" v-model="reviewForm.stakeholders_ids" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span>{{ memberLabel(m) }}</span>
              </label>
            </div>
          </div>
          <div><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="reviewForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showReview=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="confirmReview" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">确认评审</button>
        </div>
      </div>
    </div>

    <!-- 基线弹窗 -->
    <div v-if="showBaseline" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showBaseline=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">生成基线</h2>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div><label class="block text-sm font-medium mb-1">需求类型 *</label>
            <select v-model="blForm.type" @change="loadBaselineReqs" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option v-for="(l,k) in typeLabels" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">基线版本 *</label><input v-model="blForm.version" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">基线名称 *</label><input v-model="blForm.name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" /></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">基线描述</label><textarea v-model="blForm.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div class="col-span-2"><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="blForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
        </div>
        <div class="border-t border-slate-200 dark:border-slate-700 pt-3">
          <div class="relative" data-picker="baseline-reqs">
            <div class="text-sm font-medium mb-2">待纳入基线的需求（{{ blReqs.length }}）</div>
            <div @click="baselineReqPicker = !baselineReqPicker" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm cursor-pointer flex flex-wrap gap-1 min-h-[38px]">
              <span v-if="!blForm.requirement_ids?.length" class="text-slate-400">请选择需求</span>
              <span v-for="rid in blForm.requirement_ids" :key="rid" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                {{ blReqs.find(r=>r.id===rid)?.name || rid }}
              </span>
            </div>
            <div v-if="baselineReqPicker" class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 shadow-lg p-2 space-y-1">
              <label v-for="req in blReqs" :key="req.id" class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded">
                <input type="checkbox" :value="req.id" v-model="blForm.requirement_ids" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span class="font-medium">{{ req.name }}</span>
                <span class="text-xs text-slate-400">{{ typeLabels[req.type] }}</span>
              </label>
              <div v-if="blReqs.length===0" class="text-xs text-slate-400 text-center py-4">暂无可纳入基线的需求</div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showBaseline=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveBaseline" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">保存基线</button>
        </div>
      </div>
    </div>

    <!-- 变更弹窗 -->
    <div v-if="showChange" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showChange=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ changeEditing ? '编辑' : '新建' }}变更</h2>
        <div class="space-y-3">
          <div><label class="block text-sm font-medium mb-1">基线名称</label>
            <div class="relative">
              <input v-model="blSearch" placeholder="输入关键字搜索基线..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <div v-if="blSearch && filteredBaselines.length" class="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div v-for="bl in filteredBaselines" :key="bl.id" class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30" @click="selectBaseline(bl)">{{ bl.name }} <span class="text-xs text-slate-400">v{{ bl.version }}</span></div>
              </div>
            </div>
          </div>
          <div><label class="block text-sm font-medium mb-1">变更对象</label>
            <div v-if="!changeForm.baseline" class="px-3 py-2 text-sm text-slate-400 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">请先选择基线</div>
            <template v-else>
              <input v-model="reqSearch" placeholder="搜索需求..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-1" />
              <div class="max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg">
                <div v-if="baselineReqs.length===0" class="px-3 py-2 text-sm text-slate-400">该基线暂无需求</div>
                <div v-for="r in filteredBaselineReqs" :key="r.id"
                  class="px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  :class="changeForm.object_desc.includes(r.name) ? 'bg-blue-50 dark:bg-blue-900/20 font-medium' : ''"
                  @click="selectReq(r)">
                  <span class="text-xs text-slate-400 mr-1">{{ typeLabels[r.type] || r.type }}</span>
                  {{ r.name }}
                </div>
              </div>
              <div v-if="changeForm.object_desc" class="mt-1 px-2 py-1 text-xs text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 rounded">
                已选: {{ changeForm.object_desc }}
                <button @click="changeForm.object_desc = ''" class="ml-1 text-red-500 hover:text-red-700">×</button>
              </div>
            </template>
          </div>
          <div><label class="block text-sm font-medium mb-1">变更内容</label><textarea v-model="changeForm.content" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
          <div><label class="block text-sm font-medium mb-1">变更负责人</label>
            <select v-model="changeForm.assignee" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option :value="null">不指定</option>
              <option v-for="m in orgMembers" :key="m.id" :value="m.id">{{ memberLabel(m) }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">变更审批人</label>
            <select v-model="changeForm.approver" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
              <option :value="null">不指定</option>
              <option v-for="m in orgMembers" :key="m.id" :value="m.id">{{ memberLabel(m) }}</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium mb-1">备注说明</label><textarea v-model="changeForm.notes" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"></textarea></div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showChange=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="saveChange" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
    <!-- 变更审批弹窗 -->
    <div v-if="showApprove" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showApprove=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 class="text-lg font-bold mb-4">{{ approveAction==='approved' ? '审批通过' : '驳回' }}变更</h2>
        <div class="space-y-3">
          <div class="text-sm"><span class="text-slate-400">基线：</span><span class="font-medium">{{ approveTarget?.baseline_name }} v{{ approveTarget?.baseline_version }}</span></div>
          <div class="text-sm"><span class="text-slate-400">变更对象：</span><span class="font-medium">{{ approveTarget?.object_desc }}</span></div>
          <div class="text-sm"><span class="text-slate-400">变更内容：</span><span class="font-medium">{{ approveTarget?.content }}</span></div>
          <div v-if="approveAction==='rejected'" class="pt-2 border-t border-slate-200 dark:border-slate-700">
            <label class="block text-sm font-medium mb-1">驳回原因</label>
            <textarea v-model="approveReason" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" placeholder="请填写驳回原因..."></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showApprove=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="confirmApprove" class="px-4 py-2 rounded-lg text-sm text-white" :class="approveAction==='approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'">{{ approveAction==='approved' ? '确认通过' : '确认驳回' }}</button>
        </div>
      </div>
    </div>
    <!-- 变更详情弹窗 -->
    <div v-if="showChangeDetail && changeDetailItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showChangeDetail=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">变更详情</h2>
          <button @click="showChangeDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="space-y-4 text-sm">
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">基线</span>
            <span class="font-medium">{{ changeDetailItem.baseline_name }} <span class="text-xs text-slate-400 font-mono">v{{ changeDetailItem.baseline_version }}</span></span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">变更对象</span>
            <span class="font-medium">{{ changeDetailItem.object_desc }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">变更内容</span>
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ changeDetailItem.content }}</div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">变更负责人</span>
              <span>{{ changeDetailItem.assignee_name || '—' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">变更审批人</span>
              <span>{{ changeDetailItem.approver_name || '—' }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">审批状态</span>
              <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="approvalCls(changeDetailItem.approval_status)">{{ approvalLabels[changeDetailItem.approval_status] }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">创建人</span>
              <span>{{ changeDetailItem.created_by_name || '—' }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">创建时间</span>
              <span>{{ formatTime(changeDetailItem.created_at) }}</span>
            </div>
            <div v-if="changeDetailItem.updated_at">
              <span class="text-slate-400 block text-xs mb-0.5">更新时间</span>
              <span>{{ formatTime(changeDetailItem.updated_at) }}</span>
            </div>
          </div>
          <div v-if="changeDetailItem.notes">
            <span class="text-slate-400 block text-xs mb-0.5">备注说明</span>
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ changeDetailItem.notes }}</div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showChangeDetail=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">关闭</button>
        </div>
      </div>
    </div>
  <!-- 需求详情弹窗 -->
    <div v-if="showDetail && detailItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showDetail=false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">需求详情</h2>
          <button @click="showDetail=false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div class="space-y-4 text-sm">
          <div>
            <span class="text-slate-400 block text-xs mb-0.5">需求名称</span>
            <span class="font-medium">{{ detailItem.name }}</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">类型</span>
              <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="typeCls(detailItem.type)">{{ typeLabels[detailItem.type] || detailItem.type }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">状态</span>
              <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="statusCls(detailItem.status)">{{ statusLabels[detailItem.status] }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">提交人</span>
              <span>{{ detailItem.submitter_name || '—' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">负责人</span>
              <span>{{ detailItem.assignee_name || '—' }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">完成日期</span>
              <span>{{ detailItem.due_date || '—' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs mb-0.5">创建时间</span>
              <span>{{ formatTime(detailItem.created_at) }}</span>
            </div>
          </div>
          <div v-if="detailItem.description">
            <span class="text-slate-400 block text-xs mb-0.5">描述</span>
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ detailItem.description }}</div>
          </div>
          <div v-if="detailItem.notes">
            <span class="text-slate-400 block text-xs mb-0.5">备注</span>
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ detailItem.notes }}</div>
          </div>
          <div v-if="detailItem.document_url">
            <span class="text-slate-400 block text-xs mb-0.5">需求文档</span>
            <a :href="detailItem.document_url" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all">{{ detailItem.document_url.split('/').pop() }}</a>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button @click="showDetail=false" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, computed } from 'vue'
import { memberLabel } from '@/composables/useMemberLabel'
import { useProjectStore } from '@/stores/project'
import { useToastStore } from '@/stores/toast'
import { useConfirmStore } from '@/stores/confirm'
import request from '@/api/request'
import Pagination from '@/components/Pagination.vue'
import {
  getRequirements, createRequirement, updateRequirement, deleteRequirement,
  submitReview, withdrawReview,
  createReqReview,
  getReqBaselines, getReqBaseline, createReqBaseline, deleteReqBaseline,
  getReqChanges, createReqChange, updateReqChange,
  approveReqChange, rejectReqChange,
  TYPE_LABELS, STATUS_LABELS,
} from '@/api/modules/requirements'
import SmartDateInput from '@/components/SmartDateInput.vue'
import type { Requirement } from '@/api/modules/requirements'

const projectStore = useProjectStore()
const toast = useToastStore()
const confirm = useConfirmStore()

const typeLabels = TYPE_LABELS
const statusLabels = STATUS_LABELS
const approvalLabels: Record<string, string> = { pending: '待审批', approved: '审批通过', rejected: '审批不通过' }

const tabs = [
  { k: 'submit', l: '需求提交' }, { k: 'review', l: '需求评审' },
  { k: 'baseline', l: '需求基线' }, { k: 'change', l: '需求变更' },
]
const tab = ref('submit')
const items = ref<Requirement[]>([])
const reviewItems = ref<Requirement[]>([])
const reviewPage = ref(1)
const reviewPageSize = ref(10)
const reviewTotal = ref(0)
const baselines = ref<any[]>([])
const changes = ref<any[]>([])
const orgMembers = ref<any[]>([])

// Pagination
const page = ref(1), pageSize = ref(10), total = ref(0)

// Form state
const reviewStakePicker = ref(false)
const baselineReqPicker = ref(false)
const showDetail = ref(false)
const detailItem = ref<any>(null)
const showForm = ref(false), editing = ref<any>(null)
const form = reactive<Record<string, any>>({ type: 'business', name: '', description: '', assignee: null, due_date: '', notes: '' })

// Review submit
const showReviewAssign = ref(false), reviewAssigneeId = ref(null), reviewTarget = ref<any>(null)
const showReview = ref(false)
const reviewForm = reactive<Record<string, any>>({ conclusion: 'pass', review_method: 'meeting', review_date: '', stakeholders_ids: [], notes: '' })

// Baseline
const showBaseline = ref(false), blReqs = ref<Requirement[]>([])
const blForm = reactive<Record<string, any>>({ type: 'business', name: '', version: '', description: '', notes: '', requirement_ids: [] })

// Change
const showChange = ref(false), changeEditing = ref<any>(null), blSearch = ref('')
const changeForm = reactive<Record<string, any>>({ baseline: '', object_desc: '', content: '', assignee: null, approver: null, notes: '' })
const baselineReqs = ref<Requirement[]>([])
const reqSearch = ref('')
const showApprove = ref(false), approveTarget = ref<any>(null), approveAction = ref(''), approveReason = ref('')
const showChangeDetail = ref(false), changeDetailItem = ref<any>(null)

const filteredBaselines = computed(() =>
  baselines.value.filter(bl => !blSearch.value || bl.name.includes(blSearch.value) || bl.version.includes(blSearch.value))
)
const filteredBaselineReqs = computed(() =>
  baselineReqs.value.filter(r => !reqSearch.value || r.name.includes(reqSearch.value) || (r.description && r.description.includes(reqSearch.value)))
)
async function selectBaseline(bl: any) {
  changeForm.baseline = bl.id; blSearch.value = bl.name + ' v' + bl.version; reqSearch.value = ''; changeForm.object_desc = ''
  try {
    const r = await getReqBaseline(bl.id)
    baselineReqs.value = r.data.requirements_data ?? []
  } catch { baselineReqs.value = [] }
}
function selectReq(req: Requirement) {
  changeForm.object_desc = `[${typeLabels[req.type] || req.type}] ${req.name}`
}

function formatTime(t: string | null | undefined) {
  if (!t) return '—'
  try {
    const d = new Date(t)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch { return t }
}

function statusCls(s: string) {
  return { submitted: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-700', pending_review: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20', review_passed: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20', baselined: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' }[s] || ''
}
function typeCls(t: string) {
  return { business: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', software_func: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', software_perf: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', other: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }[t] || ''
}
function approvalCls(s: string) {
  return { pending: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20', approved: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20', rejected: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' }[s] || ''
}

async function load() {
  try {
    const params: Record<string, any> = { page: page.value, page_size: pageSize.value, project: projectStore.activeProjectId || undefined }
    if (tab.value === 'submit') {
      params.exclude_status = 'review_passed,baselined'
      const r = await getRequirements(params); items.value = r.data.results ?? []; total.value = r.data.count ?? items.value.length
    }
  } catch { items.value = [] }
}

async function loadReviewItems() {
  try {
    const params: Record<string, any> = { page: reviewPage.value, page_size: reviewPageSize.value, project: projectStore.activeProjectId || undefined, status: 'pending_review,review_passed' }
    const r = await getRequirements(params)
    reviewItems.value = (r.data.results ?? []).filter((req: Requirement) =>
      !req.review_assignee || req.review_assignee === null
    )
    reviewTotal.value = r.data.count ?? reviewItems.value.length
  } catch { reviewItems.value = [] }
}

async function loadBaselines() {
  try {
    const r = await getReqBaselines({ project: projectStore.activeProjectId || undefined })
    baselines.value = r.data.results ?? []
  } catch { baselines.value = [] }
}

async function loadChanges() {
  try {
    const r = await getReqChanges({})
    changes.value = r.data.results ?? []
  } catch { changes.value = [] }
}

async function loadOrgMembers() {
  try {
    const r = await request.get('/org-members/', { params: { page_size: 9999, project: projectStore.activeProjectId || undefined } })
    orgMembers.value = r.data.results ?? []
  } catch { orgMembers.value = [] }
}

async function loadBaselineReqs() {
  try {
    const r = await getRequirements({ page_size: 9999, project: projectStore.activeProjectId || undefined, type: blForm.type, status: 'review_passed' })
    blReqs.value = r.data.results ?? []
  } catch { blReqs.value = [] }
}

// Submit tab
function openForm(r: any) {
  editing.value = r
  if (r) { Object.assign(form, r) }
  else { Object.assign(form, { type: 'business', name: '', description: '', assignee: null, due_date: '', notes: '' }) }
  showForm.value = true
}
async function saveForm() {
  try {
    if (editing.value) { await updateRequirement(editing.value.id, { ...form } as any) }
    else { await createRequirement({ ...form, project: projectStore.activeProjectId } as any) }
    showForm.value = false; toast.show('保存成功', 'success'); load()
  } catch { toast.show('保存失败', 'error') }
}
async function doDelete(r: Requirement) {
  if (!(await confirm.show('确认删除此需求？'))) return
  try { await deleteRequirement(r.id); toast.show('删除成功', 'success'); load() } catch { toast.show('删除失败', 'error') }
}
function doSubmitReview(r: Requirement) {
  reviewTarget.value = r; reviewAssigneeId.value = null; showReviewAssign.value = true
}
async function confirmSubmitReview() {
  try {
    await submitReview(reviewTarget.value.id, { review_assignee_id: reviewAssigneeId.value })
    showReviewAssign.value = false; toast.show('已提交评审', 'success'); load()
  } catch { toast.show('操作失败', 'error') }
}
async function doWithdraw(r: Requirement) {
  try { await withdrawReview(r.id); toast.show('已撤回评审', 'success'); load() } catch { toast.show('操作失败', 'error') }
}

// Review tab
function openReviewForm(r: Requirement) {
  reviewTarget.value = r
  Object.assign(reviewForm, { conclusion: 'pass', review_method: 'meeting', review_date: '', stakeholders_ids: [], notes: '' })
  showReview.value = true
}
async function confirmReview() {
  try {
    await createReqReview({ ...reviewForm, requirement: reviewTarget.value.id, reviewer: null } as any)
    showReview.value = false; toast.show('评审完成', 'success'); loadReviewItems()
  } catch { toast.show('操作失败', 'error') }
}

// Baseline tab
function openBaselineForm() {
  Object.assign(blForm, { type: 'business', name: '', version: '', description: '', notes: '', requirement_ids: [] })
  showBaseline.value = true; loadBaselineReqs()
}
async function saveBaseline() {
  try {
    const projectId = projectStore.activeProjectId
    if (!projectId) { toast.show('请先选择项目', 'error'); return }
    if (!blForm.name?.trim()) { toast.show('请输入基线名称', 'error'); return }
    if (!blForm.requirement_ids || blForm.requirement_ids.length === 0) { toast.show('请至少选择一个需求纳入基线', 'error'); return }
    if (!blForm.version?.trim()) {
      const now = new Date()
      blForm.version = `v${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
    }
    const payload = {
      type: blForm.type,
      name: blForm.name,
      version: blForm.version || `v${new Date().toISOString().slice(0,10).replace(/-/g,'')}`,
      description: blForm.description,
      notes: blForm.notes,
      requirement_ids: blForm.requirement_ids,
      project: projectId,
    }
    console.log('[基线] payload:', JSON.stringify(payload))
    await createReqBaseline(payload)
    showBaseline.value = false; toast.show('基线已生成', 'success'); loadBaselines(); load()
  } catch (e: any) {
    console.error('[基线] 错误:', e)
    const data = e?.response?.data
    let msg = '保存失败'
    if (data) {
      if (typeof data === 'string') {
        msg = data
      } else if (typeof data === 'object') {
        msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('；') : v}`).join(' | ')
      }
    }
    console.log('[基线] 错误消息:', msg)
    toast.show(msg, 'error')
  }
}

async function deleteBaseline(bl: any) {
  if (!(await confirm.show('确认删除基线「' + bl.name + '」？将同时移除该基线关联的所有需求的基线状态。'))) return
  try {
    await deleteReqBaseline(bl.id)
    toast.show('基线已删除', 'success')
    await loadBaselines()
  } catch { toast.show('删除失败', 'error') }
}

// Change tab
function openChangeForm() {
  changeEditing.value = null
  Object.assign(changeForm, { baseline: '', object_desc: '', content: '', assignee: null, approver: null, notes: '' })
  showChange.value = true
}
function editChange(c: any) {
  changeEditing.value = c
  Object.assign(changeForm, { baseline: c.baseline, object_desc: c.object_desc, content: c.content, assignee: c.assignee, approver: c.approver, notes: c.notes })
  showChange.value = true
  blSearch.value = (c.baseline_name || '') + ' v' + (c.baseline_version || '')
  getReqBaseline(c.baseline).then(r => { baselineReqs.value = r.data.requirements_data ?? [] }).catch(() => { baselineReqs.value = [] })
}
async function saveChange() {
  try {
    if (changeEditing.value) { await updateReqChange(changeEditing.value.id, changeForm as any) }
    else { await createReqChange({ ...changeForm, baseline: Number(changeForm.baseline) } as any) }
    showChange.value = false; toast.show('保存成功', 'success'); loadChanges()
  } catch { toast.show('保存失败', 'error') }
}
function openApproveDialog(c: any, action: string) {
  approveTarget.value = c; approveAction.value = action; approveReason.value = ''
  showApprove.value = true
}
async function confirmApprove() {
  try {
    if (approveAction.value === 'approved') {
      await approveReqChange(approveTarget.value.id)
      toast.show('审批通过', 'success')
    } else {
      await rejectReqChange(approveTarget.value.id)
      toast.show('已驳回', 'success')
    }
    showApprove.value = false
    loadChanges()
  } catch (e: any) {
    const data = e?.response?.data
    let msg = '操作失败'
    if (data) {
      if (typeof data === 'string') msg = data
      else if (typeof data === 'object') msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('；') : v}`).join(' | ')
    }
    toast.show(msg, 'error')
  }
}

function viewChangeDetail(c: any) {
  changeDetailItem.value = c
  showChangeDetail.value = true
}
function viewDetail(r: any) {
  detailItem.value = r
  showDetail.value = true
}

watch(tab, (v) => {
  if (v === 'submit') load()
  if (v === 'review') loadReviewItems()
  if (v === 'baseline') loadBaselines()
  if (v === 'change') { loadChanges(); loadBaselines() }
})

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('[data-picker="stakeholder"]')) reviewStakePicker.value = false
}

onMounted(async () => {
  await loadOrgMembers()
  load()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
