<template>
  <div class="page-with-tabs">
    <div class="page-header"><h1>缺陷管理</h1></div>
    <t-table :data="bugs" :columns="columns" row-key="id" size="small" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const bugs = ref<any[]>([])
const columns = [
  { colKey: 'title', title: '标题' },
  { colKey: 'severity', title: '严重程度', width: 100 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'module', title: '模块', width: 120 },
]
onMounted(async () => {
  try { const r = await fetch('/api/v1/bugs/'); bugs.value = (await r.json()).results || [] } catch {}
})
</script>
<style scoped>
.page-with-tabs { padding: var(--pmos-spacing-md); }
.page-header { margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; }
</style>
