/**
 * Mock API 拦截器
 * 拦截 API 请求并返回模拟数据，支持前端独立开发和测试
 */

import type { MockApiResponse, MockLoginResponse, MockStatsData, MockReport } from './types'
import {
  generateSpectrumData,
  generatePeakResults,
  generateFileList,
  generateUserInfo,
  generateDeviceList,
  generateStatsData,
  generateReportList,
  generateProcessTask,
  delay,
  simulateNetworkError,
} from './dataGenerator'

// Mock 数据存储
const mockData = {
  users: new Map<string, { token: string; user: ReturnType<typeof generateUserInfo>; expiry: number }>(),
  files: new Map<string, ReturnType<typeof generateFileList>[number]>(),
  spectrumData: new Map<string, ReturnType<typeof generateSpectrumData>>(),
  tasks: new Map<string, ReturnType<typeof generateProcessTask>>(),
}

// 初始化一些示例数据
function initMockData() {
  const files = generateFileList(15)
  files.forEach(file => {
    mockData.files.set(file.file_id, file)
    // 为每个文件生成光谱数据
    mockData.spectrumData.set(file.file_id, generateSpectrumData())
  })
}

initMockData()

/**
 * Mock 拦截器类
 */
class MockInterceptor {
  private enabled: boolean = true
  private delayMs: number = 300
  private errorRate: number = 0.02

  /**
   * 启用/禁用 Mock
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    console.log(`[Mock] ${enabled ? '已启用' : '已禁用'}`)
  }

  /**
   * 设置模拟延迟
   */
  setDelay(ms: number) {
    this.delayMs = ms
  }

  /**
   * 设置错误率
   */
  setErrorRate(rate: number) {
    this.errorRate = rate
  }

  /**
   * 拦截请求
   */
  async intercept(
    url: string,
    method: string,
    data?: unknown
  ): Promise<MockApiResponse<unknown> | null> {
    if (!this.enabled) {
      return null
    }

    // 模拟网络错误
    if (simulateNetworkError(this.errorRate)) {
      await delay(this.delayMs)
      throw new Error('Network Error: 模拟网络错误')
    }

    // 延迟模拟
    await delay(this.delayMs + Math.random() * 500)

    // 路由匹配
    const route = this.matchRoute(url)
    if (!route) {
      return null
    }

    try {
      const result = await route.handler(method, data)
      return {
        code: 200,
        data: result,
        message: 'success',
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          code: 400,
          data: null,
          message: error.message,
        }
      }
      throw error
    }
  }

  /**
   * 路由匹配
   */
  private matchRoute(url: string): { path: string; handler: RouteHandler } | null {
    for (const [path, handler] of routes) {
      if (this.matchPath(url, path)) {
        return { path, handler }
      }
    }
    return null
  }

  /**
   * 路径匹配（支持简单通配符）
   */
  private matchPath(url: string, pattern: string): boolean {
    const cleanUrl = url.replace(/^https?:\/\/[^/]+/, '')
    const cleanPattern = pattern.replace(/\/\d+/g, '/\\d+')
    const regex = new RegExp(`^${cleanPattern}$`)
    return regex.test(cleanUrl)
  }

  /**
   * 获取存储的数据
   */
  getMockData() {
    return mockData
  }
}

// 路由处理器类型
type RouteHandler = (method: string, data?: unknown) => Promise<unknown>

