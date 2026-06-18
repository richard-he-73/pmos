import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useResponsiveStore = defineStore('responsive', () => {
  const width = ref(window.innerWidth)
  const sidebarCollapsed = ref(false)
  const drawerVisible = ref(false)

  const BREAKPOINTS = { mobile: 768, tablet: 1200 }

  const device = computed(() => {
    if (width.value < BREAKPOINTS.mobile) return 'mobile'
    if (width.value < BREAKPOINTS.tablet) return 'tablet'
    return 'desktop'
  })
  const isMobile = computed(() => device.value === 'mobile')
  const isDesktop = computed(() => device.value === 'desktop')

  function updateWidth() { width.value = window.innerWidth }
  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
  function toggleDrawer() { drawerVisible.value = !drawerVisible.value }

  let handler: (() => void) | null = null
  function init() {
    handler = () => updateWidth()
    window.addEventListener('resize', handler)
  }
  function destroy() {
    if (handler) window.removeEventListener('resize', handler)
  }

  return {
    width, device, isMobile, isDesktop,
    sidebarCollapsed, drawerVisible,
    toggleSidebar, toggleDrawer,
    init, destroy,
  }
})
