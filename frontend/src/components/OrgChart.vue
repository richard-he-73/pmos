<template>
  <div class="flex justify-center gap-6" :class="depth>0?'flex-1':''">
    <template v-if="nodes.length">
      <div v-for="node in nodes" :key="node.id" class="flex flex-col items-center" style="min-width:140px;max-width:180px">
        <!-- 向上连接线 -->
        <div v-if="depth>0" class="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
        <!-- 卡片 -->
        <div class="w-full px-3 py-2 rounded-lg border text-sm shadow-sm cursor-default transition hover:shadow-md bg-white dark:bg-slate-700 border-blue-300 dark:border-blue-500 text-slate-800 dark:text-slate-100 text-center">
          <div class="font-medium truncate">{{ node.name }}</div>
          <div v-if="node.manager_name" class="text-xs text-slate-400 truncate mt-0.5">{{ node.manager_name }}</div>
        </div>
        <!-- 向下连接线 -->
        <div v-if="childIds.has(node.id)" class="flex flex-col items-center w-full">
          <div class="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
          <!-- 水平连接线（多个子节点时） -->
          <svg v-if="childBranchCounts.get(node.id)! > 1" class="w-full" style="height:4px">
            <line x1="0" y1="2" :x2="(childBranchCounts.get(node.id)! - 1) * 164" y2="2" stroke="#94a3b8" stroke-width="1.5" />
          </svg>
        </div>
        <!-- 子级（直接位于父节点下方） -->
        <OrgChart v-if="childIds.has(node.id)" :items="items" :depth="depth+1" :parent-id="node.id" />
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

// 只显示启用中的部门
const nodes = computed(() => {
  const arr = props.items.filter(i => (i.parent ?? null) === props.parentId && i.is_active)
  arr.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'))
  return arr
})

// 哪些 id 有子节点
const childIds = computed(() => {
  const ids = new Set<number>()
  for (const item of props.items) {
    if (item.parent != null && item.is_active) ids.add(item.parent)
  }
  return ids
})

// 每个父节点的子分支数
const childBranchCounts = computed(() => {
  const map = new Map<number, number>()
  for (const node of nodes.value) {
    if (childIds.value.has(node.id)) {
      const count = props.items.filter(i => (i.parent ?? null) === node.id && i.is_active).length
      map.set(node.id, count)
    }
  }
  return map
})
</script>
