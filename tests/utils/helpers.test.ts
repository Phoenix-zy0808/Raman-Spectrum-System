/**
 * 工具函数测试
 * 测试常用工具函数的正确性
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// 模拟测试一些常用工具函数
describe('Utility Functions', () => {
  describe('formatNumber - 数字格式化', () => {
    const formatNumber = (num: number, decimals: number = 2): string => {
      return num.toFixed(decimals)
    }

    it('应该正确格式化数字', () => {
      expect(formatNumber(3.14159)).toBe('3.14')
      expect(formatNumber(100)).toBe('100.00')
      expect(formatNumber(0.1)).toBe('0.10')
    })

    it('应该支持自定义小数位数', () => {
      expect(formatNumber(3.14159, 3)).toBe('3.142')
      expect(formatNumber(3.14159, 0)).toBe('3')
      expect(formatNumber(3.14159, 5)).toBe('3.14159')
    })

    it('应该处理负数', () => {
      expect(formatNumber(-3.14159)).toBe('-3.14')
    })
  })

  describe('debounce - 防抖函数', () => {
    const debounce = <T extends (...args: unknown[]) => unknown>(
      fn: T,
      delay: number
    ): ((...args: Parameters<T>) => void) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      return (...args: Parameters<T>) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
          fn(...args)
          timeoutId = null
        }, delay)
      }
    }

    it('应该在延迟后执行函数', async () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(100)
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('应该取消之前的调用', async () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      await vi.advanceTimersByTimeAsync(100)
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })
  })

  describe('throttle - 节流函数', () => {
    const throttle = <T extends (...args: unknown[]) => unknown>(
      fn: T,
      limit: number
    ): ((...args: Parameters<T>) => void) => {
      let inThrottle = false
      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          fn(...args)
          inThrottle = true
          setTimeout(() => {
            inThrottle = false
          }, limit)
        }
      }
    }

    it('应该限制函数执行频率', async () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(mockFn).toHaveBeenCalledTimes(1)

      await vi.advanceTimersByTimeAsync(100)
      throttledFn()

      expect(mockFn).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })
  })

  describe('clamp - 数值限制', () => {
    const clamp = (value: number, min: number, max: number): number => {
      return Math.min(Math.max(value, min), max)
    }

    it('应该限制数值在范围内', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('应该处理边界值', () => {
      expect(clamp(0, 0, 10)).toBe(0)
      expect(clamp(10, 0, 10)).toBe(10)
    })
  })

  describe('isValidEmail - 邮箱验证', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    it('应该验证有效的邮箱地址', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('应该拒绝无效的邮箱地址', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test@example')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('formatFileSize - 文件大小格式化', () => {
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
    }

    it('应该正确格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(1048576)).toBe('1.00 MB')
      expect(formatFileSize(1073741824)).toBe('1.00 GB')
    })

    it('应该处理非整数大小', () => {
      expect(formatFileSize(1536)).toBe('1.50 KB')
      expect(formatFileSize(1500000)).toBe('1.43 MB')
    })
  })
})
