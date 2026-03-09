/**
 * API 接口统一管理
 * 所有 API 调用通过此模块导出
 */
import { get, post, put, del, upload, download } from '@/utils/request'
import { API_PATHS } from '@/utils/constants'
import type { SpectrumDataPoint, PeakResult, SpectrumFile } from '@/store/spectrum'
import type { UserInfo } from '@/store/auth'
import type { DeviceInfo, SystemResource } from '@/store/app'

// ========== 类型定义 ==========
export interface LoginParams {
  username: string
  password: string
  captcha?: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
  expires_in?: number
}

export interface UploadResponse {
  file_id: string
  file_name: string
  upload_time?: string
}

export interface PeakAnalysisParams {
  file_id: string
  element_range?: [number, number]
  sensitivity?: number
  min_peak_width?: number
}

export interface PeakAnalysisResponse {
  peaks: PeakResult[]
  spectrum?: SpectrumDataPoint[]
}

export interface ProcessExecuteParams {
  file_id: string
  algorithm: string
  params?: Record<string, unknown>
}

export interface ProcessExecuteResponse {
  spectrum: SpectrumDataPoint[]
  metrics?: Record<string, unknown>
}

// 认证相关类型
export interface RegisterParams {
  username: string
  password: string
  email?: string
  captcha?: string
}

export interface ChangePasswordParams {
  old_password: string
  new_password: string
}

// 文件管理相关类型
export interface FileRenameParams {
  file_id: string
  new_name: string
}

export interface FileMoveParams {
  file_id: string
  new_folder: string
}

// 光谱分析相关类型
export interface BaselineParams {
  file_id: string
  method?: string
  params?: Record<string, unknown>
}

export interface SmoothParams {
  file_id: string
  method?: string
  window_size?: number
}

export interface MatchResponse {
  groups: string[]
  assignments: Array<{
    peak: number
    group: string
    confidence: number
  }>
}

// 定量分析相关类型
export interface QuantitativeFitParams {
  data: Array<{ x: number; y: number }>
  model?: string
}

export interface QuantitativePredictParams {
  spectrum: Array<{ x: number; y: number }>
  model_id: string
}

export interface ReportGenerateParams {
  file_id: string
  template?: string
  include_raw_data?: boolean
}

// 导出相关类型
export interface ExportResponse {
  download_url: string
  file_name?: string
  expires_in?: number
}

// 统计相关类型
export interface StatsData {
  count: number
  trend: number
  details?: Array<{ date: string; value: number }>
}

// 设备相关类型
export interface DeviceConfigParams {
  device_id: string
  config: Record<string, unknown>
}

// 云端数据库相关类型
export interface DatabaseInfo {
  database_id: string
  name: string
  description?: string
  record_count?: number
}

export interface CloudImportParams {
  database_id: string
  data: Record<string, unknown>
}

export interface CloudExportParams {
  database_id: string
  format?: string
}

// 系统相关类型
export interface SystemConfig {
  app_name: string
  version: string
  features?: string[]
}

// 用户相关类型
export interface UserUpdateParams {
  username?: string
  email?: string
  avatar?: string
  phone?: string
}

export interface UploadAvatarResponse {
  avatar_url: string
}

// ========== 认证 API ==========
export const authApi = {
  // 登录
  login: (data: LoginParams) => post<LoginResponse>(API_PATHS.AUTH.LOGIN, data),

  // 登出
  logout: () => post(API_PATHS.AUTH.LOGOUT),

  // 刷新 Token
  refreshToken: () => post<{ token: string }>(API_PATHS.AUTH.REFRESH),

  // 注册
  register: (data: RegisterParams) => post<LoginResponse>(API_PATHS.AUTH.REGISTER, data),

  // 修改密码
  changePassword: (data: ChangePasswordParams) => post<{ message: string }>(API_PATHS.AUTH.CHANGE_PASSWORD, data),
}

