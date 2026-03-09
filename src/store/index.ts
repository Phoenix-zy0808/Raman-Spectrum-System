import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有 store 模块，方便统一使用
export { useAuthStore } from './auth'
export { useSpectrumStore } from './spectrum'
export { useAppStore } from './app'

// 导出类型
export type { UserInfo } from './auth'
export type { SpectrumDataPoint, PeakResult, SpectrumFile, ProcessingState } from './spectrum'
export type { DeviceInfo, SystemResource, Notification } from './app'
