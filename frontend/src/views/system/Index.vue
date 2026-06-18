<template>
  <div class="page-with-tabs">
    <div class="page-header"><h1>系统管理</h1></div>
    <t-tabs v-model="tab">
      <t-tab-panel value="users" label="用户管理">
        <t-table :data="users" :columns="userColumns" row-key="id" size="small" />
      </t-tab-panel>
      <t-tab-panel value="roles" label="角色管理">
        <t-table :data="roles" :columns="roleColumns" row-key="id" size="small" />
      </t-tab-panel>
      <t-tab-panel value="logs" label="操作日志">
        <t-table :data="logs" :columns="logColumns" row-key="id" size="small" />
      </t-tab-panel>
    </t-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const tab = ref('users')
const users = ref<any[]>([])
const roles = ref<any[]>([])
const logs = ref<any[]>([])
const userColumns = [
  { colKey: 'username', title: '用户名', width: 120 },
  { colKey: 'real_name', title: '姓名', width: 120 },
  { colKey: 'department', title: '部门', width: 120 },
  { colKey: 'position', title: '职位' },
]
const roleColumns = [
  { colKey: 'name', title: '角色名称' },
  { colKey: 'code', title: '编码', width: 120 },
  { colKey: 'is_system', title: '系统内置', width: 100 },
]
const logColumns = [
  { colKey: 'user', title: '操作人', width: 120 },
  { colKey: 'action', title: '操作', width: 100 },
  { colKey: 'model_name', title: '对象', width: 100 },
  { colKey: 'created_at', title: '时间', width: 180 },
]
onMounted(async () => {
  try {
    const [u, r] = await Promise.all([
      fetch('/api/v1/users/').then(r => r.json()),
      fetch('/api/v1/roles/').then(r => r.json()),
    ])
    users.value = u
    roles.value = r
  } catch {}
})
</script>
<style scoped>
.page-with-tabs { padding: var(--pmos-spacing-md); }
.page-header { margin-bottom: var(--pmos-spacing-md); }
.page-header h1 { margin: 0; }
</style>
