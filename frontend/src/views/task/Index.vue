<template>
  <div class="page-with-tabs">
    <div class="page-header"><h1>任务管理</h1></div>
    <t-table :data="tasks" :columns="columns" row-key="id" size="small" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const tasks = ref<any[]>([])
const columns = [
  { colKey: 'name', title: '任务名称' },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'priority', title: '优先级', width: 80 },
  { colKey: 'assignee_name', title: '负责人', width: 120 },
  { colKey: 'due_date', title: '截止日期', width: 120 },
]
onMounted(async () => {
  try { const r = await fetch('/api/v1/tasks/'); tasks.value = await r.json() } catch {}
})
</script>
<style scoped>
.page-with-tabs { padding: var(--pmos-spacing-md); }
.page-header { margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; }
</style>
