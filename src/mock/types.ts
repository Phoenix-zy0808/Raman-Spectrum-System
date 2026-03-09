/**
 * Mock 数据类型定义
 */

import type { UserInfo } from '@/store/auth'
import type { SpectrumDataPoint, PeakResult, SpectrumFile } from '@/store/spectrum'
import type { DeviceInfo } from '@/store/app'

// 登录响应
export interface MockLoginResponse {
  token: string
  user: UserInfo
  expires_in: number
}

// 通用 API 响应
export interface MockApiResponse<T = unknown> {
  code: number | string
  data: T
  message?: string
}

// 统计数据
export interface MockStatsData {
  count: number
  trend: number
  details?: Array<{ date: string; value: number }>
}

// 报告数据
export interface MockReport {
  id: string
  name: string
  created_at: string
  format: string
  content?: string
}

// 处理任务
export interface MockProcessTask {
  task_id: string
  file_id: string
  algorithm: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  created_at: string
}
