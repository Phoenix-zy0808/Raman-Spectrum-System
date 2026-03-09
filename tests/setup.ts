/**
 * Vitest 测试配置文件
 * 用于设置测试全局环境、mock 等
 */

import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'

// 全局 Mock console.error
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  // 忽略 Vue 警告中的特定错误
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Failed to resolve component') ||
      args[0].includes('Invalid prop') ||
      args[0].includes('Missing required prop'))
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

// 创建全局的 Pinia 实例
const pinia = createPinia()

// 创建全局的路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

// 配置 Vue Test Utils
config.global.plugins = [pinia, router]

// 全局 Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// 全局 Mock window.scrollTo
window.scrollTo = () => {}

// 导出空对象
export {}
