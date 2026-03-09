/**
 * 全局错误处理工具
 * 提供统一的错误日志记录、上报和降级处理
 */

import { ElMessage, ElNotification } from 'element-plus'

/**
 * 错误级别枚举
 */
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * 错误信息接口
 */
export interface AppError {
  code: string | number
  message: string
  level?: ErrorLevel
  context?: Record<string, unknown>
  timestamp?: number
}

/**
 * 错误上报配置
 */
export interface ErrorReportConfig {
  enableReport?: boolean
  reportUrl?: string
  maxRetries?: number
}

/**
 * 错误处理类
 * 提供统一的错误处理、日志记录和上报功能
 */
class ErrorHandler {
  private errorQueue: AppError[] = []
  private config: ErrorReportConfig
  private maxQueueSize = 50

  constructor(config: ErrorReportConfig = {}) {
    this.config = {
      enableReport: false, // 默认关闭上报，生产环境可开启
      reportUrl: '/api/error/report',
      maxRetries: 3,
      ...config,
    }
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param options 处理选项
   */
  handleError(
    error: unknown,
    options: {
      message?: string
      showError?: boolean
      showNotification?: boolean
      level?: ErrorLevel
      context?: Record<string, unknown>
    } = {}
  ): void {
    const appError = this.parseError(error, options)

    // 记录错误日志
    this.logError(appError)

    // 加入错误队列
    this.addToQueue(appError)

    // 显示错误提示
    if (options.showError !== false) {
      this.showError(appError)
    }

    // 显示通知（仅严重错误）
    if (options.showNotification || appError.level === ErrorLevel.CRITICAL) {
      this.showNotification(appError)
    }

    // 上报错误（如果启用）
    if (this.config.enableReport) {
      this.reportError(appError)
    }
  }

  /**
   * 解析错误对象
   */
  private parseError(
    error: unknown,
    options: {
      message?: string
      level?: ErrorLevel
      context?: Record<string, unknown>
    }
  ): AppError {
    const appError: AppError = {
      code: 'UNKNOWN',
      message: options.message || '未知错误',
      level: options.level || ErrorLevel.ERROR,
      context: options.context,
      timestamp: Date.now(),
    }

    // Axios 错误
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } }
        message?: string
        code?: string
      }
      appError.code = axiosError.code || axiosError.response?.status || 'HTTP_ERROR'
      appError.message =
        options.message ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        '网络请求失败'
    }

    // Error 对象
    if (error instanceof Error) {
      appError.message = options.message || error.message
      appError.context = {
        ...options.context,
        stack: error.stack,
      }
    }

    // 字符串错误
    if (typeof error === 'string') {
      appError.message = error
    }

    return appError
  }

  /**
   * 记录错误日志
   */
  private logError(error: AppError): void {
    const logMessage = `[${this.formatTime(error.timestamp)}] [${error.level}] ${error.code}: ${error.message}`

    switch (error.level) {
      case ErrorLevel.CRITICAL:
      case ErrorLevel.ERROR:
        console.error(logMessage, error.context)
        break
      case ErrorLevel.WARNING:
        console.warn(logMessage, error.context)
        break
      default:
        console.log(logMessage, error.context)
    }
  }

  /**
   * 添加到错误队列
   */
  private addToQueue(error: AppError): void {
    this.errorQueue.push(error)

    // 限制队列大小
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }
  }

  /**
   * 显示错误消息
   */
  private showError(error: AppError): void {
    ElMessage({
      message: error.message,
      type: error.level === ErrorLevel.CRITICAL ? 'error' : 'error',
      duration: 3000,
      showClose: true,
    })
  }

  /**
   * 显示错误通知
   */
  private showNotification(error: AppError): void {
    ElNotification({
      title: this.getNotificationTitle(error.level),
      message: error.message,
      type: error.level,
      duration: 5000,
      position: 'bottom-right',
    })
  }

  /**
   * 获取通知标题
   */
  private getNotificationTitle(level: ErrorLevel | undefined): string {
    switch (level) {
      case ErrorLevel.CRITICAL:
        return '严重错误'
      case ErrorLevel.ERROR:
        return '错误'
      case ErrorLevel.WARNING:
        return '警告'
      default:
        return '提示'
    }
  }

  /**
   * 上报错误到服务器
   */
  private async reportError(error: AppError): Promise<void> {
    if (!this.config.reportUrl) return

    try {
      // 使用 sendBeacon 发送，避免页面关闭时请求被取消
      const data = JSON.stringify(error)
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.config.reportUrl, data)
      } else {
        // 降级使用 fetch
        await fetch(this.config.reportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true,
        })
      }
    } catch (e) {
      console.error('错误上报失败:', e)
    }
  }

  /**
   * 格式化时间
   */
  private formatTime(timestamp: number | undefined): string {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  /**
   * 获取错误队列
   */
  getErrorQueue(): AppError[] {
    return [...this.errorQueue]
  }

  /**
   * 清空错误队列
   */
  clearQueue(): void {
    this.errorQueue = []
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ErrorReportConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// 导出单例
export const errorHandler = new ErrorHandler()

/**
 * 快捷错误处理方法
 */
export const handleError = errorHandler.handleError.bind(errorHandler)

/**
 * 捕获异步错误装饰器
 */
export function catchAsyncError(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: unknown[]) {
    try {
      return await originalMethod.apply(this, args)
    } catch (error) {
      handleError(error, {
        message: `方法 ${propertyKey} 执行失败`,
        context: { method: propertyKey, args },
      })
      throw error
    }
  }

  return descriptor
}

export default errorHandler