// 路由定义
const routes: Map<string, RouteHandler> = new Map([
  // ========== 认证 API ==========
  ['/login', async (method, data) => {
    const { username, password } = data as { username: string; password: string }

    if (!username || !password) {
      throw new Error('请输入用户名和密码')
    }

    // 简单验证（任意账号密码都可以登录）
    const user = generateUserInfo(username, username.includes('admin') ? 'admin' : 'user')
    const token = `mock_token_${username}_${Date.now()}`
    const expiry = Date.now() + 2 * 60 * 60 * 1000 // 2 小时

    mockData.users.set(token, { token, user, expiry })

    const response: MockLoginResponse = {
      token,
      user,
      expires_in: 2 * 60 * 60,
    }

    return response
  }],

  ['/logout', async () => {
    return { message: '登出成功' }
  }],

  ['/auth/refresh', async () => {
    return { token: `mock_token_refresh_${Date.now()}` }
  }],

  ['/auth/register', async (method, data) => {
    const { username } = data as { username: string }
    const user = generateUserInfo(username)
    return {
      token: `mock_token_${username}_${Date.now()}`,
      user,
      expires_in: 2 * 60 * 60,
    }
  }],

  ['/auth/change-password', async () => {
    return { message: '密码修改成功' }
  }],

  // ========== 文件管理 API ==========
  ['/api/files', async (method, data) => {
    if (method === 'GET') {
      // 获取文件列表
      const files = Array.from(mockData.files.values())
      return { files }
    } else if (method === 'DELETE') {
      // 删除文件
      const { file_id } = data as { file_id: string }
      mockData.files.delete(file_id)
      mockData.spectrumData.delete(file_id)
      return { message: '删除成功' }
    }
    return { files: [] }
  }],

  ['/api/upload', async () => {
    const newFile = generateFileList(1)[0]
    mockData.files.set(newFile.file_id, newFile)
    mockData.spectrumData.set(newFile.file_id, generateSpectrumData())
    return {
      file_id: newFile.file_id,
      file_name: newFile.file_name,
      upload_time: newFile.upload_time,
    }
  }],

  ['/api/files/detail', async (method, data) => {
    const { file_id } = data as { file_id: string }
    const file = mockData.files.get(file_id)
    if (!file) {
      throw new Error('文件不存在')
    }
    return { file }
  }],

  ['/api/files/detail/data', async (method, data) => {
    const { file_id } = data as { file_id: string }
    const spectrum = mockData.spectrumData.get(file_id)
    if (!spectrum) {
      throw new Error('光谱数据不存在')
    }
    return { spectrum }
  }],

  ['/api/files/rename', async (method, data) => {
    const { file_id, new_name } = data as { file_id: string; new_name: string }
    const file = mockData.files.get(file_id)
    if (file) {
      file.file_name = new_name
    }
    return { file }
  }],

  ['/api/files/move', async () => {
    return { message: '移动成功' }
  }],

  // ========== 光谱分析 API ==========
  ['/api/analysis/baseline', async (method, data) => {
    const { file_id } = data as { file_id: string }
    const originalData = mockData.spectrumData.get(file_id)
    if (!originalData) {
      throw new Error('光谱数据不存在')
    }
    // 模拟基线校正（简单处理）
    const correctedData = originalData.map(point => ({
      x: point.x,
      y: Math.max(0, point.y - 5),
    }))
    mockData.spectrumData.set(file_id, correctedData)
    return { spectrum: correctedData }
  }],

  ['/api/analysis/smooth', async (method, data) => {
    const { file_id } = data as { file_id: string }
    const originalData = mockData.spectrumData.get(file_id)
    if (!originalData) {
      throw new Error('光谱数据不存在')
    }
    // 模拟平滑处理（移动平均）
    const windowSize = 5
    const smoothedData = originalData.map((point, i) => {
      const start = Math.max(0, i - Math.floor(windowSize / 2))
      const end = Math.min(originalData.length, i + Math.floor(windowSize / 2))
      const sum = originalData.slice(start, end).reduce((s, p) => s + p.y, 0)
      return { x: point.x, y: sum / (end - start) }
    })
    return { spectrum: smoothedData }
  }],

  ['/api/analysis/peaks', async (method, data) => {
    const { file_id } = data as { file_id: string }
    const spectrum = mockData.spectrumData.get(file_id)
    if (!spectrum) {
      throw new Error('光谱数据不存在')
    }
    const peaks = generatePeakResults(spectrum)
    return { peaks, spectrum }
  }],

  ['/api/analysis/fit-peaks', async (method, data) => {
    const { file_id } = data as { file_id: string }
    const spectrum = mockData.spectrumData.get(file_id)
    if (!spectrum) {
      throw new Error('光谱数据不存在')
    }
    const peaks = generatePeakResults(spectrum)
    return { peaks, spectrum }
  }],

  ['/api/analysis/predict', async (method, data) => {
    const { file_id } = data as { file_id: string }
    // 模拟 AI 预测
    const classes = ['石墨烯', '碳纳米管', '金刚石', '无定形碳', '其他']
    const predictions = classes.map(cls => ({
      class: cls,
      confidence: Math.random(),
    }))
    predictions.sort((a, b) => b.confidence - a.confidence)
    return predictions[0]
  }],

  ['/api/analysis/match', async (method, data) => {
    const { peaks } = data as { peaks: number[] }
    const assignments = {
      500: 'Si-Si 键振动',
      1000: 'C-C 伸缩振动',
      1332: 'sp³ 碳（金刚石）',
      1580: 'sp² 碳（石墨 G 峰）',
      2700: '2D 峰（石墨烯特征）',
    }

    const groups = new Set<string>()
    const result = peaks.map(peak => {
      let closest: number = 0
      let minDiff = 100
      Object.keys(assignments).forEach(pos => {
        const diff = Math.abs(peak - parseInt(pos))
        if (diff < minDiff) {
          minDiff = diff
          closest = parseInt(pos)
        }
      })
      groups.add(assignments[closest as keyof typeof assignments])
      return {
        peak,
        group: assignments[closest as keyof typeof assignments] || '未知',
        confidence: Math.max(0, 1 - minDiff / 50),
      }
    })

    return {
      groups: Array.from(groups),
      assignments: result,
    }
  }],

  ['/api/analysis/model/status', async () => {
    return {
      model_name: 'RamanNet-v2',
      version: '2.0.0',
      status: 'ready',
    }
  }],

  ['/api/analysis/model/reload', async () => {
    return { message: '模型重新加载成功' }
  }],

  // ========== 数据处理 API ==========
  ['/api/process/execute', async (method, data) => {
    const { file_id, algorithm } = data as { file_id: string; algorithm: string }
    const task = generateProcessTask(file_id, algorithm)
    mockData.tasks.set(task.task_id, task)
    return {
      spectrum: mockData.spectrumData.get(file_id),
      metrics: { snr: 25.5, resolution: 2.5 },
    }
  }],

  ['/api/process/queue', async () => {
    return { queue: Array.from(mockData.tasks.values()) }
  }],

  ['/api/process/cancel/:id', async () => {
    return { message: '任务已取消' }
  }],

  ['/api/process/status/:id', async () => {
    return { status: 'completed', progress: 100 }
  }],

  // ========== 定量分析 API ==========
  ['/api/quantitative/fit', async () => {
    return { model_id: 'model_1', r_squared: 0.985 }
  }],

  ['/api/quantitative/predict', async () => {
    return { concentration: 0.85, confidence: 0.92 }
  }],

  ['/api/quantitative/report', async () => {
    return { download_url: '/mock/report.pdf' }
  }],

  // ========== 导出 API ==========
  ['/api/export/excel', async (method, data) => {
    const { file_id } = data as { file_id: string }
    const file = mockData.files.get(file_id)
    return {
      download_url: `/mock/export/${file?.file_name || 'data'}.xlsx`,
      file_name: `${file?.file_name || 'data'}.xlsx`,
    }
  }],

  ['/api/export/pdf', async (method, data) => {
    const { file_id } = data as { file_id: string }
    const file = mockData.files.get(file_id)
    return {
      download_url: `/mock/export/${file?.file_name || 'data'}.pdf`,
      file_name: `${file?.file_name || 'data'}.pdf`,
    }
  }],

  ['/api/export/word', async () => {
    return { download_url: '/mock/export/report.docx' }
  }],

  ['/api/export/excel/template', async () => {
    return { download_url: '/mock/template.xlsx' }
  }],

  // ========== 报告 API ==========
  ['/api/report/generate', async () => {
    return { download_url: '/mock/report.pdf' }
  }],

  ['/api/reports', async () => {
    const reports = generateReportList(8)
    return { reports }
  }],

  ['/api/reports/:id', async (method) => {
    if (method === 'GET') {
      return { report: { id: '1', name: '测试报告', content: '报告内容' } }
    } else if (method === 'DELETE') {
      return { message: '删除成功' }
    }
    return null
  }],

  // ========== 统计 API ==========
  ['/api/stats/today', async () => generateStatsData(25)],
  ['/api/stats/total', async () => generateStatsData(500)],
  ['/api/stats/weekly', async () => generateStatsData(150)],
  ['/api/stats/monthly', async () => generateStatsData(600)],

  // ========== 设备管理 API ==========
  ['/api/devices', async () => {
    return { devices: generateDeviceList(5) }
  }],

  ['/api/device/status', async () => {
    return { devices: generateDeviceList(5), total: 5 }
  }],

  ['/api/device/sync', async () => {
    return { message: '同步成功', synced_count: 5 }
  }],

  ['/api/device/config', async () => {
    return { device: generateDeviceList(1)[0] }
  }],

  // ========== 云端数据库 API ==========
  ['/api/cloud/databases', async () => {
    return {
      databases: [
        { database_id: '1', name: '标准光谱库', description: '常见物质标准光谱', record_count: 10000 },
        { database_id: '2', name: '有机物库', description: '有机化合物质谱', record_count: 5000 },
        { database_id: '3', name: '无机物库', description: '无机化合物质谱', record_count: 3000 },
      ],
    }
  }],

  ['/api/cloud/import', async () => {
    return { message: '导入成功', imported_count: 100 }
  }],

  ['/api/cloud/export', async () => {
    return { download_url: '/mock/export/database.csv' }
  }],

  // ========== 系统 API ==========
  ['/api/system/resources', async () => {
    return {
      cpu_usage: Math.round(Math.random() * 30) + 10,
      memory_usage: Math.round(Math.random() * 40) + 30,
      disk_usage: Math.round(Math.random() * 20) + 40,
      gpu_usage: Math.round(Math.random() * 50) + 20,
    }
  }],

  ['/api/system/logs', async () => {
    const levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG']
    const messages = [
      '系统启动成功',
      '用户登录',
      '数据处理完成',
      '模型加载成功',
      '设备连接正常',
    ]
    return {
      logs: Array.from({ length: 20 }, () => ({
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      })),
    }
  }],

  ['/api/system/config', async () => {
    return {
      app_name: '拉曼光谱智能检测系统',
      version: '2.0.0',
      features: ['光谱分析', 'AI 预测', '定量分析', '报告生成'],
    }
  }],

  // ========== 用户 API ==========
  ['/api/user/info', async (_, data) => {
    // 从 token 获取用户信息（简化处理）
    return {
      user: generateUserInfo('current_user', 'user'),
    }
  }],

  ['/api/user/update', async (method, data) => {
    return {
      user: generateUserInfo('updated_user', 'user'),
    }
  }],

  ['/api/user/avatar', async () => {
    return { avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' }
  }],
])

// 导出单例
export const mockInterceptor = new MockInterceptor()

// 检查是否启用 Mock
export function isMockEnabled(): boolean {
  return process.env.VUE_APP_MOCK === 'true' || mockInterceptor['enabled']
}

export default mockInterceptor
