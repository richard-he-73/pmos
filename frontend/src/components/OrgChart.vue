<template>
  <div class="flex flex-col items-center gap-0">
    <template v-if="nodes.length">
      <!-- 当前层卡片 -->
      <div class="flex justify-center gap-4 flex-wrap">
        <div v-for="node in nodes" :key="node.id"
          class="flex flex-col items-center text-center relative px-1" style="min-width:130px">
          <!-- 从上往下的连接线 -->
          <div v-if="depth>0" class="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
          <!-- 卡片 -->
          <div class="w-full px-3 py-2 rounded-lg border text-sm shadow-sm cursor-default transition hover:shadow-md"
            :class="node.is_active
              ? 'bg-white dark:bg-slate-700 border-blue-300 dark:border-blue-500 text-slate-800 dark:text-slate-100'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'">
            <div class="font-medium truncate">{{ node.name }}</div>
            <div v-if="node.manager_name" class="text-xs text-slate-400 truncate mt-0.5">{{ node.manager_name }}</div>
            <!-- 状态指示 -->
            <div class="flex justify-center gap-1 mt-1">
              <span class="inline-block w-2 h-2 rounded-full" :class="node.is_active ? 'bg-green-500' : 'bg-red-400'"></span>
              <span class="text-xs" :class="node.is_active ? 'text-green-600' : 'text-red-400'">{{ node.is_active ? '启用' : '禁用' }}</span>
            </div>
          </div>
          <!-- 向下连接线 -->
          <div v-if="childMap.has(node.id)" class="flex flex-col items-center">
            <div class="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
          </div>
        </div>
      </div>
      <!-- 水平连接线 -->
      <svg v-if="hasMultiBranch" class="w-full" style="height:4px;max-width:100%">
        <line x1="0" y1="2" :x2="(branchCount-1)*154" y2="2" stroke="#94a3b8" stroke-width="1.5" />
      </svg>
      <!-- 递归子级行 -->
      <div class="flex justify-center gap-4 flex-wrap mt-0">
        <template v-for="node in nodes" :key="'r'+node.id">
          <OrgChart v-if="childMap.has(node.id)" :items="items" :depth="depth+1" :parent-id="node.id" style="min-width:130px" />
        </template>
      </div>
    </template>
    <div v-else-if="depth===0" class="text-center py-8 text-slate-400 text-sm">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineOptions } from 'vue'
defineOptions({ name: 'OrgChart' })

const props = defineProps<{
  items: any[]
  depth: number
  parentId: number | null
}>()

const nodes = computed(() => {
  const arr = props.items.filter(i => (i.parent ?? null) === props.parentId)
  arr.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'))
  return arr
})

const childMap = computed(() => {
  const ids = new Set<number>()
  for (const item of props.items) {
    if (item.parent != null) ids.add(item.parent)
  }
  return ids
})

const branchCount = computed(() => nodes.value.filter(n => childMap.value.has(n.id)).length)
const hasMultiBranch = computed(() => branchCount.value > 1)
</script>
