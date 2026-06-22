import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    meta: { requiresAuth: false },
    component: () => import('@/views/login/Index.vue'),
  },
  {
    path: '/',
    component: () => import('@/views/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/Index.vue') },
      { path: 'projects', name: 'Projects', component: () => import('@/views/project/List.vue') },
      { path: 'projects/:id', name: 'ProjectDetail', component: () => import('@/views/project/Detail.vue') },
      { path: 'plans', name: 'Plans', component: () => import('@/views/plan/Index.vue') },
      { path: 'tasks', name: 'Tasks', component: () => import('@/views/task/Index.vue') },
      { path: 'requirements', name: 'Requirements', component: () => import('@/views/requirement/Index.vue') },
      { path: 'testing', name: 'Testing', component: () => import('@/views/testing/Index.vue') },
      { path: 'bugs', name: 'Bugs', component: () => import('@/views/bug/Index.vue') },
      { path: 'work', name: 'Work', component: () => import('@/views/work/Index.vue') },
      { path: 'documents', name: 'Documents', component: () => import('@/views/document/Index.vue') },
      { path: 'statistics', name: 'Statistics', component: () => import('@/views/statistics/Index.vue') },
      { path: 'notifications', name: 'Notifications', component: () => import('@/views/notification/Index.vue') },
      { path: 'communication', name: 'Communication', component: () => import('@/views/communication/Index.vue') },
      { path: 'issues', name: 'Issues', component: () => import('@/views/issues/Index.vue') },
      { path: 'organization', name: 'Organization', component: () => import('@/views/organization/Index.vue') },
      { path: 'resource', name: 'Resource', component: () => import('@/views/resource/Index.vue') },
      { path: 'releases', name: 'Releases', component: () => import('@/views/release/Index.vue') },
      { path: 'system', name: 'System', component: () => import('@/views/system/Index.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth === false) return true
  if (!authStore.isLoggedIn && !authStore.token) return '/login'
  // 确保用户信息（含当前项目）加载完成后再渲染页面
  if (!authStore.currentUser && authStore.token) {
    await authStore.fetchCurrentUser()
  }
  return true
})

export default router
