import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ToastItem { msg: string; type: 'success' | 'error' | 'warning' }

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])

  function show(msg: string, type: 'success' | 'error' | 'warning' = 'error') {
    toasts.value.push({ msg, type })
    setTimeout(() => { toasts.value.shift() }, 3000)
  }

  return { toasts, show }
})
