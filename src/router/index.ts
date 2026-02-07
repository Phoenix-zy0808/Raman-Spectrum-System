import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' // 默认跳登录
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/dashboard', // 综合监控大屏
    name: 'Dashboard',
    component: () => import('@/views/index/index.vue')
  },
  {
    path: '/analysis', // 光谱解析中心
    name: 'Analysis',
    component: () => import('@/views/analysis/index.vue')
  },
  {
    // ★★★ 核心修改：指向你新建的 model-lab 文件夹 ★★★
    path: '/model-lab',
    name: 'ModelLab',
    // 确保你已经创建了 src/views/model-lab/index.vue 文件，否则这里会报错
    component: () => import('@/views/model-lab/index.vue')
  },

  // --- 以下是还没做的页面（继续保持占位，暂时跳到解析页，防止报错） ---
  {
    path: '/data-manage',
    name: 'DataManage',
    component: () => import('@/views/analysis/index.vue')
  },
  {
    path: '/quantitative',
    name: 'Quantitative',
    component: () => import('@/views/analysis/index.vue')
  },
  {
    path: '/quantum',
    name: 'Quantum',
    component: () => import('@/views/analysis/index.vue')
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/analysis/index.vue')
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/views/analysis/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router