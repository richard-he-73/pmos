import { ref, computed } from 'vue'

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1200,
}

const currentWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

export function useResponsive() {
  const device = computed(() => {
    if (currentWidth.value < BREAKPOINTS.mobile) return 'mobile'
    if (currentWidth.value < BREAKPOINTS.tablet) return 'tablet'
    return 'desktop'
  })

  const isMobile = computed(() => device.value === 'mobile')
  const isTablet = computed(() => device.value === 'tablet')
  const isDesktop = computed(() => device.value === 'desktop')

  let resizeHandler: (() => void) | null = null

  function startListening() {
    resizeHandler = () => { currentWidth.value = window.innerWidth }
    window.addEventListener('resize', resizeHandler)
  }

  function stopListening() {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
  }

  return { currentWidth, device, isMobile, isTablet, isDesktop, startListening, stopListening }
}