// ========== 文件管理 API ==========
export const filesApi = {
  // 获取文件列表
  list: () => get<{ files: SpectrumFile[] }>(API_PATHS.FILES.LIST),

  // 上传文件
  upload: (file: File, element?: string, onProgress?: (percent: number) => void) => {
    return upload<UploadResponse>(API_PATHS.FILES.UPLOAD, file, element ? { element } : undefined, onProgress)
  },

  // 删除文件
  delete: (fileId: string) => del<{ message: string }>(API_PATHS.FILES.DELETE, { file_id: fileId }),

  // 获取文件详情
  detail: (fileId: string) => get<{ file: SpectrumFile }>(API_PATHS.FILES.DETAIL, { file_id: fileId }),

  // 重命名文件
  rename: (fileId: string, newName: string) => put<{ file: SpectrumFile }>(API_PATHS.FILES.RENAME, { file_id: fileId, new_name: newName }),

  // 移动文件
  move: (fileId: string, newFolder: string) => put<{ file: SpectrumFile }>(API_PATHS.FILES.MOVE, { file_id: fileId, new_folder: newFolder }),
}

// ========== 光谱数据 API ==========
export const spectrumApi = {
  // 获取光谱数据
  getData: (fileId: string) => get<{ spectrum: SpectrumDataPoint[] }>(API_PATHS.FILES.DETAIL + '/data', { file_id: fileId }),

  // 基线校正
  baseline: (fileId: string, method?: string, params?: Record<string, unknown>) =>
    post<{ spectrum: SpectrumDataPoint[] }>(API_PATHS.ANALYSIS.BASELINE, {
      file_id: fileId,
      method,
      params,
    }),

  // 平滑处理
  smooth: (fileId: string, method?: string, window_size?: number) =>
    post<{ spectrum: SpectrumDataPoint[] }>(API_PATHS.ANALYSIS.SMOOTH, {
      file_id: fileId,
      method,
      window_size,
    }),
}

// ========== 光谱分析 API ==========
export const analysisApi = {
  // 寻峰分析
  peaks: (params: PeakAnalysisParams) => post<PeakAnalysisResponse>(API_PATHS.ANALYSIS.PEAKS, params),

  // 峰拟合
  fitPeaks: (fileId: string, model?: string) =>
    post<PeakAnalysisResponse>(API_PATHS.ANALYSIS.FIT_PEAKS, { file_id: fileId, model }),

  // AI 预测
  predict: (fileId: string) => post<{ class: string; confidence: number }>(API_PATHS.ANALYSIS.PREDICT, { file_id: fileId }),

  // 官能团匹配
  match: (peaks: number[]) => post<MatchResponse>(API_PATHS.ANALYSIS.MATCH, { peaks }),

  // 获取模型状态
  getModelStatus: () => get<{ model_name: string; version: string; status: string }>(API_PATHS.ANALYSIS.MODEL_STATUS),

  // 重新加载模型
  reloadModel: () => post<{ message: string }>(API_PATHS.ANALYSIS.MODEL_RELOAD),
}

// ========== 数据处理 API ==========
export const processApi = {
  // 执行算法
  execute: (params: ProcessExecuteParams) => post<ProcessExecuteResponse>(API_PATHS.PROCESS.EXECUTE, params),

  // 获取处理队列
  getQueue: () => get<{ queue: ProcessExecuteParams[] }>(API_PATHS.PROCESS.QUEUE),

  // 取消处理
  cancel: (taskId: string) => del<{ message: string }>(API_PATHS.PROCESS.CANCEL + '/' + taskId),

  // 获取处理状态
  getStatus: (taskId: string) => get<{ status: string; progress: number }>(API_PATHS.PROCESS.STATUS + '/' + taskId),
}

// ========== 定量分析 API ==========
export const quantitativeApi = {
  // 曲线拟合
  fit: (data: QuantitativeFitParams) => post<{ model_id: string; r_squared: number }>(API_PATHS.QUANTITATIVE.FIT, data),

  // 浓度预测
  predict: (data: QuantitativePredictParams) => post<{ concentration: number; confidence: number }>(API_PATHS.QUANTITATIVE.PREDICT, data),

  // 生成报告
  report: (data: ReportGenerateParams) => post<ExportResponse>(API_PATHS.QUANTITATIVE.REPORT, data),
}

