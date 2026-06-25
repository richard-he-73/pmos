import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/api/request'
import type { UserInfo } from '@/api/modules/auth'

export const useProjectStore = defineStore('project', () => {
  // 优先从 sessionStorage 恢复，保证页面刷新时立即可用
  const activeProjectId = ref<number | null>(Number(sessionStorage.getItem('pmos-active-project-id')) || null)
  const activeProjectName = ref(sessionStorage.getItem('pmos-active-project-name') || '')

  function setActiveProject(id: number, name: string) {
    activeProjectId.value = id
    activeProjectName.value = name
    sessionStorage.setItem('pmos-active-project-id', String(id))
    sessionStorage.setItem('pmos-active-project-name', name)
    // 同步到后端（失败时只打印警告，不影响本地状态）
    request.patch('/users/me/', { active_project: id }).catch((err) => {
      console.warn('同步当前项目到后端失败:', err)
    })
  }

  function loadFromUser(user: UserInfo) {
    if (user?.active_project) {
      activeProjectId.value = user.active_project
      activeProjectName.value = user.active_project_name || ''
      sessionStorage.setItem('pmos-active-project-id', String(user.active_project))
      sessionStorage.setItem('pmos-active-project-name', user.active_project_name || '')
    }
  }

  function clearActiveProject() {
    activeProjectId.value = null
    activeProjectName.value = ''
    sessionStorage.removeItem('pmos-active-project-id')
    sessionStorage.removeItem('pmos-active-project-name')
    request.patch('/users/me/', { active_project: null }).catch((err) => {
      console.warn('清除当前项目同步后端失败:', err)
    })
  }

  return { activeProjectId, activeProjectName, setActiveProject, loadFromUser, clearActiveProject }
})
