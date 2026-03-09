/**
 * 光谱数据处理工具函数
 */
import type { SpectrumDataPoint } from '@/store/spectrum'

/**
 * 生成模拟光谱数据（用于测试）
 * @param peaks 峰位配置
 * @param xMin X 轴最小值
 * @param xMax X 轴最大值
 * @param step X 轴步长
 */
export function generateSpectrumData(
  peaks: Array<{ pos: number; h: number; w: number }>,
  xMin: number = 400,
  xMax: number = 4000,
  step: number = 5
): SpectrumDataPoint[] {
  const data: SpectrumDataPoint[] = []
  
  for (let x = xMin; x <= xMax; x += step) {
    let y = 85 + (Math.random() - 0.5) * 2.5
    
    for (const p of peaks) {
      y -= p.h * Math.exp(-Math.pow((x - p.pos) / p.w, 2))
    }
    
    data.push({ x, y: Math.max(-30, Math.min(120, y)) })
  }
  
  return data
}

/**
 * 基线校正（多项式拟合）
 * @param data 原始光谱数据
 * @param order 多项式阶数
 */
export function baselineCorrection(
  data: SpectrumDataPoint[],
  order: number = 3
): SpectrumDataPoint[] {
  // 简化的基线校正实现
  // 实际应使用迭代算法（如 ALS、AsLS）
  const xValues = data.map(p => p.x)
  const yValues = data.map(p => p.y)
  
  // 找到最低点作为基线参考
  const minY = Math.min(...yValues)
  const baseline = minY
  
  // 减去基线
  return data.map(p => ({
    x: p.x,
    y: p.y - baseline,
  }))
}

/**
 * Savitzky-Golay 滤波平滑
 * @param data 光谱数据
 * @param windowSize 窗口大小（奇数）
 * @param order 多项式阶数
 */
export function sgFilter(
  data: SpectrumDataPoint[],
  windowSize: number = 5,
  order: number = 2
): SpectrumDataPoint[] {
  if (windowSize % 2 === 0) {
    windowSize++ // 确保窗口大小为奇数
  }
  
  const halfWindow = Math.floor(windowSize / 2)
  const result: SpectrumDataPoint[] = []
  
  for (let i = 0; i < data.length; i++) {
    let sum = 0
    let count = 0
    
    // 窗口内加权平均
    for (let j = -halfWindow; j <= halfWindow; j++) {
      const idx = i + j
      if (idx >= 0 && idx < data.length) {
        // 简化的权重计算（实际应使用 SG 系数）
        const weight = 1 - Math.abs(j) / halfWindow
        sum += data[idx].y * weight
        count += weight
      }
    }
    
    result.push({
      x: data[i].x,
      y: sum / count,
    })
  }
  
  return result
}

/**
 * 寻峰算法（局部极大值法）
 * @param data 光谱数据
 * @param minHeight 最小峰高
 * @param minDistance 最小峰距
 */
export function findPeaks(
  data: SpectrumDataPoint[],
  minHeight: number = 0,
  minDistance: number = 10
): Array<{ position: number; intensity: number }> {
  const peaks: Array<{ position: number; intensity: number }> = []
  
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1]
    const curr = data[i]
    const next = data[i + 1]
    
    // 局部极大值
    if (curr.y > prev.y && curr.y > next.y && curr.y > minHeight) {
      // 检查与上一个峰的距离
      const lastPeak = peaks[peaks.length - 1]
      if (!lastPeak || Math.abs(curr.x - lastPeak.position) >= minDistance) {
        peaks.push({
          position: curr.x,
          intensity: curr.y,
        })
      }
    }
  }
  
  return peaks
}

/**
 * 数据归一化
 * @param data 光谱数据
 * @param method 归一化方法
 */
export function normalize(
  data: SpectrumDataPoint[],
  method: 'minmax' | 'zscore' | 'area' = 'minmax'
): SpectrumDataPoint[] {
  const yValues = data.map(p => p.y)
  
  switch (method) {
    case 'minmax': {
      const minY = Math.min(...yValues)
      const maxY = Math.max(...yValues)
      const range = maxY - minY || 1
      return data.map(p => ({
        x: p.x,
        y: (p.y - minY) / range,
      }))
    }
    
    case 'zscore': {
      const mean = yValues.reduce((a, b) => a + b, 0) / yValues.length
      const std = Math.sqrt(
        yValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / yValues.length
      ) || 1
      return data.map(p => ({
        x: p.x,
        y: (p.y - mean) / std,
      }))
    }
    
    case 'area': {
      const area = yValues.reduce((a, b) => a + Math.abs(b), 0) || 1
      return data.map(p => ({
        x: p.x,
        y: p.y / area,
      }))
    }
    
    default:
      return data
  }
}

/**
 * 计算光谱的一阶导数
 * @param data 光谱数据
 */
export function firstDerivative(data: SpectrumDataPoint[]): SpectrumDataPoint[] {
  const result: SpectrumDataPoint[] = []
  
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1]
    const next = data[i + 1]
    const dx = next.x - prev.x
    
    result.push({
      x: data[i].x,
      y: (next.y - prev.y) / dx,
    })
  }
  
  // 补充首尾点
  if (data.length > 0) {
    result.unshift({ ...data[0], y: 0 })
    result.push({ ...data[data.length - 1], y: 0 })
  }
  
  return result
}

/**
 * 计算光谱的二阶导数
 * @param data 光谱数据
 */
export function secondDerivative(data: SpectrumDataPoint[]): SpectrumDataPoint[] {
  const first = firstDerivative(data)
  return firstDerivative(first)
}

/**
 * 光谱数据插值
 * @param data 原始数据
 * @param newX 新的 X 轴
 */
export function interpolate(
  data: SpectrumDataPoint[],
  newX: number[]
): SpectrumDataPoint[] {
  const result: SpectrumDataPoint[] = []
  
  for (const x of newX) {
    // 找到相邻的两个点
    let idx = data.findIndex(p => p.x >= x)
    
    if (idx === -1) {
      // 超出范围，使用最后一个点
      result.push({ ...data[data.length - 1] })
    } else if (idx === 0) {
      // 第一个点之前
      result.push({ ...data[0] })
    } else {
      // 线性插值
      const prev = data[idx - 1]
      const curr = data[idx]
      const ratio = (x - prev.x) / (curr.x - prev.x)
      const y = prev.y + ratio * (curr.y - prev.y)
      
      result.push({ x, y })
    }
  }
  
  return result
}

/**
 * 计算两个光谱的相关系数
 * @param data1 光谱 1
 * @param data2 光谱 2
 */
export function correlationCoefficient(
  data1: SpectrumDataPoint[],
  data2: SpectrumDataPoint[]
): number {
  // 确保长度相同
  const len = Math.min(data1.length, data2.length)
  if (len === 0) return 0
  
  const y1 = data1.slice(0, len).map(p => p.y)
  const y2 = data2.slice(0, len).map(p => p.y)
  
  const mean1 = y1.reduce((a, b) => a + b, 0) / len
  const mean2 = y2.reduce((a, b) => a + b, 0) / len
  
  let numerator = 0
  let sum1 = 0
  let sum2 = 0
  
  for (let i = 0; i < len; i++) {
    const d1 = y1[i] - mean1
    const d2 = y2[i] - mean2
    numerator += d1 * d2
    sum1 += d1 * d1
    sum2 += d2 * d2
  }
  
  const denominator = Math.sqrt(sum1 * sum2)
  return denominator === 0 ? 0 : numerator / denominator
}
