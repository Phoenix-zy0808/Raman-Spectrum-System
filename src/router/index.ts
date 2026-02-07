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
    path: '/model-lab', // AI 模型实验室
    name: 'ModelLab',
    component: () => import('@/views/model-lab/index.vue')
  },

  // ★★★ 新增：数据管理中心 ★★★
  {
    path: '/data-management',
    name: 'DataManagement',
    // 指向你新建的数据管理页面
    component: () => import('@/views/DataManagement/index.vue')
  },

  // ★★★ 新增：量子增强视图 ★★★
  {
    path: '/quantum',
    name: 'Quantum',
    // 指向你新建的量子视图页面
    component: () => import('@/views/quantum/index.vue')
  },

  // --- 以下是还没做的页面（继续保持占位，暂时跳到解析页，防止报错） ---
  {
    path: '/quantitative',
    name: 'Quantitative',
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