// ========== 导出 API ==========
export const exportApi = {
  // 导出 Excel
  excel: (fileId: string) => post<ExportResponse>(API_PATHS.EXPORT.EXCEL, { file_id: fileId }),

  // 导出 PDF
  pdf: (fileId: string) => post<ExportResponse>(API_PATHS.EXPORT.PDF, { file_id: fileId }),

  // 导出 Word
  word: (fileId: string) => post<ExportResponse>(API_PATHS.EXPORT.WORD, { file_id: fileId }),

  // 下载文件
  download: (url: string, filename?: string) => download(url, filename),

  // 获取 Excel 模板
  template: () => download(API_PATHS.EXPORT.TEMPLATE, 'template.xlsx'),
}

// ========== 报告 API ==========
export const reportApi = {
  // 生成报告
  generate: (fileId: string, format: 'pdf' | 'excel' | 'word' = 'pdf') =>
    post<ExportResponse>(API_PATHS.REPORT.GENERATE, { file_id: fileId, format }),

  // 获取报告列表
  list: () => get<{ reports: Array<{ id: string; name: string; created_at: string; format: string }> }>(API_PATHS.REPORT.LIST),

  // 获取报告详情
  detail: (reportId: string) => get<{ report: { id: string; name: string; content: string } }>(API_PATHS.REPORT.DETAIL + '/' + reportId),

  // 删除报告
  delete: (reportId: string) => del<{ message: string }>(API_PATHS.REPORT.DELETE + '/' + reportId),
}

// ========== 统计 API ==========
export const statsApi = {
  // 今日统计
  today: () => get<StatsData>(API_PATHS.STATS.TODAY),

  // 累计统计
  total: () => get<StatsData>(API_PATHS.STATS.TOTAL),

  // 周统计
  weekly: () => get<StatsData>(API_PATHS.STATS.WEEKLY),

  // 月统计
  monthly: () => get<StatsData>(API_PATHS.STATS.MONTHLY),
}

// ========== 设备管理 API ==========
export const deviceApi = {
  // 获取设备列表
  list: () => get<{ devices: DeviceInfo[] }>(API_PATHS.DEVICES.LIST),

  // 获取设备状态
  status: () => get<{ devices: DeviceInfo[]; total: number }>(API_PATHS.DEVICES.STATUS),

  // 同步设备
  sync: () => post<{ message: string; synced_count: number }>(API_PATHS.DEVICES.SYNC),

  // 配置设备
  config: (deviceId: string, config: Record<string, unknown>) => put<{ device: DeviceInfo }>(API_PATHS.DEVICES.CONFIG, { device_id: deviceId, config }),
}

// ========== 云端数据库 API ==========
export const cloudApi = {
  // 获取数据库列表
  databases: () => get<{ databases: DatabaseInfo[] }>(API_PATHS.CLOUD.DATABASES),

  // 导入数据
  import: (databaseId: string, data: Record<string, unknown>) => post<{ message: string; imported_count: number }>(API_PATHS.CLOUD.IMPORT, { database_id: databaseId, data }),

  // 导出数据
  export: (databaseId: string) => post<{ download_url: string }>(API_PATHS.CLOUD.EXPORT, { database_id: databaseId }),
}

// ========== 系统 API ==========
export const systemApi = {
  // 获取系统资源
  resources: () => get<SystemResource>(API_PATHS.SYSTEM.RESOURCES),

  // 获取系统日志
  logs: () => get<{ logs: Array<{ level: string; message: string; timestamp: string }> }>(API_PATHS.SYSTEM.LOGS),

  // 获取系统配置
  config: () => get<SystemConfig>(API_PATHS.SYSTEM.CONFIG),
}

// ========== 用户 API ==========
export const userApi = {
  // 获取用户信息
  info: () => get<{ user: UserInfo }>(API_PATHS.USER.INFO),

  // 更新用户信息
  update: (data: UserUpdateParams) => put<{ user: UserInfo }>(API_PATHS.USER.UPDATE, data),

  // 上传头像
  avatar: (file: File) => upload<UploadAvatarResponse>(API_PATHS.USER.AVATAR, file),
}

// ========== 导出所有 API ==========
export const api = {
  auth: authApi,
  files: filesApi,
  spectrum: spectrumApi,
  analysis: analysisApi,
  process: processApi,
  quantitative: quantitativeApi,
  export: exportApi,
  report: reportApi,
  stats: statsApi,
  device: deviceApi,
  cloud: cloudApi,
  system: systemApi,
  user: userApi,
}

// 默认导出
export default api
