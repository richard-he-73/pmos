<template>
  <div v-if="nodes.length" class="flex justify-center" style="gap:24px">
    <div v-for="node in nodes" :key="node.id"
      class="flex flex-col items-center" :style="{ width: colWidths.get(node.id) + 'px' }">
      <!-- 向上连接线 -->
      <div v-if="depth>0" class="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
      <!-- 卡片 -->
      <div class="w-full px-3 py-2 rounded-lg border text-sm shadow-sm cursor-default transition hover:shadow-md bg-white dark:bg-slate-700 border-blue-300 dark:border-blue-500 text-slate-800 dark:text-slate-100 text-center" style="width:140px">
        <div class="font-medium truncate">{{ node.name }}</div>
        <div v-if="node.manager_name" class="text-xs text-slate-400 truncate mt-0.5">{{ node.manager_name }}</div>
      </div>
      <!-- 向下连线 + 子级 -->
      <template v-if="childIds.has(node.id)">
        <div class="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
        <!-- 水平连接线 -->
        <svg v-if="childCounts.get(node.id)! > 1" :width="subtreeWidth(node.id)" height="4" style="display:block">
          <line x1="0" y1="2" :x2="subtreeWidth(node.id)" y2="2" stroke="#94a3b8" stroke-width="1.5" />
          <!-- 垂直线到各子节点顶部 -->
          <line v-for="(_, ci) in childNodes(node.id)" :key="'t'+ci"
            :x1="childOffset(node.id, ci)" y1="0" :x2="childOffset(node.id, ci)" y2="4" stroke="#94a3b8" stroke-width="1.5" />
        </svg>
        <OrgChart :items="items" :depth="depth+1" :parent-id="node.id" />
      </template>
    </div>
  </div>
  <div v-else-if="depth===0" class="text-center py-8 text-slate-400 text-sm">暂无数据</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
defineOptions({ name: 'OrgChart' })

const props = defineProps<{
  items: any[]
  depth: number
  parentId: number | null
}>()

const NODE_W = 140
const GAP = 24

const nodes = computed(() => {
  const arr = props.items.filter(i => (i.parent ?? null) === props.parentId && i.is_active)
  arr.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'))
  return arr
})

const childIds = computed(() => {
  const ids = new Set<number>()
  for (const item of props.items) {
    if (item.parent != null && item.is_active) ids.add(item.parent)
  }
  return ids
})

const childCounts = computed(() => {
  const map = new Map<number, number>()
  for (const node of nodes.value) {
    if (childIds.value.has(node.id)) {
      map.set(node.id, props.items.filter(i => (i.parent ?? null) === node.id && i.is_active).length)
    }
  }
  return map
})

// 计算每列宽度 = 该子树的总宽度
function subtreeWidth(id: number): number {
  const kids = props.items.filter(i => (i.parent ?? null) === id && i.is_active)
  if (kids.length === 0) return NODE_W
  let total = 0
  for (const kid of kids) {
    total += subtreeWidth(kid.id)
  }
  total += (kids.length - 1) * GAP
  return Math.max(total, NODE_W)
}

const colWidths = computed(() => {
  const map = new Map<number, number>()
  for (const node of nodes.value) {
    map.set(node.id, subtreeWidth(node.id))
  }
  return map
})

function childNodes(id: number) {
  return props.items.filter(i => (i.parent ?? null) === id && i.is_active)
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'))
}

function childOffset(parentId: number, childIndex: number): number {
  const kids = childNodes(parentId)
  let offset = 0
  for (let i = 0; i < childIndex; i++) {
    offset += subtreeWidth(kids[i].id) + GAP
  }
  offset += subtreeWidth(kids[childIndex].id) / 2
  return offset
}
</script>
