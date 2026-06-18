<template>
  <div class="work-page">
    <div class="page-header"><h1>工作管理</h1></div>
    <t-tabs v-model="tab">
      <t-tab-panel value="equipment" label="设备管理">
        <t-table :data="equipments" :columns="equipColumns" row-key="id" size="small" />
      </t-tab-panel>
      <t-tab-panel value="leave" label="请假管理">
        <t-table :data="leaves" :columns="leaveColumns" row-key="id" size="small" />
      </t-tab-panel>
      <t-tab-panel value="timesheet" label="工时管理">
        <t-table :data="timesheets" :columns="tsColumns" row-key="id" size="small" />
      </t-tab-panel>
    </t-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const tab = ref('equipment')
const equipments = ref<any[]>([])
const leaves = ref<any[]>([])
const timesheets = ref<any[]>([])
const equipColumns = [
  { colKey: 'name', title: '设备名称' },
  { colKey: 'code', title: '编号', width: 120 },
  { colKey: 'type', title: '类型', width: 100 },
  { colKey: 'status', title: '状态', width: 100 },
]
const leaveColumns = [
  { colKey: 'user', title: '申请人', width: 120 },
  { colKey: 'type', title: '类型', width: 80 },
  { colKey: 'start_date', title: '开始', width: 100 },
  { colKey: 'end_date', title: '结束', width: 100 },
  { colKey: 'status', title: '状态', width: 80 },
]
const tsColumns = [
  { colKey: 'user', title: '人员', width: 120 },
  { colKey: 'date', title: '日期', width: 100 },
  { colKey: 'hours', title: '工时', width: 80 },
]
onMounted(async () => {
  try {
    const [e, l, t] = await Promise.all([
      fetch('/api/v1/equipments/').then(r => r.json()),
      fetch('/api/v1/leaves/').then(r => r.json()),
      fetch('/api/v1/timesheets/').then(r => r.json()),
    ])
    equipments.value = e
    leaves.value = l
    timesheets.value = t
  } catch {}
})
</script>
<style scoped>
.work-page { padding: var(--pmos-spacing-md); }
.page-header { margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; }
</style>
