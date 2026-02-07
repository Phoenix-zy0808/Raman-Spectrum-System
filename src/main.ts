import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 1. 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import DataVVue3 from '@kjgl77/datav-vue3';
// 引入全局css
import './assets/scss/style.scss';
// 引入图表（所有图标见 icon 目录下的 demo_index.html）
import './assets/icon/iconfont.css'
// 引入 全局注册组件
import PublicComponent from '@/components/componentInstall';

const app = createApp(App)
app.use(PublicComponent)
app.use(ElementPlus) // 注册 Element Plus
app.use(DataVVue3)
app.use(store)
app.use(router)
app.mount('#app')


