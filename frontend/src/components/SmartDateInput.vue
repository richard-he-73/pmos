<template>
  <div>
    <input
      ref="inputRef"
      type="text"
      :value="displayText"
      @input="onInput"
      @keydown.enter="onEnter"
      @blur="onBlur"
      class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { tryRecognize, fmtDate } from '@/utils/smartDate'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const inputRef = ref<HTMLInputElement | null>(null)
const rawInput = ref('')
const recognized = ref<string | null>(null)

const displayText = computed(() => recognized.value || rawInput.value)

function onInput(e: Event) {
  const t = e.target as HTMLInputElement
  rawInput.value = t.value
  recognized.value = null
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
}

watch(() => props.modelValue, (val) => {
  if (val && val !== recognized.value) {
    recognized.value = val
    rawInput.value = val
    if (inputRef.value) inputRef.value.value = val
  }
}, { immediate: true })

function focus() { inputRef.value?.focus() }
function select() { inputRef.value?.select() }
defineExpose({ focus, select })
</script>
