<template>
  <div class="page-with-tabs">
    <div class="page-header"><h1>文档管理</h1></div>
    <t-table :data="documents" :columns="columns" row-key="id" size="small" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const documents = ref<any[]>([])
const columns = [
  { colKey: 'title', title: '文档名称' },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'version', title: '版本', width: 80 },
  { colKey: 'created_at', title: '创建时间', width: 180 },
]
onMounted(async () => {
  try { const r = await fetch('/api/v1/documents/'); documents.value = await r.json() } catch {}
})
</script>
<style scoped>
.page-with-tabs { padding: var(--pmos-spacing-md); }
.page-header { margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; }
</style>
