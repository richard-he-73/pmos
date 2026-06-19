<template>
  <Teleport to="body">
    <div v-if="store.visible" class="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40" @click.self="store.cancel()">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <p class="text-sm text-slate-600 dark:text-slate-300 mb-6">{{ store.message }}</p>
        <div class="flex justify-end gap-2">
          <button @click="store.cancel()" class="px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">取消</button>
          <button @click="store.confirm()" class="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700">确认</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { useConfirmStore } from '@/stores/confirm'
const store = useConfirmStore()
</script>
