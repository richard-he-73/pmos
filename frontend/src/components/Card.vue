<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
    <h3 v-if="title" class="text-base font-semibold mb-3">{{ title }}</h3>
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{ title?: string }>()
</script>
