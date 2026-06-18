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
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: { requiresAuth: true },
    component: () => import('@/views/dashboard/Index.vue'),
  },
  {
    path: '/projects',
    name: 'Projects',
    meta: { requiresAuth: true },
    component: () => import('@/views/project/List.vue'),
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    meta: { requiresAuth: true },
    component: () => import('@/views/project/Detail.vue'),
  },
  {
    path: '/plans',
    name: 'Plans',
    meta: { requiresAuth: true },
    component: () => import('@/views/plan/Index.vue'),
  },
  {
    path: '/tasks',
    name: 'Tasks',
    meta: { requiresAuth: true },
    component: () => import('@/views/task/Index.vue'),
  },
  {
    path: '/requirements',
    name: 'Requirements',
    meta: { requiresAuth: true },
    component: () => import('@/views/requirement/Index.vue'),
  },
  {
    path: '/testing',
    name: 'Testing',
    meta: { requiresAuth: true },
    component: () => import('@/views/testing/Index.vue'),
  },
  {
    path: '/bugs',
    name: 'Bugs',
    meta: { requiresAuth: true },
    component: () => import('@/views/bug/Index.vue'),
  },
  {
    path: '/work',
    name: 'Work',
    meta: { requiresAuth: true },
    component: () => import('@/views/work/Index.vue'),
  },
  {
    path: '/documents',
    name: 'Documents',
    meta: { requiresAuth: true },
    component: () => import('@/views/document/Index.vue'),
  },
  {
    path: '/statistics',
    name: 'Statistics',
    meta: { requiresAuth: true },
    component: () => import('@/views/statistics/Index.vue'),
  },
  {
    path: '/notifications',
    name: 'Notifications',
    meta: { requiresAuth: true },
    component: () => import('@/views/notification/Index.vue'),
  },
  {
    path: '/system',
    name: 'System',
    meta: { requiresAuth: true },
    component: () => import('@/views/system/Index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth === false) {
    next()
    return
  }

  if (!authStore.isLoggedIn && !authStore.token) {
    next('/login')
    return
  }

  // 加载用户信息
  if (!authStore.currentUser && authStore.token) {
    authStore.fetchCurrentUser()
  }

  next()
})

export default router
