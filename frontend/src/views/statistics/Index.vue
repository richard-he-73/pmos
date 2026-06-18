<template>
  <div class="page-with-tabs">
    <div class="page-header"><h1>统计分析</h1></div>
    <t-row :gutter="[16, 16]">
      <t-col :span="8"><t-card :bordered="false" title="项目统计" :loading="loading">{{ overview?.total || '-' }} 个项目</t-card></t-col>
      <t-col :span="8"><t-card :bordered="false" title="缺陷分布" :loading="loading" /></t-col>
      <t-col :span="8"><t-card :bordered="false" title="工时汇总" :loading="loading" /></t-col>
    </t-row>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const loading = ref(true)
const overview = ref<any>(null)
onMounted(async () => {
  try { const r = await fetch('/api/v1/statistics/project_overview/'); overview.value = await r.json() } catch {}
  finally { loading.value = false }
})
</script>
<style scoped>
.page-with-tabs { padding: var(--pmos-spacing-md); }
.page-header { margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; }
</style>
