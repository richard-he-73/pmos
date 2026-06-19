<template>
  <Teleport to="body">
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
      <div v-for="(t, i) in toasts" :key="i"
        class="flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300"
        :class="t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-red-600 text-white'">
        <span>{{ t.type === 'success' ? '✓' : t.type === 'warning' ? '⚠' : '✕' }}</span>
        <span>{{ t.msg }}</span>
      </div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
const { toasts } = useToastStore()
</script>
