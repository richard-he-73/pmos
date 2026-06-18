<template>
  <div class="page-with-tabs">
    <div class="page-header"><h1>需求管理</h1></div>
    <t-tabs v-model="tab">
      <t-tab-panel value="business" label="业务需求">
        <t-table :data="businessReqs" :columns="bizColumns" row-key="id" size="small" />
      </t-tab-panel>
      <t-tab-panel value="software" label="软件需求">
        <t-table :data="softwareReqs" :columns="swColumns" row-key="id" size="small" />
      </t-tab-panel>
    </t-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const tab = ref('business')
const businessReqs = ref<any[]>([])
const softwareReqs = ref<any[]>([])
const bizColumns = [
  { colKey: 'code', title: '编号', width: 150 },
  { colKey: 'name', title: '需求名称' },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'priority', title: '优先级', width: 80 },
]
const swColumns = [
  { colKey: 'code', title: '编号', width: 150 },
  { colKey: 'name', title: '需求名称' },
  { colKey: 'module', title: '模块', width: 120 },
  { colKey: 'status', title: '状态', width: 100 },
]
onMounted(async () => {
  try {
    const [biz, sw] = await Promise.all([
      fetch('/api/v1/business-requirements/').then(r => r.json()),
      fetch('/api/v1/software-requirements/').then(r => r.json()),
    ])
    businessReqs.value = biz
    softwareReqs.value = sw
  } catch {}
})
</script>
<style scoped>
.page-with-tabs { padding: var(--pmos-spacing-md); }
.page-header { margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; }
</style>
