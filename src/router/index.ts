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

  // ★★★ 数据管理中心 ★★★
  {
    path: '/data-management',
    name: 'DataManagement',
    component: () => import('@/views/DataManagement/index.vue')
  },

  // ★★★ 量子增强视图 ★★★
  {
    path: '/quantum',
    name: 'Quantum',
    component: () => import('@/views/quantum/index.vue')
  },

  // ★★★ 新增：定量分析实验室 ★★★
  {
    path: '/quantitative',
    name: 'Quantitative',
    // 指向你新建的定量分析页面
    component: () => import('@/views/quantitative/index.vue')
  },

  // ★★★ 新增：智能报告生成器 ★★★
  {
    path: '/report',
    name: 'Report',
    // 指向你新建的报告生成页面
    component: () => import('@/views/report/index.vue')
  },

  // --- 还没做的页面 (继续保持占位) ---
  {
    path: '/system',
    name: 'System',
    component: () => import('@/views/system/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router