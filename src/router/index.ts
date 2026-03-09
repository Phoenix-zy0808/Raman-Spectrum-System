import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// 定义路由元信息接口
interface RouteMeta {
  title?: string           // 页面标题
  requiresAuth?: boolean   // 是否需要登录
  roles?: string[]         // 允许访问的角色列表
  icon?: string            // 菜单图标
  hidden?: boolean         // 是否在菜单中隐藏
  keepAlive?: boolean      // 是否缓存页面
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/index/index.vue'),
    meta: {
      title: '综合监控大屏',
      requiresAuth: true,
      roles: ['admin', 'user', 'guest'],
      icon: 'Dashboard'
    }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('@/views/analysis/index.vue'),
    meta: {
      title: '光谱解析中心',
      requiresAuth: true,
      roles: ['admin', 'user'],
      icon: 'Analysis'
    }
  },
  {
    path: '/model-lab',
    name: 'ModelLab',
    component: () => import('@/views/model-lab/index.vue'),
    meta: {
      title: 'AI 模型实验室',
      requiresAuth: true,
      roles: ['admin', 'user'],
      icon: 'Platform'
    }
  },
  {
    path: '/data-management',
    name: 'DataManagement',
    component: () => import('@/views/DataManagement/index.vue'),
    meta: {
      title: '数据管理中心',
      requiresAuth: true,
      roles: ['admin', 'user'],
      icon: 'Document'
    }
  },
  {
    path: '/quantitative',
    name: 'Quantitative',
    component: () => import('@/views/quantitative/index.vue'),
    meta: {
      title: '定量分析实验室',
      requiresAuth: true,
      roles: ['admin', 'user'],
      icon: 'TrendCharts'
    }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/report/index.vue'),
    meta: {
      title: '智能报告生成器',
      requiresAuth: true,
      roles: ['admin', 'user', 'guest'],
      icon: 'Document'
    }
  },
  // 管理后台路由（仅管理员）
  {
    path: '/system',
    name: 'System',
    component: () => import('@/views/system/index.vue'),
    meta: {
      title: '系统管理',
      requiresAuth: true,
      roles: ['admin'],
      icon: 'Setting',
      hidden: true  // 不在主菜单显示
    }
  },
  // 量子计算模块（暂未实现）
  {
    path: '/quantum',
    name: 'Quantum',
    component: () => import('@/views/quantum/index.vue'),
    meta: {
      title: '量子计算',
      requiresAuth: true,
      roles: ['admin'],
      icon: 'Cpu',
      hidden: true  // 暂未实现，隐藏入口
    }
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      hidden: true
    }
  }
] as const

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ========== 路由守卫 ==========

/**
 * 白名单路由（不需要登录即可访问）
 */
const whiteList = ['/login', '/404']

/**
 * 检查用户是否有访问路由的权限
 */
function hasPermission(roles: string[], userRole: string): boolean {
  // 管理员可以访问所有路由
  if (userRole === 'admin') return true
  // 检查用户角色是否在允许列表中
  return roles.includes(userRole) || roles.includes('*')
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const targetRoute = to as typeof to & { meta: RouteMeta }
  const { requiresAuth, roles, hidden } = targetRoute.meta || {}

  // 设置页面标题
  if (targetRoute.meta?.title) {
    document.title = `${targetRoute.meta.title} | 拉曼光谱智能检测系统`
  }

  // 尝试从 localStorage 加载登录状态（页面刷新后 Pinia 状态会重置）
  if (!authStore.isLoggedIn) {
    const loaded = authStore.loadFromStorage()
    if (!loaded) {
      // 未登录
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next('/login')
      }
      return
    }
  }

  // 已登录状态下的路由守卫
  if (to.path === '/login') {
    // 如果已登录还访问登录页，重定向到首页
    next({ path: '/dashboard', replace: true })
    return
  }

  // 检查是否需要权限
  if (requiresAuth !== false) {
    const userRole = authStore.userRole

    // 如果路由配置了角色限制
    if (roles && roles.length > 0) {
      if (!hasPermission(roles, userRole)) {
        // 权限不足，重定向到 403 页面或首页
        next({ path: '/dashboard', replace: true })
        return
      }
    }

    // 隐藏路由（需要通过地址栏访问）
    if (hidden && from.name === null) {
      // 首次访问隐藏路由，检查是否有特殊令牌或参数
      // 这里可以根据需要添加额外逻辑
    }
  }

  next()
})

// 路由解析完成后重置标题
router.afterEach((to) => {
  const targetRoute = to as typeof to & { meta: RouteMeta }
  if (targetRoute.meta?.title) {
    document.title = `${targetRoute.meta.title} | 拉曼光谱智能检测系统`
  }
})

export default router