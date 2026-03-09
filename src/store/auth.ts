import { defineStore } from 'pinia'

export interface UserInfo {
  user_id: string
  username: string
  email?: string
  role?: string
  avatar?: string
}

/**
 * 认证状态管理
 * 管理用户登录状态、用户信息、Token 过期时间等
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 登录状态
    isLoggedIn: false,

    // 用户信息
    userInfo: null as UserInfo | null,

    // Token 过期时间（时间戳）
    tokenExpiry: 0,

    // 记住我
    rememberMe: false,
  }),

  getters: {
    // 是否已登录且 Token 未过期
    isAuthenticated: (state) => {
      return state.isLoggedIn && state.tokenExpiry > Date.now()
    },

    // Token 是否即将过期（5 分钟内）
    isTokenExpiringSoon: (state) => {
      const fiveMinutes = 5 * 60 * 1000
      return state.tokenExpiry - Date.now() < fiveMinutes
    },

    // 获取当前 Token（用于请求拦截器）
    currentToken: (state) => {
      return localStorage.getItem('raman_token') || ''
    },

    // 获取用户名
    userName: (state) => state.userInfo?.username || '未登录用户',

    // 获取用户角色
    userRole: (state) => state.userInfo?.role || 'unknown',
  },

  actions: {
    /**
     * 登录成功后的处理
     */
    loginSuccess(token: string, userInfo: UserInfo, expiresIn?: number) {
      this.isLoggedIn = true
      this.userInfo = userInfo

      // 计算过期时间（默认 2 小时）
      const expiryTime = expiresIn || 2 * 60 * 60 * 1000
      this.tokenExpiry = Date.now() + expiryTime

      // 存储 Token
      localStorage.setItem('raman_token', token)
      localStorage.setItem('raman_token_expiry', this.tokenExpiry.toString())

      // 如果记住我，存储用户信息
      if (this.rememberMe) {
        localStorage.setItem('raman_user_info', JSON.stringify(userInfo))
        localStorage.setItem('raman_remember_me', 'true')
      }
    },

    /**
     * 登出
     */
    logout() {
      this.isLoggedIn = false
      this.userInfo = null
      this.tokenExpiry = 0

      // 清除本地存储
      localStorage.removeItem('raman_token')
      localStorage.removeItem('raman_token_expiry')
      localStorage.removeItem('raman_user_info')
      localStorage.removeItem('raman_remember_me')
    },

    /**
     * 从本地存储加载登录状态
     */
    loadFromStorage() {
      const token = localStorage.getItem('raman_token')
      const expiry = localStorage.getItem('raman_token_expiry')
      const userInfo = localStorage.getItem('raman_user_info')
      const rememberMe = localStorage.getItem('raman_remember_me')

      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10)
        if (expiryTime > Date.now()) {
          // Token 未过期
          this.isLoggedIn = true
          this.tokenExpiry = expiryTime

          if (userInfo) {
            this.userInfo = JSON.parse(userInfo)
          }

          this.rememberMe = rememberMe === 'true'
          return true
        } else {
          // Token 已过期，清除
          this.logout()
        }
      }

      return false
    },

    /**
     * 设置记住我状态
     */
    setRememberMe(value: boolean) {
      this.rememberMe = value
    },

    /**
     * 更新用户信息
     */
    updateUserInfo(info: Partial<UserInfo>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...info }
        if (this.rememberMe) {
          localStorage.setItem('raman_user_info', JSON.stringify(this.userInfo))
        }
      }
    },
  },
})
