import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Index.vue'),
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/project/List.vue'),
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/views/system/Index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
