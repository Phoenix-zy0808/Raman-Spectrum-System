/**
 * 光谱分析相关 API（兼容旧代码）
 * 建议逐步迁移到 src/api/index.ts
 */
import { api } from '@/api/index'
import type { SpectrumDataPoint, PeakResult, SpectrumFile } from '@/store/spectrum'

// ========== 文件上传与管理 ==========

/**
 * 上传光谱文件
 * @param file 文件对象
 * @param element 元素类型（可选）
 * @param onProgress 上传进度回调
 */
export function uploadSpectrumFile(
  file: File,
  element?: string,
  onProgress?: (percent: number) => void
) {
  return api.files.upload(file, element, onProgress)
}

/**
 * 获取文件列表
 */
export function getFileList() {
  return api.files.list()
}

/**
 * 删除文件
 * @param fileId 文件 ID
 */
export function deleteFile(fileId: string) {
  return api.files.delete(fileId)
}

/**
 * 获取文件详情
 * @param fileId 文件 ID
 */
export function getFileDetail(fileId: string) {
  return api.files.detail(fileId)
}

// ========== 光谱分析 ==========

/**
 * 获取光谱数据
 * @param fileId 文件 ID
 */
export function getSpectrumData(fileId: string) {
  return api.spectrum.getData(fileId)
}

/**
 * 寻峰分析
 * @param fileId 文件 ID
 * @param options 寻峰参数
 */
export function analyzePeaks(
  fileId: string,
  options?: {
    element_range?: [number, number]
    sensitivity?: number
    min_peak_width?: number
  }
) {
  return api.analysis.peaks({
    file_id: fileId,
    ...options,
  })
}

/**
 * 基线校正
 * @param fileId 文件 ID
 * @param method 方法名
 * @param params 参数
 */
export function baselineCorrection(fileId: string, method?: string, params?: Record<string, any>) {
  return api.spectrum.baseline(fileId, method, params)
}

/**
 * 平滑处理
 * @param fileId 文件 ID
 * @param method 平滑方法
 * @param window_size 窗口大小
 */
export function smoothSpectrum(fileId: string, method?: string, window_size?: number) {
  return api.spectrum.smooth(fileId, method, window_size)
}

// ========== 官能团匹配 ==========

/**
 * 根据峰位匹配官能团
 * @param peaks 峰位列表
 */
export function matchFunctionalGroups(peaks: number[]) {
  return api.analysis.match(peaks)
}

// ========== AI 处理 ==========

/**
 * 执行 AI 模型处理
 * @param fileId 文件 ID
 * @param modelId 模型 ID
 * @param params 模型参数
 */
export function executeAIModel(fileId: string, modelId: string, params?: Record<string, any>) {
  return api.process.execute({
    file_id: fileId,
    algorithm: modelId,
    params,
  })
}

// ========== 报告生成 ==========

/**
 * 生成分析报告
 * @param fileId 文件 ID
 * @param format 格式 (pdf / excel / word)
 */
export function generateReport(fileId: string, format: 'pdf' | 'excel' | 'word' = 'pdf') {
  return api.report.generate(fileId, format)
}

/**
 * 导出 Excel
 * @param fileId 文件 ID
 */
export function exportExcel(fileId: string) {
  return api.export.excel(fileId)
}

/**
 * 导出 PDF
 * @param fileId 文件 ID
 */
export function exportPDF(fileId: string) {
  return api.export.pdf(fileId)
}

/**
 * 导出 Word
 * @param fileId 文件 ID
 */
export function exportWord(fileId: string) {
  return api.export.word(fileId)
}
