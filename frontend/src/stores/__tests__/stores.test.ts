import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useProjectStore } from '@/stores/project'

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('initializes with no token', () => {
    const store = useAuthStore()
    expect(store.token).toBe('')
    expect(store.isLoggedIn).toBe(false)
    expect(store.currentUser).toBeNull()
  })

  it('restores token from sessionStorage', () => {
    sessionStorage.setItem('pmos-token', 'test-token-123')
    const store = useAuthStore()
    expect(store.token).toBe('test-token-123')
    expect(store.isLoggedIn).toBe(true)
  })

  it('logout clears all state', () => {
    sessionStorage.setItem('pmos-token', 'test-token')
    sessionStorage.setItem('pmos-refresh-token', 'test-refresh')
    const store = useAuthStore()
    expect(store.isLoggedIn).toBe(true)

    store.logout()
    expect(store.token).toBe('')
    expect(store.refreshToken).toBe('')
    expect(store.isLoggedIn).toBe(false)
    expect(store.currentUser).toBeNull()
    expect(sessionStorage.getItem('pmos-token')).toBeNull()
  })
})

describe('ProjectStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('initializes with no active project', () => {
    const store = useProjectStore()
    expect(store.activeProjectId).toBeNull()
    expect(store.activeProjectName).toBe('')
  })

  it('setActiveProject stores correctly', () => {
    const store = useProjectStore()
    store.setActiveProject(1, '测试项目')
    expect(store.activeProjectId).toBe(1)
    expect(store.activeProjectName).toBe('测试项目')
    expect(sessionStorage.getItem('pmos-active-project-id')).toBe('1')
    expect(sessionStorage.getItem('pmos-active-project-name')).toBe('测试项目')
  })

  it('clearActiveProject removes state', () => {
    const store = useProjectStore()
    store.setActiveProject(1, '项目A')
    store.clearActiveProject()
    expect(store.activeProjectId).toBeNull()
    expect(store.activeProjectName).toBe('')
  })
})
