<template>
  <div class="flex gap-1 items-center">
    <input ref="yRef" type="text" inputmode="numeric" maxlength="4" placeholder="yyyy"
      :value="year" @input="onYearInput" @keydown.backspace="onYearBackspace"
      class="w-16 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-center outline-none focus:ring-2 focus:ring-blue-500" />
    <span class="text-slate-400 text-sm">-</span>
    <input ref="mRef" type="text" inputmode="numeric" maxlength="2" placeholder="mm"
      :value="month" @input="onMonthInput" @keydown.backspace="onMonthBackspace"
      class="w-14 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-center outline-none focus:ring-2 focus:ring-blue-500" />
    <span class="text-slate-400 text-sm">-</span>
    <input ref="dRef" type="text" inputmode="numeric" maxlength="2" placeholder="dd"
      :value="day" @input="onDayInput"
      class="w-14 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-center outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const yRef = ref<HTMLInputElement | null>(null)
const mRef = ref<HTMLInputElement | null>(null)
const dRef = ref<HTMLInputElement | null>(null)

const year = ref('')
const month = ref('')
const day = ref('')

// 从初始值解析
watch(() => props.modelValue, (val) => {
  if (!val) { year.value = ''; month.value = ''; day.value = ''; return }
  const parts = val.split('-')
  year.value = parts[0] || ''
  month.value = parts[1] || ''
  day.value = parts[2] || ''
}, { immediate: true })

function emitValue() {
  if (year.value && month.value && day.value) {
    emit('update:modelValue', `${year.value}-${month.value}-${day.value}`)
  } else {
    emit('update:modelValue', '')
  }
}

function onYearInput(e: Event) {
  const t = e.target as HTMLInputElement
  year.value = t.value.replace(/\D/g, '').slice(0, 4)
  t.value = year.value
  if (year.value.length === 4) mRef.value?.focus()
  emitValue()
}

function onYearBackspace(e: KeyboardEvent) {
  if (year.value.length === 0) {
    // 已在最前，不做特殊处理
  }
}

function onMonthInput(e: Event) {
  const t = e.target as HTMLInputElement
  let v = t.value.replace(/\D/g, '').slice(0, 2)
  if (v.length === 1 && parseInt(v) > 1) v = '0' + v
  if (parseInt(v) > 12) v = '12'
  month.value = v
  t.value = v
  if (month.value.length === 2) dRef.value?.focus()
  emitValue()
}

function onMonthBackspace(e: KeyboardEvent) {
  if (month.value.length === 0) yRef.value?.focus()
}

function onDayInput(e: Event) {
  const t = e.target as HTMLInputElement
  let v = t.value.replace(/\D/g, '').slice(0, 2)
  if (v.length === 1 && parseInt(v) > 3) v = '0' + v
  if (parseInt(v) > 31) v = '31'
  day.value = v
  t.value = v
  emitValue()
}
</script>
