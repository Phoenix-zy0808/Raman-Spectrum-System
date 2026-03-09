/**
 * Mock 数据生成器
 * 生成逼真的拉曼光谱数据和其他模拟数据
 */

import type { SpectrumDataPoint, PeakResult, SpectrumFile } from '@/store/spectrum'
import type { UserInfo, DeviceInfo } from '@/store'
import type { MockStatsData, MockReport, MockProcessTask } from './types'

/**
 * 生成拉曼光谱数据
 * 模拟真实的拉曼光谱曲线，包含特征峰
 */
export function generateSpectrumData(
  options: {
    xMin?: number
    xMax?: number
    points?: number
    noise?: number
    peaks?: Array<{ position: number; intensity: number; width: number }>
  } = {}
): SpectrumDataPoint[] {
  const {
    xMin = 400,
    xMax = 4000,
    points = 1800,
    noise = 0.02,
    peaks = [
      { position: 500, intensity: 0.3, width: 30 },
      { position: 1000, intensity: 0.5, width: 40 },
      { position: 1332, intensity: 1.0, width: 25 }, // 金刚石峰
      { position: 1580, intensity: 0.8, width: 35 }, // G 峰
      { position: 2700, intensity: 0.6, width: 50 }, // 2D 峰
      { position: 3000, intensity: 0.4, width: 60 },
    ]
  } = options

  const data: SpectrumDataPoint[] = []
  const step = (xMax - xMin) / points

  for (let i = 0; i <= points; i++) {
    const x = xMin + i * step
    let y = 0

    // 基线
    y += 0.1 * Math.exp(-x / 2000)

    // 添加特征峰（洛伦兹峰）
    peaks.forEach(peak => {
      const dx = x - peak.position
      const lorentzian = peak.intensity * (peak.width / 2) ** 2 / ((dx) ** 2 + (peak.width / 2) ** 2)
      y += lorentzian
    })

    // 添加噪声
    y += (Math.random() - 0.5) * noise

    // 归一化到 0-100
    y = Math.max(0, y * 100)

    data.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 })
  }

  return data
}

/**
 * 生成寻峰结果
 */
export function generatePeakResults(spectrum: SpectrumDataPoint[]): PeakResult[] {
  const peaks: PeakResult[] = []
  const assignments: Record<number, string> = {
    500: 'Si-Si 键振动',
    1000: 'C-C 伸缩振动',
    1332: 'sp³ 碳（金刚石）',
    1580: 'sp² 碳（石墨 G 峰）',
    2700: '2D 峰（石墨烯特征）',
    3000: 'C-H 伸缩振动',
  }

  // 查找局部最大值
  for (let i = 10; i < spectrum.length - 10; i++) {
    const point = spectrum[i]
    const isPeak = spectrum.slice(i - 10, i + 11).every(p => p.y <= point.y)

    if (isPeak && point.y > 10) {
      // 查找最近的特征峰位置
      let assignment: string | undefined
      let minDiff = 50
      Object.keys(assignments).forEach(pos => {
        const diff = Math.abs(point.x - parseInt(pos))
        if (diff < minDiff) {
          minDiff = diff
          assignment = assignments[parseInt(pos)]
        }
      })

      // 计算半高宽
      const halfMax = point.y / 2
      let leftX = point.x
      let rightX = point.x
      for (let j = i; j >= 0; j--) {
        if (spectrum[j].y <= halfMax) {
          leftX = spectrum[j].x
          break
        }
      }
      for (let j = i; j < spectrum.length; j++) {
        if (spectrum[j].y <= halfMax) {
          rightX = spectrum[j].x
          break
        }
      }

      peaks.push({
        position: Math.round(point.x * 100) / 100,
        intensity: Math.round(point.y * 100) / 100,
        halfWidth: Math.round((rightX - leftX) * 100) / 100,
        area: Math.round(point.y * (rightX - leftX) * 0.5 * 100) / 100,
        assignment,
      })
    }
  }

  // 按强度排序，取前 20 个峰
  return peaks.sort((a, b) => b.intensity - a.intensity).slice(0, 20)
}

/**
 * 生成文件列表
 */
export function generateFileList(count: number = 10): SpectrumFile[] {
  const elements = ['C', 'Si', 'GaAs', 'SiO2', 'Al2O3', 'TiO2', 'ZnO', 'Cu']
  const statuses = ['completed', 'processing', 'pending']
  const prefixes = ['样品', '测试', '实验', '分析', '检测']

  return Array.from({ length: count }, (_, i) => ({
    file_id: `file_${Date.now()}_${i}`,
    file_name: `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${new Date().toISOString().split('T')[0]}_${String(i + 1).padStart(3, '0')}.spc`,
    upload_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    element: elements[Math.floor(Math.random() * elements.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }))
}

/**
 * 生成用户信息
 */
export function generateUserInfo(username: string, role: string = 'user'): UserInfo {
  return {
    user_id: `user_${Date.now()}`,
    username,
    email: `${username}@example.com`,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
  }
}

/**
 * 生成设备列表
 */
export function generateDeviceList(count: number = 5): DeviceInfo[] {
  const statuses: Array<'online' | 'offline' | 'busy'> = ['online', 'online', 'online', 'busy', 'offline']
  const locations = ['实验室 A', '实验室 B', '测试间 1', '测试间 2', '校准室']

  return Array.from({ length: count }, (_, i) => ({
    device_id: `device_${i + 1}`,
    device_name: `拉曼光谱仪-${String.fromCharCode(65 + i)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: locations[i % locations.length],
    ip: `192.168.1.${100 + i}`,
    last_seen: new Date().toISOString(),
  }))
}

/**
 * 生成统计数据
 */
export function generateStatsData(baseCount: number = 100): MockStatsData {
  const details = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      value: Math.floor(baseCount / 7 + Math.random() * 20),
    }
  })

  const total = details.reduce((sum, d) => sum + d.value, 0)

  return {
    count: total,
    trend: Math.round((Math.random() - 0.3) * 100) / 100,
    details,
  }
}

/**
 * 生成报告列表
 */
export function generateReportList(count: number = 5): MockReport[] {
  const formats = ['pdf', 'excel', 'word']
  const prefixes = ['分析报告', '检测报告', '实验报告', '测试报告']

  return Array.from({ length: count }, (_, i) => ({
    id: `report_${Date.now()}_${i}`,
    name: `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${new Date().toISOString().split('T')[0]}_${i + 1}`,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    format: formats[Math.floor(Math.random() * formats.length)],
  }))
}

/**
 * 生成处理任务
 */
export function generateProcessTask(fileId: string, algorithm: string): MockProcessTask {
  return {
    task_id: `task_${Date.now()}`,
    file_id: fileId,
    algorithm,
    status: 'processing',
    progress: 0,
    created_at: new Date().toISOString(),
  }
}

/**
 * 模拟异步延迟
 */
export function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟网络错误
 */
export function simulateNetworkError(rate: number = 0.05): boolean {
  return Math.random() < rate
}
