import { defineStore } from 'pinia'

export interface SpectrumDataPoint {
  x: number // 波数 (cm⁻¹)
  y: number // 强度
}

export interface PeakResult {
  position: number // 峰位
  intensity: number // 强度
  halfWidth?: number // 半高宽
  area?: number // 峰面积
  assignment?: string // 官能团归属
}

export interface SpectrumFile {
  file_id: string
  file_name: string
  upload_time?: string
  element?: string
  status?: string
}

// 预处理状态
export interface ProcessingState {
  baseline?: {
    method: string
    completed: boolean
    params?: Record<string, any>
  }
  denoise?: {
    method: string
    completed: boolean
    params?: Record<string, any>
  }
  normalize?: {
    method: string
    completed: boolean
    params?: Record<string, any>
  }
  smooth?: {
    method: string
    completed: boolean
    params?: Record<string, any>
  }
}

// 多光谱对比
export interface ComparisonSpectrum {
  id: string
  name: string
  data: SpectrumDataPoint[]
  color: string
  visible: boolean
}

/**
 * 光谱核心状态管理
 * 管理 JWT Token、当前文件 ID、原始/处理后的光谱数据、寻峰结果等
 */
export const useSpectrumStore = defineStore('spectrum', {
  state: () => ({
    // 认证相关
    currentToken: '',

    // 当前操作的文件
    currentFileId: '',
    currentFileName: '',

    // 光谱数据
    rawSpectrumData: [] as SpectrumDataPoint[],
    processedSpectrumData: [] as SpectrumDataPoint[],

    // 分析结果
    peakResults: [] as PeakResult[],
    functionalGroups: [] as string[],

    // 文件列表
    fileList: [] as SpectrumFile[],

    // 预处理状态
    processingStatus: null as ProcessingState | null,

    // 多光谱对比
    comparisonSpectra: [] as ComparisonSpectrum[],

    // UI 状态
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    // 是否有有效 token
    isAuthenticated: (state) => !!state.currentToken,

    // 是否有当前文件
    hasCurrentFile: (state) => !!state.currentFileId,

    // 获取光谱数据范围
    dataRange: (state) => {
      if (state.rawSpectrumData.length === 0) {
        return { minX: 400, maxX: 4000, minY: 0, maxY: 100 }
      }
      const data = state.rawSpectrumData
      return {
        minX: Math.min(...data.map(p => p.x)),
        maxX: Math.max(...data.map(p => p.x)),
        minY: Math.min(...data.map(p => p.y)),
        maxY: Math.max(...data.map(p => p.y)),
      }
    },

    // 是否已进行基线校正
    isBaselineCorrected: (state) => state.processingStatus?.baseline?.completed ?? false,

    // 是否已去噪
    isDenoised: (state) => state.processingStatus?.denoise?.completed ?? false,

    // 是否已归一化
    isNormalized: (state) => state.processingStatus?.normalize?.completed ?? false,
  },

  actions: {
    // ========== 认证相关 ==========
    setToken(token: string) {
      this.currentToken = token
      localStorage.setItem('raman_token', token)
    },

    clearToken() {
      this.currentToken = ''
      localStorage.removeItem('raman_token')
    },

    loadTokenFromStorage() {
      const token = localStorage.getItem('raman_token')
      if (token) {
        this.currentToken = token
      }
    },

    // ========== 文件相关 ==========
    setCurrentFile(fileId: string, fileName?: string) {
      this.currentFileId = fileId
      if (fileName) {
        this.currentFileName = fileName
      }
    },

    clearCurrentFile() {
      this.currentFileId = ''
      this.currentFileName = ''
      this.rawSpectrumData = []
      this.processedSpectrumData = []
      this.peakResults = []
      this.functionalGroups = []
      this.processingStatus = null
    },

    setFileList(files: SpectrumFile[]) {
      this.fileList = files
    },

    addFile(file: SpectrumFile) {
      this.fileList.unshift(file)
    },

    // ========== 光谱数据相关 ==========
    setRawData(data: SpectrumDataPoint[]) {
      this.rawSpectrumData = data
    },

    setProcessedData(data: SpectrumDataPoint[]) {
      this.processedSpectrumData = data
    },

    clearSpectrumData() {
      this.rawSpectrumData = []
      this.processedSpectrumData = []
    },

    // ========== 预处理状态相关 ==========
    setProcessingStatus(status: ProcessingState) {
      this.processingStatus = status
    },

    updateProcessingStatus(key: keyof ProcessingState, value: Partial<ProcessingState[typeof key]>) {
      if (!this.processingStatus) {
        this.processingStatus = {} as ProcessingState
      }
      this.processingStatus[key] = {
        ...this.processingStatus[key],
        ...value,
      } as any
    },

    resetProcessingStatus() {
      this.processingStatus = null
    },

    // ========== 多光谱对比相关 ==========
    addComparisonSpectrum(spectrum: ComparisonSpectrum) {
      const existing = this.comparisonSpectra.find(s => s.id === spectrum.id)
      if (existing) {
        existing.data = spectrum.data
        existing.visible = true
      } else {
        this.comparisonSpectra.push(spectrum)
      }
    },

    removeComparisonSpectrum(id: string) {
      this.comparisonSpectra = this.comparisonSpectra.filter(s => s.id !== id)
    },

    toggleComparisonSpectrum(id: string) {
      const spectrum = this.comparisonSpectra.find(s => s.id === id)
      if (spectrum) {
        spectrum.visible = !spectrum.visible
      }
    },

    clearComparisonSpectra() {
      this.comparisonSpectra = []
    },

    // ========== 分析结果相关 ==========
    setPeakResults(peaks: PeakResult[]) {
      this.peakResults = peaks
    },

    setFunctionalGroups(groups: string[]) {
      this.functionalGroups = groups
    },

    // ========== UI 状态相关 ==========
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.error = null
    },
  },
})
