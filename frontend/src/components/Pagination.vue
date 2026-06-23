<template>
  <div v-if="total > 0" class="flex items-center justify-between px-3 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-sm">
    <div class="text-xs text-slate-400">
      共 {{ total }} 条，第 {{ (page - 1) * pageSize + 1 }}-{{ Math.min(page * pageSize, total) }} 条
    </div>
    <div class="flex items-center gap-1.5">
      <select :value="pageSize" @change="onPageSizeChange" class="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
        <option :value="100">100条/页</option>
      </select>
      <template v-if="totalPages > 1">
        <button @click="goPage(page - 1)" :disabled="page <= 1" class="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">上一页</button>
        <template v-for="p in pages" :key="p">
          <button v-if="p === '...'" disabled class="px-1 text-slate-400 text-xs">...</button>
          <button v-else @click="goPage(p)" class="px-2.5 py-1 rounded text-xs font-medium" :class="p === page ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'">{{ p }}</button>
        </template>
        <button @click="goPage(page + 1)" :disabled="page >= totalPages" class="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">下一页</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'update:page', val: number): void
  (e: 'update:pageSize', val: number): void
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pages = computed(() => {
  const tp = totalPages.value
  const cur = props.page
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const result: (number | string)[] = []
  result.push(1)
  if (cur > 3) result.push('...')
  const start = Math.max(2, cur - 1)
  const end = Math.min(tp - 1, cur + 1)
  for (let i = start; i <= end; i++) result.push(i)
  if (cur < tp - 2) result.push('...')
  result.push(tp)
  return result
})

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  emit('update:page', p)
}

function onPageSizeChange(e: Event) {
  const val = Number((e.target as HTMLSelectElement).value)
  emit('update:pageSize', val)
}
</script>
