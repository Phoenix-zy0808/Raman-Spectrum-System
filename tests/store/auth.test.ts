/**
 * Auth Store 测试
 * 测试用户认证状态管理功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/store/auth'

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    // 清理 localStorage
    localStorage.clear()
  })

  describe('初始状态', () => {
    it('应该正确初始化默认状态', () => {
      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.userInfo).toBeNull()
      expect(authStore.tokenExpiry).toBe(0)
      expect(authStore.rememberMe).toBe(false)
    })
  })

  describe('getters', () => {
    it('isAuthenticated - 未登录时应该返回 false', () => {
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('isAuthenticated - 已登录且 Token 未过期时应该返回 true', () => {
      authStore.isLoggedIn = true
      authStore.tokenExpiry = Date.now() + 1000 * 60 * 60 // 1 小时后过期
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('isAuthenticated - Token 过期时应该返回 false', () => {
      authStore.isLoggedIn = true
      authStore.tokenExpiry = Date.now() - 1000 // 1 秒前过期
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('isTokenExpiringSoon - Token 即将过期时应该返回 true', () => {
      authStore.tokenExpiry = Date.now() + 1000 * 2 // 2 秒后过期
      expect(authStore.isTokenExpiringSoon).toBe(true)
    })

    it('isTokenExpiringSoon - Token 未即将过期时应该返回 false', () => {
      authStore.tokenExpiry = Date.now() + 1000 * 60 * 10 // 10 分钟后过期
      expect(authStore.isTokenExpiringSoon).toBe(false)
    })

    it('userName - 未登录时应该返回默认值', () => {
      expect(authStore.userName).toBe('未登录用户')
    })

    it('userName - 已登录时应该返回用户名', () => {
      authStore.userInfo = {
        user_id: '1',
        username: 'testUser',
      }
      expect(authStore.userName).toBe('testUser')
    })
  })

  describe('actions - loginSuccess', () => {
    it('登录成功后应该正确设置状态', () => {
      const token = 'test-token'
      const userInfo = {
        user_id: '1',
        username: 'testUser',
        email: 'test@example.com',
        role: 'user',
      }
      const expiresIn = 1000 * 60 * 60 // 1 小时

      authStore.loginSuccess(token, userInfo, expiresIn)

      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.userInfo).toEqual(userInfo)
      expect(authStore.tokenExpiry).toBeGreaterThan(Date.now())
      expect(localStorage.getItem('raman_token')).toBe(token)
    })

    it('登录成功后应该使用默认过期时间', () => {
      const token = 'test-token'
      const userInfo = {
        user_id: '1',
        username: 'testUser',
      }

      authStore.loginSuccess(token, userInfo)

      expect(authStore.tokenExpiry).toBeGreaterThan(Date.now())
      expect(authStore.tokenExpiry).toBeLessThan(Date.now() + 1000 * 60 * 60 * 3) // 小于 3 小时
    })
  })

  describe('actions - logout', () => {
    it('登出后应该清除所有状态', () => {
      // 先登录
      authStore.loginSuccess('test-token', {
        user_id: '1',
        username: 'testUser',
      })

      // 然后登出
      authStore.logout()

      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.userInfo).toBeNull()
      expect(authStore.tokenExpiry).toBe(0)
      expect(localStorage.getItem('raman_token')).toBeNull()
    })
  })

  describe('actions - loadFromStorage', () => {
    it('应该能够从 localStorage 加载有效的登录状态', () => {
      const token = 'test-token'
      const expiry = Date.now() + 1000 * 60 * 60
      const userInfo = {
        user_id: '1',
        username: 'testUser',
      }

      localStorage.setItem('raman_token', token)
      localStorage.setItem('raman_token_expiry', expiry.toString())
      localStorage.setItem('raman_user_info', JSON.stringify(userInfo))

      const loaded = authStore.loadFromStorage()

      expect(loaded).toBe(true)
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.userInfo).toEqual(userInfo)
    })

    it('Token 过期时应该自动登出', () => {
      const token = 'test-token'
      const expiry = Date.now() - 1000 // 已过期

      localStorage.setItem('raman_token', token)
      localStorage.setItem('raman_token_expiry', expiry.toString())

      const loaded = authStore.loadFromStorage()

      expect(loaded).toBe(false)
      expect(authStore.isLoggedIn).toBe(false)
      expect(localStorage.getItem('raman_token')).toBeNull()
    })
  })

  describe('actions - updateUserInfo', () => {
    it('应该能够更新用户信息', () => {
      authStore.userInfo = {
        user_id: '1',
        username: 'testUser',
        email: 'test@example.com',
      }

      authStore.updateUserInfo({
        username: 'newUser',
        role: 'admin',
      })

      expect(authStore.userInfo?.username).toBe('newUser')
      expect(authStore.userInfo?.role).toBe('admin')
      expect(authStore.userInfo?.email).toBe('test@example.com') // 保持不变
    })

    it('记住我状态下应该同步更新 localStorage', () => {
      authStore.userInfo = {
        user_id: '1',
        username: 'testUser',
      }
      authStore.rememberMe = true

      authStore.updateUserInfo({
        username: 'newUser',
      })

      const storedInfo = JSON.parse(localStorage.getItem('raman_user_info') || '{}')
      expect(storedInfo.username).toBe('newUser')
    })
  })
})
