import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const STORAGE_KEY = 'pmos-theme'

  const getInitialTheme = (): 'light' | 'dark' => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  }

  const currentTheme = ref<'light' | 'dark'>(getInitialTheme())

  function applyTheme(theme: 'light' | 'dark') {
    document.documentElement.dataset.theme = theme
    // TDesign 主题模式
    document.documentElement.setAttribute('theme-mode', theme === 'dark' ? 'dark' : 'light')
  }

  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(theme: 'light' | 'dark') {
    currentTheme.value = theme
  }

  let mediaQuery: MediaQueryList | null = null

  function listenSystem() {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        currentTheme.value = e.matches ? 'dark' : 'light'
      }
    })
  }

  watch(currentTheme, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
    applyTheme(val)
  }, { immediate: true })

  return { currentTheme, toggleTheme, setTheme, listenSystem }
})
