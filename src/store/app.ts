import { defineStore } from 'pinia'

export interface DeviceInfo {
  device_id: string
  device_name: string
  status: 'online' | 'offline' | 'busy'
  location?: string
  ip?: string
  last_seen?: string
}

export interface SystemResource {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  gpu_usage?: number
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  time: number
  read: boolean
}

/**
 * 全局应用状态管理
 * 管理设备状态、系统资源、通知等全局信息
 */
export const useAppStore = defineStore('app', {
  state: () => ({
    // 应用标题
    title: '拉曼光谱智能检测系统',

    // 应用版本
    version: '2.0.0',

    // 侧边栏折叠状态
    sidebarCollapsed: false,

    // 设备列表
    devices: [] as DeviceInfo[],

    // 系统资源
    systemResource: null as SystemResource | null,

    // 通知列表
    notifications: [] as Notification[],

    // 全屏状态
    isFullscreen: false,

    // 主题
    theme: 'dark',

    // 语言
    language: 'zh-CN',
  }),

  getters: {
    // 在线设备数量
    onlineDevicesCount: (state) => {
      return state.devices.filter(d => d.status === 'online').length
    },

    // 未读通知数量
    unreadNotificationsCount: (state) => {
      return state.notifications.filter(n => !n.read).length
    },

    // 设备状态统计
    deviceStats: (state) => {
      return {
        total: state.devices.length,
        online: state.devices.filter(d => d.status === 'online').length,
        offline: state.devices.filter(d => d.status === 'offline').length,
        busy: state.devices.filter(d => d.status === 'busy').length,
      }
    },
  },

  actions: {
    /**
     * 切换侧边栏
     */
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    /**
     * 设置侧边栏状态
     */
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },

    /**
     * 更新设备列表
     */
    setDevices(devices: DeviceInfo[]) {
      this.devices = devices
    },

    /**
     * 添加设备
     */
    addDevice(device: DeviceInfo) {
      const index = this.devices.findIndex(d => d.device_id === device.device_id)
      if (index >= 0) {
        this.devices[index] = device
      } else {
        this.devices.push(device)
      }
    },

    /**
     * 移除设备
     */
    removeDevice(deviceId: string) {
      this.devices = this.devices.filter(d => d.device_id !== deviceId)
    },

    /**
     * 更新系统资源
     */
    setSystemResource(resource: SystemResource) {
      this.systemResource = resource
    },

    /**
     * 添加通知
     */
    addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>) {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        time: Date.now(),
        read: false,
      }
      this.notifications.unshift(newNotification)

      // 限制通知数量
      if (this.notifications.length > 50) {
        this.notifications.pop()
      }
    },

    /**
     * 标记通知为已读
     */
    markNotificationAsRead(notificationId: string) {
      const notification = this.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    },

    /**
     * 标记所有通知为已读
     */
    markAllNotificationsAsRead() {
      this.notifications.forEach(n => {
        n.read = true
      })
    },

    /**
     * 清除通知
     */
    clearNotifications() {
      this.notifications = []
    },

    /**
     * 清除已读通知
     */
    clearReadNotifications() {
      this.notifications = this.notifications.filter(n => !n.read)
    },

    /**
     * 切换全屏
     */
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
    },

    /**
     * 设置主题
     */
    setTheme(theme: 'dark' | 'light') {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
    },

    /**
     * 设置语言
     */
    setLanguage(lang: string) {
      this.language = lang
      localStorage.setItem('raman_language', lang)
    },

    /**
     * 从本地存储加载设置
     */
    loadSettings() {
      const language = localStorage.getItem('raman_language')
      if (language) {
        this.language = language
      }
    },
  },
})
