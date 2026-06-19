import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmStore = defineStore('confirm', () => {
  const visible = ref(false)
  const message = ref('')
  let resolveFn: ((value: boolean) => void) | null = null

  function show(msg: string): Promise<boolean> {
    message.value = msg
    visible.value = true
    return new Promise((resolve) => {
      resolveFn = resolve
    })
  }

  function confirm() {
    visible.value = false
    resolveFn?.(true)
    resolveFn = null
  }

  function cancel() {
    visible.value = false
    resolveFn?.(false)
    resolveFn = null
  }

  return { visible, message, show, confirm, cancel }
})
