<template>
  <div class="page-with-tabs">
    <div class="page-header"><h1>消息通知</h1></div>
    <t-table :data="notifications" :columns="columns" row-key="id" size="small" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const notifications = ref<any[]>([])
const columns = [
  { colKey: 'title', title: '标题' },
  { colKey: 'type', title: '类型', width: 100 },
  { colKey: 'is_read', title: '已读', width: 60 },
  { colKey: 'created_at', title: '时间', width: 180 },
]
onMounted(async () => {
  try { const r = await fetch('/api/v1/notifications/'); notifications.value = await r.json() } catch {}
})
</script>
<style scoped>
.page-with-tabs { padding: var(--pmos-spacing-md); }
.page-header { margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; }
</style>
