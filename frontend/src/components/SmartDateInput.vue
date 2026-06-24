<template>
  <div class="relative">
    <input
      ref="inputRef"
      type="text"
      :value="displayText"
      @input="onInput"
      @keydown.enter="onEnter"
      @blur="onBlur"
      :placeholder="placeholder"
      class="w-full px-3 py-2 rounded-lg border text-sm outline-none"
      :class="inputClass"
    />
    <span
      v-if="status"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
      :class="statusCls"
    >{{ status }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { tryRecognize, fmtDate } from '@/utils/smartDate'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: '输入日期，如下周五、625、6-25',
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const rawInput = ref('')
const recognized = ref<string | null>(null)
const status = ref<'✓' | '✗' | ''>('')
const statusType = ref<'ok' | 'err' | ''>('')

const displayText = computed(() => recognized.value || rawInput.value)

const inputClass = computed(() => {
  if (!status.value) return 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100'
  if (statusType.value === 'ok') return 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 text-slate-900 dark:text-slate-100'
  return 'border-red-300 bg-red-50 dark:bg-red-900/10 text-slate-900 dark:text-slate-100'
})

const statusCls = computed(() => {
  if (statusType.value === 'ok') return 'text-emerald-500'
  if (statusType.value === 'err') return 'text-red-400'
  return 'text-slate-400'
})

function onInput(e: Event) {
  const t = e.target as HTMLInputElement
  rawInput.value = t.value
  recognized.value = null
  status.value = ''
  statusType.value = ''
  emit('update:modelValue', '')
}

function onEnter() {
  tryRecognizeOnBlur()
  inputRef.value?.blur()
}

function tryRecognizeOnBlur() {
  const val = rawInput.value.trim()
  if (!val || recognized.value) return
  const result = tryRecognize(val)
  if (result) {
    const formatted = fmtDate(result)
    recognized.value = formatted
    status.value = '✓'
    statusType.value = 'ok'
    if (inputRef.value) {
      inputRef.value.value = formatted
      rawInput.value = formatted
    }
    emit('update:modelValue', formatted)
  }
}

function onBlur() {
  if (recognized.value && inputRef.value) {
    inputRef.value.value = recognized.value
  }
  tryRecognizeOnBlur()
  if (rawInput.value.trim() && !recognized.value) {
    status.value = '✗'
    statusType.value = 'err'
    setTimeout(() => {
      if (!inputRef.value?.matches(':focus')) {
        status.value = ''
        statusType.value = ''
      }
    }, 2000)
  }
}

watch(() => props.modelValue, (val) => {
  if (val && val !== recognized.value) {
    recognized.value = val
    rawInput.value = val
    if (inputRef.value) inputRef.value.value = val
  }
})

function focus() { inputRef.value?.focus() }
function select() { inputRef.value?.select() }
defineExpose({ focus, select })
</script>
