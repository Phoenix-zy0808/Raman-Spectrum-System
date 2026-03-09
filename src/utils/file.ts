/**
 * 文件处理工具函数
 */
import type { SpectrumDataPoint } from '@/store/spectrum'

/**
 * 解析光谱文件内容（txt/csv 格式）
 * @param content 文件内容
 * @param delimiter 分隔符（默认逗号或空格）
 */
export function parseSpectrumContent(
  content: string,
  delimiter?: string
): SpectrumDataPoint[] {
  const lines = content.trim().split(/\r?\n/)
  const data: SpectrumDataPoint[] = []
  
  // 自动检测分隔符
  const detectedDelimiter = delimiter || detectDelimiter(lines[0])
  
  for (const line of lines) {
    // 跳过注释行和空行
    if (!line.trim() || line.trim().startsWith('#') || line.trim().startsWith('//')) {
      continue
    }
    
    const parts = line.split(detectedDelimiter).map(p => p.trim())
    
    if (parts.length >= 2) {
      const x = parseFloat(parts[0])
      const y = parseFloat(parts[1])
      
      if (!isNaN(x) && !isNaN(y)) {
        data.push({ x, y })
      }
    }
  }
  
  return data
}

/**
 * 检测分隔符
 * @param line 文本行
 */
function detectDelimiter(line: string): string {
  if (line.includes(',')) return ','
  if (line.includes('\t')) return '\t'
  if (line.includes(';')) return ';'
  return /\s+/ // 默认空格
}

/**
 * 从 File 对象读取光谱文件
 * @param file 文件对象
 */
export function readSpectrumFile(file: File): Promise<SpectrumDataPoint[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = parseSpectrumContent(content)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

/**
 * 下载文件
 * @param content 文件内容
 * @param filename 文件名
 * @param mimeType MIME 类型
 */
export function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // 释放 URL
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * 导出光谱数据为 CSV
 * @param data 光谱数据
 * @param filename 文件名
 */
export function exportSpectrumToCSV(
  data: SpectrumDataPoint[],
  filename: string = 'spectrum.csv'
): void {
  const header = 'Wavenumber (cm⁻¹),Intensity (a.u.)\n'
  const rows = data.map(p => `${p.x},${p.y.toFixed(4)}`).join('\n')
  const content = header + rows
  
  downloadFile(content, filename, 'text/csv')
}

/**
 * 导出光谱数据为 JSON
 * @param data 光谱数据
 * @param filename 文件名
 */
export function exportSpectrumToJSON(
  data: SpectrumDataPoint[],
  filename: string = 'spectrum.json'
): void {
  const content = JSON.stringify(data, null, 2)
  downloadFile(content, filename, 'application/json')
}

/**
 * 导出峰位数据为 CSV
 * @param peaks 峰位数据
 * @param filename 文件名
 */
export function exportPeaksToCSV(
  peaks: Array<{ position: number; intensity: number; assignment?: string }>,
  filename: string = 'peaks.csv'
): void {
  const header = 'Position (cm⁻¹),Intensity (a.u.),Assignment\n'
  const rows = peaks.map(p => `${p.position.toFixed(2)},${p.intensity.toFixed(4)},${p.assignment || ''}`).join('\n')
  const content = header + rows
  
  downloadFile(content, filename, 'text/csv')
}

/**
 * 文件大小格式化
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i]
}

/**
 * 检查文件扩展名
 * @param filename 文件名
 * @param allowedExtensions 允许的扩展名列表
 */
export function checkFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  return allowedExtensions.includes(ext)
}

/**
 * 光谱文件支持的扩展名
 */
export const SPECTRUM_FILE_EXTENSIONS = [
  '.spc',
  '.txt',
  '.csv',
  '.dat',
  '.mat',
]

/**
 * 图像文件支持的扩展名
 */
export const IMAGE_FILE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.svg',
]

/**
 * 文档文件支持的扩展名
 */
export const DOCUMENT_FILE_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
]

/**
 * 获取文件类型描述
 * @param extension 文件扩展名
 */
export function getFileTypeDescription(extension: string): string {
  const descriptions: Record<string, string> = {
    '.spc': '光谱文件',
    '.txt': '文本文件',
    '.csv': 'CSV 文件',
    '.dat': '数据文件',
    '.mat': 'MATLAB 文件',
    '.png': 'PNG 图像',
    '.jpg': 'JPEG 图像',
    '.jpeg': 'JPEG 图像',
    '.pdf': 'PDF 文档',
    '.doc': 'Word 文档',
    '.docx': 'Word 文档',
    '.xls': 'Excel 表格',
    '.xlsx': 'Excel 表格',
  }
  
  return descriptions[extension.toLowerCase()] || '未知文件类型'
}

/**
 * 解析 CSV 内容为数组
 * @param content CSV 内容
 * @param hasHeader 是否有表头
 */
export function parseCSV(
  content: string,
  hasHeader: boolean = true
): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split(/\r?\n/)
  
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }
  
  const delimiter = detectDelimiter(lines[0])
  
  let headers: string[] = []
  let rows: string[][] = []
  
  if (hasHeader) {
    headers = lines[0].split(delimiter).map(h => h.trim())
    rows = lines.slice(1).map(line => line.split(delimiter).map(cell => cell.trim()))
  } else {
    headers = lines[0].split(delimiter).map((_, i) => `Column ${i + 1}`)
    rows = lines.map(line => line.split(delimiter).map(cell => cell.trim()))
  }
  
  return { headers, rows }
}

/**
 * 将数组导出为 CSV
 * @param headers 表头
 * @param rows 数据行
 * @param filename 文件名
 */
export function exportArrayToCSV(
  headers: string[],
  rows: string[][],
  filename: string
): void {
  const headerRow = headers.join(',')
  const dataRows = rows.map(row => row.join(',')).join('\n')
  const content = headerRow + '\n' + dataRows
  
  downloadFile(content, filename, 'text/csv')
}
