import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' // 访问域名根目录，去登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/dashboard', // 【首页】综合监控大屏
    name: 'Dashboard',
    component: () => import('@/views/index/index.vue')
  },
  {
    path: '/analysis', // 【内页】光谱解析中心 (把之前的 /index 改成 /analysis，语义更清晰)
    name: 'Analysis',
    component: () => import('@/views/analysis/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router