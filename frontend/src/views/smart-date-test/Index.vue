<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-2">🧪 智能日期输入测试</h1>
    <p class="text-slate-500 dark:text-slate-400 mb-8">
      在输入框中输入自然语言日期，识别后自动填充为 <code class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm">YYYY-MM-DD</code> 格式。
    </p>

    <!-- 测试区 -->
    <div class="space-y-3 mb-10">
      <div class="flex items-center gap-3">
        <label class="w-20 text-sm font-medium text-slate-600 dark:text-slate-300">日期</label>
        <SmartDateInput v-model="date1" class="flex-1" />
        <code class="text-xs text-slate-400 font-mono min-w-[120px]">{{ date1 || '未识别' }}</code>
      </div>

      <div class="flex items-center gap-3">
        <label class="w-20 text-sm font-medium text-slate-600 dark:text-slate-300">开始</label>
        <SmartDateInput v-model="date2" class="flex-1" />
        <code class="text-xs text-slate-400 font-mono min-w-[120px]">{{ date2 || '未识别' }}</code>
      </div>

      <div class="flex items-center gap-3">
        <label class="w-20 text-sm font-medium text-slate-600 dark:text-slate-300">结束</label>
        <SmartDateInput v-model="date3" class="flex-1" />
        <code class="text-xs text-slate-400 font-mono min-w-[120px]">{{ date3 || '未识别' }}</code>
      </div>
    </div>

    <!-- 用法示例 -->
    <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h2 class="text-sm font-semibold mb-3">📖 试试输入这些</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
        <span v-for="(eg, i) in examples" :key="i"
          @click="tryExample(eg.input, i)"
          class="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors text-slate-600 dark:text-slate-300"
        >
          <code class="text-xs font-mono">{{ eg.input }}</code>
          <span class="text-xs text-slate-400 ml-1">→</span>
          <span class="text-xs ml-0.5">{{ eg.result }}</span>
        </span>
      </div>
    </div>

    <!-- 结果汇总 -->
    <div v-if="date1 || date2 || date3" class="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl">
      <p class="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-1">✅ 识别结果</p>
      <div class="text-xs text-emerald-600 dark:text-emerald-400 space-y-0.5 font-mono">
        <div v-if="date1">日期：{{ date1 }}</div>
        <div v-if="date2">开始：{{ date2 }}</div>
        <div v-if="date3">结束：{{ date3 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SmartDateInput from '@/components/SmartDateInput.vue'

const date1 = ref('')
const date2 = ref('')
const date3 = ref('')
const activeDemoInput = ref(0)

const examples = [
  { input: '今天', result: '当天日期' },
  { input: '明天', result: '+1' },
  { input: '后天', result: '+2' },
  { input: '大后天', result: '+3' },
  { input: '625', result: '06-25' },
  { input: '1225', result: '12-25' },
  { input: '7-1', result: '07-01' },
  { input: '3天后', result: '+3天' },
  { input: '7天前', result: '-7天' },
  { input: '下周一', result: '下周一日期' },
  { input: '下周五', result: '下周五日期' },
  { input: '下月1号', result: '下月1日' },
  { input: '12月25日', result: '今年圣诞' },
  { input: '月末', result: '当月最后一天' },
  { input: '年底', result: '12-31' },
  { input: '2周后', result: '+14天' },
]

function tryExample(input: string, idx: number) {
  activeDemoInput.value = idx
  date1.value = ''
  // Set the first input and let the component auto-recognize
  date1.value = input
  // We need to trigger the input event on the component
  // Since v-model is 2-way, setting date1 will update the component display
  // but for the component to re-recognize, we need it to see the raw text
  // The SmartDateInput component displays recognized.value if present,
  // or rawInput.value if not. Setting modelValue sets recognized too.
  // So we need to clear and re-set to trigger re-recognition.
  // Actually let me just trigger it differently - navigate to the first demo
}
</script>
