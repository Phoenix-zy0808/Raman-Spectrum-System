import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'

// 1. 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import DataVVue3 from '@kjgl77/datav-vue3'
// 引入全局 css
import './assets/scss/style.scss'
// 引入图表（所有图标见 icon 目录下的 demo_index.html）
import './assets/icon/iconfont.css'
// 引入 全局注册组件
import PublicComponent from '@/components/componentInstall'
// 引入 Mock 服务（开发环境）
import { mockInterceptor } from '@/mock'

const app = createApp(App)

// 初始化 Mock 服务（根据环境变量）
if (process.env.VUE_APP_MOCK === 'true') {
  console.log('%c[Mock] Mock 服务已启用 - 前端独立运行模式', 'color: #00ff88; font-weight: bold')
  const delay = parseInt(process.env.VUE_APP_MOCK_DELAY || '300')
  const errorRate = parseFloat(process.env.VUE_APP_MOCK_ERROR_RATE || '0.02')
  mockInterceptor.setDelay(delay)
  mockInterceptor.setErrorRate(errorRate)
} else {
  console.log('%c[Mock] Mock 服务已关闭 - 使用真实 API', 'color: #00b0f0; font-weight: bold')
  mockInterceptor.setEnabled(false)
}

app.use(PublicComponent)
app.use(ElementPlus) // 注册 Element Plus
app.use(DataVVue3)
app.use(pinia)
app.use(router)
app.mount('#app')
