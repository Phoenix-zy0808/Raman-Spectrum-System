import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import router from '@/router'
import { ElMessage, ElNotification } from 'element-plus'
import { mockInterceptor, isMockEnabled } from '@/mock'

// ========== 类型定义 ==========
/**
 * 统一的 API 响应类型
 * @template T 响应数据的类型，必须明确指定，禁止使用 any
 */
export interface ApiResponse<T = unknown> {
  code: number | string
  data: T
  message?: string
  msg?: string
}

export interface RequestConfig extends AxiosRequestConfig {
  // 是否显示错误提示
  showError?: boolean
  // 是否显示成功提示
  showSuccess?: boolean
  // 重试次数
  retryCount?: number
  // 重试间隔（毫秒）
  retryDelay?: number
  // 请求超时（毫秒）
  timeout?: number
  // 是否需要 Token
  needToken?: boolean
  // 是否跳过 Mock（即使 Mock 启用）
  skipMock?: boolean
}

// ========== 请求取消管理 ==========
class RequestCancelManager {
  private cancelTokens: Map<string, CancelTokenSource> = new Map()

  // 生成请求 key
  private generateKey(config: AxiosRequestConfig): string {
    return `${config.method || 'get'}:${config.url}:${JSON.stringify(config.params || {})}`
  }

  // 取消之前的相同请求
  cancelPrevious(config: AxiosRequestConfig): void {
    const key = this.generateKey(config)
    const source = this.cancelTokens.get(key)
    if (source) {
      source.cancel('重复请求，已取消前一个请求')
      this.cancelTokens.delete(key)
    }
  }

  // 创建新的取消令牌
  createToken(config: AxiosRequestConfig): CancelTokenSource {
    const key = this.generateKey(config)
    const source = axios.CancelToken.source()
    this.cancelTokens.set(key, source)
    return source
  }

  // 移除取消令牌
  removeToken(config: AxiosRequestConfig): void {
    const key = this.generateKey(config)
    this.cancelTokens.delete(key)
  }

  // 取消所有请求
  cancelAll(): void {
    this.cancelTokens.forEach((source) => {
      source.cancel('页面切换，取消所有请求')
    })
    this.cancelTokens.clear()
  }
}

const cancelManager = new RequestCancelManager()

// ========== 创建 axios 实例 ==========
const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000, // 30 秒超时
  headers: {
    'Content-Type': 'application/json',
  },
})

// ========== 请求拦截器 ==========
service.interceptors.request.use(
  async (config) => {
    // 检查是否启用 Mock 且没有跳过 Mock
    const skipMock = (config as RequestConfig).skipMock
    const mockEnabled = isMockEnabled()
    console.log('[Request] URL:', config.url, '| Mock 启用状态:', mockEnabled, '| 跳过 Mock:', skipMock)
    
    if (!skipMock && mockEnabled && config.url) {
      try {
        // 尝试用 Mock 拦截
        const mockResponse = await mockInterceptor.intercept(
          config.url,
          config.method?.toUpperCase() || 'GET',
          config.data
        )
        if (mockResponse !== null) {
          console.log('[Mock] 请求已被拦截:', config.url)
          // Mock 已处理，返回模拟响应
          return {
            ...config,
            data: mockResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          } as AxiosResponse
        } else {
          console.log('[Mock] 未匹配到路由，继续真实请求:', config.url)
        }
      } catch (error) {
        // Mock 错误，继续真实请求或抛出
        console.error('[Mock] 拦截错误:', error)
        throw error
      }
    }

    // 取消之前的相同请求
    cancelManager.cancelPrevious(config)

    // 创建取消令牌
    const source = cancelManager.createToken(config)
    config.cancelToken = source.token

    // 注入 Token
    const authStore = useAuthStore()
    const token = authStore.currentToken || localStorage.getItem('raman_token')

    if (token && config.needToken !== false) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// ========== 响应拦截器 ==========
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 移除取消令牌
    cancelManager.removeToken(response.config)

    // 如果响应不是 JSON 格式（如文件下载），直接返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response
    }

    const res = response.data as ApiResponse

    // 如果后端返回的数据结构包含 code 字段，根据 code 判断
    if (res.code !== undefined) {
      // code 为 0 或 200 表示成功
      if (res.code === 0 || res.code === 200 || res.code === '200') {
        // 显示成功提示
        if ((response.config as RequestConfig).showSuccess && res.message) {
          ElMessage.success(res.message)
        }
        // 返回实际数据（而不是整个响应对象）
        return res.data
      }

      // 业务错误处理
      const errorMessage = res.message || res.msg || '请求失败'
      const showError = (response.config as RequestConfig).showError !== false

      if (showError) {
        ElMessage.error(errorMessage)
      }

      // 401 Token 过期或未授权
      if (res.code === 401 || res.code === '401') {
        const authStore = useAuthStore()
        authStore.logout()
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
      }

      // 403 权限不足
      if (res.code === 403 || res.code === '403') {
        ElNotification({
          title: '权限不足',
          message: errorMessage,
          type: 'warning',
          duration: 3000,
        })
      }

      return Promise.reject(new Error(errorMessage))
    }

    // 直接返回数据
    return res
  },
  (error: AxiosError) => {
    // 移除取消令牌
    if (error.config) {
      cancelManager.removeToken(error.config)
    }

    // 请求被取消
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error.message)
      return Promise.reject(error)
    }

    console.error('响应错误:', error)

    if (error.response) {
      const status = error.response.status
      const showError = (error.config as RequestConfig).showError !== false

      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          break
        case 403:
          if (showError) ElMessage.error('拒绝访问')
          break
        case 404:
          if (showError) ElMessage.error('请求的资源不存在')
          break
        case 500:
          if (showError) ElMessage.error('服务器内部错误')
          // 记录错误日志
          console.error('500 Error:', error.response.data)
          break
        case 502:
          if (showError) ElMessage.error('网关错误')
          break
        case 503:
          if (showError) ElMessage.error('服务不可用')
          break
        case 504:
          if (showError) ElMessage.error('网关超时')
          break
        default:
          if (showError) ElMessage.error(error.message || '请求失败')
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      // 请求配置出错
      ElMessage.error(error.message || '请求配置错误')
    }

    return Promise.reject(error)
  }
)

