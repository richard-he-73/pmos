<template>
  <div class="testing-page">
    <div class="page-header">
      <h1>测试管理</h1>
      <t-button theme="primary" @click="showBugDialog = true">
        <template #icon><t-icon name="bug" /></template>
        报告缺陷
      </t-button>
    </div>

    <t-tabs v-model="activeTab" @change="fetchData">
      <t-tab-panel value="plans" label="测试计划">
        <t-table :data="testPlans" :columns="planColumns" row-key="id" :loading="loading" size="small" />
      </t-tab-panel>

      <t-tab-panel value="bugs" label="缺陷列表">
        <t-table :data="bugs" :columns="bugColumns" row-key="id" :loading="loading" size="small" hover />
      </t-tab-panel>
    </t-tabs>

    <t-dialog v-model:visible="showBugDialog" header="报告缺陷" @confirm="handleCreateBug">
      <t-form :data="bugForm">
        <t-form-item label="标题" name="title">
          <t-input v-model="bugForm.title" />
        </t-form-item>
        <t-form-item label="严重程度" name="severity">
          <t-select v-model="bugForm.severity">
            <t-option value="critical" label="致命" />
            <t-option value="major" label="严重" />
            <t-option value="minor" label="一般" />
            <t-option value="trivial" label="轻微" />
          </t-select>
        </t-form-item>
        <t-form-item label="模块" name="module">
          <t-input v-model="bugForm.module" />
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea v-model="bugForm.description" :rows="4" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTestPlans, getBugs, createBug } from '@/api/modules/testing'
import type { TestPlan, Bug } from '@/api/modules/testing'

const activeTab = ref('plans')
const loading = ref(false)
const showBugDialog = ref(false)

const testPlans = ref<TestPlan[]>([])
const bugs = ref<Bug[]>([])

const bugForm = ref({ title: '', severity: 'minor', module: '', description: '' })

const planColumns = [
  { colKey: 'name', title: '计划名称' },
  { colKey: 'version', title: '版本', width: 100 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'assignee', title: '负责人', width: 120 },
  { colKey: 'start_date', title: '开始', width: 100 },
  { colKey: 'end_date', title: '结束', width: 100 },
]

const bugColumns = [
  { colKey: 'title', title: '标题', ellipsis: true },
  { colKey: 'severity', title: '严重程度', width: 100 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'module', title: '模块', width: 120 },
  { colKey: 'reporter_name', title: '报告人', width: 120 },
  { colKey: 'created_at', title: '创建时间', width: 180 },
]

async function fetchData() {
  loading.value = true
  try {
    if (activeTab.value === 'plans') {
      const res = await getTestPlans()
      testPlans.value = res.data
    } else {
      const res = await getBugs()
      bugs.value = res.data.results || []
    }
  } finally {
    loading.value = false
  }
}

async function handleCreateBug() {
  try {
    await createBug(bugForm.value as any)
    showBugDialog.value = false
    bugForm.value = { title: '', severity: 'minor', module: '', description: '' }
    activeTab.value = 'bugs'
    fetchData()
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.testing-page { padding: var(--pmos-spacing-md); }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; }
</style>
