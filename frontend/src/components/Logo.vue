<template>
  <div class="flex items-center gap-2" :class="sizeClass">
    <div class="rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold shrink-0"
         :class="iconSize">
      P
    </div>
    <span v-if="showText" class="font-bold" :class="textSize">PMOS</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}>(), {
  size: 'md',
  showText: true,
})

const sizeClass = computed(() => ({
  sm: '',
  md: '',
  lg: '',
}[props.size || 'md']))

const iconSize = computed(() => ({
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-lg',
}[props.size || 'md']))

const textSize = computed(() => ({
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
}[props.size || 'md']))
</script>
