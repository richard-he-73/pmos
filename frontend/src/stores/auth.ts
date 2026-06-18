import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getCurrentUser } from '@/api/modules/auth'
import type { LoginData, UserInfo } from '@/api/modules/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('pmos-token') || '')
  const refreshToken = ref(localStorage.getItem('pmos-refresh-token') || '')
  const currentUser = ref<UserInfo | null>(null)
  const isLoggedIn = ref(!!token.value)

  async function loginAction(data: LoginData) {
    const res = await login(data)
    token.value = res.data.access
    refreshToken.value = res.data.refresh
    localStorage.setItem('pmos-token', res.data.access)
    localStorage.setItem('pmos-refresh-token', res.data.refresh)
    isLoggedIn.value = true
    await fetchCurrentUser()
  }

  async function fetchCurrentUser() {
    try {
      const res = await getCurrentUser()
      currentUser.value = res.data
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    refreshToken.value = ''
    currentUser.value = null
    isLoggedIn.value = false
    localStorage.removeItem('pmos-token')
    localStorage.removeItem('pmos-refresh-token')
  }

  return { token, refreshToken, currentUser, isLoggedIn, loginAction, fetchCurrentUser, logout }
})