// ========== 重试机制 ==========
async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  retryCount: number,
  retryDelay: number
): Promise<T> {
  try {
    return await requestFn()
  } catch (error) {
    if (retryCount <= 0) {
      return Promise.reject(error)
    }

    console.log(`请求失败，${retryDelay}ms 后重试... 剩余重试次数：${retryCount}`)
    await new Promise((resolve) => setTimeout(resolve, retryDelay))

    return requestWithRetry(requestFn, retryCount - 1, retryDelay * 2) // 指数退避
  }
}

// ========== 导出请求方法 ==========

/**
 * GET 请求
 */
export async function get<T = any>(
  url: string,
  params?: any,
  config?: RequestConfig
): Promise<T> {
  const retryCount = config?.retryCount ?? 0
  const retryDelay = config?.retryDelay ?? 1000

  return requestWithRetry(
    () => service.get(url, { params, ...config }),
    retryCount,
    retryDelay
  )
}

/**
 * POST 请求
 */
export async function post<T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> {
  const retryCount = config?.retryCount ?? 0
  const retryDelay = config?.retryDelay ?? 1000

  return requestWithRetry(
    () => service.post(url, data, config),
    retryCount,
    retryDelay
  )
}

/**
 * PUT 请求
 */
export async function put<T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> {
  const retryCount = config?.retryCount ?? 0
  const retryDelay = config?.retryDelay ?? 1000

  return requestWithRetry(
    () => service.put(url, data, config),
    retryCount,
    retryDelay
  )
}

/**
 * PATCH 请求
 */
export async function patch<T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> {
  const retryCount = config?.retryCount ?? 0
  const retryDelay = config?.retryDelay ?? 1000

  return requestWithRetry(
    () => service.patch(url, data, config),
    retryCount,
    retryDelay
  )
}

/**
 * DELETE 请求
 */
export async function del<T = any>(
  url: string,
  params?: any,
  config?: RequestConfig
): Promise<T> {
  const retryCount = config?.retryCount ?? 0
  const retryDelay = config?.retryDelay ?? 1000

  return requestWithRetry(
    () => service.delete(url, { params, ...config }),
    retryCount,
    retryDelay
  )
}

/**
 * 文件上传（带进度）
 */
export function upload<T = any>(
  url: string,
  file: File,
  data?: any,
  onProgress?: (percent: number) => void
): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)

  if (data) {
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })
  }

  return service.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    },
  })
}

/**
 * 文件下载
 */
export async function download(
  url: string,
  filename?: string,
  params?: any
): Promise<void> {
  const response = await service.get(url, {
    params,
    responseType: 'blob',
  })

  const blob = response.data as Blob
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/**
 * 下载 Blob 数据
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/**
 * 取消所有请求
 */
export function cancelAllRequests(): void {
  cancelManager.cancelAll()
}

export default service
