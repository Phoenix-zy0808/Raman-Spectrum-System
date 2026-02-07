import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' // 初始进入登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/dashboard', // 原本的大屏首页
    name: 'Dashboard',
    component: () => import('@/views/index/index.vue')
  },
  {
    path: '/index', // 必须叫这个，登录跳转才能找得到
    name: 'Index',
    component: () => import('@/views/analysis/index.vue') // 对应刚才创建的文件
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

