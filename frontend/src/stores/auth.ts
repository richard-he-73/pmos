import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getCurrentUser } from '@/api/modules/auth'
import { useProjectStore } from '@/stores/project'
import type { LoginData, UserInfo } from '@/api/modules/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(sessionStorage.getItem('pmos-token') || '')
  const refreshToken = ref(sessionStorage.getItem('pmos-refresh-token') || '')
  const currentUser = ref<UserInfo | null>(null)
  const isLoggedIn = ref(!!token.value)

  async function loginAction(data: LoginData) {
    const res = await login(data)
    token.value = res.data.access
    refreshToken.value = res.data.refresh
    sessionStorage.setItem('pmos-token', res.data.access)
    sessionStorage.setItem('pmos-refresh-token', res.data.refresh)
    isLoggedIn.value = true
    await fetchCurrentUser()
  }

  async function fetchCurrentUser() {
    try {
      const res = await getCurrentUser()
      currentUser.value = res.data
      // 从后端加载当前项目
      const projectStore = useProjectStore()
      projectStore.loadFromUser(res.data)
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    refreshToken.value = ''
    currentUser.value = null
    isLoggedIn.value = false
    sessionStorage.removeItem('pmos-token')
    sessionStorage.removeItem('pmos-refresh-token')
  }

  return { token, refreshToken, currentUser, isLoggedIn, loginAction, fetchCurrentUser, logout }
})
