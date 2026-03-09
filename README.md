# 拉曼光谱智能检测系统

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.1-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.6-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**新一代高精度光学检测平台 | 多模态拉曼光谱云端智能分析软件**

> 🎉 **v2.0.1 新增 Mock 服务支持 - 无需后端即可完整运行！**

</div>

---

## 📖 目录

- [项目简介](#-项目简介)
- [核心功能](#-核心功能)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [功能模块详解](#-功能模块详解)
- [开发指南](#-开发指南)
- [常见问题](#-常见问题)
- [更新日志](#-更新日志)
- [贡献指南](#-贡献指南)
- [联系方式](#-联系方式)

---

## 📌 项目简介

**拉曼光谱智能检测系统** 是一款面向科研机构和工业检测场景的专业级光谱分析软件。系统集成了光谱数据采集、预处理、特征分析、机器学习建模、定量分析等完整工作流程，采用现代化的 Web 架构设计，支持本地部署与云端协同工作模式。

### 核心优势

| 特性 | 说明 |
|------|------|
| 🎯 **专业级分析** | 支持多种光谱预处理算法、峰位识别、官能团匹配等专业功能 |
| 🤖 **AI 赋能** | 内置机器学习/深度学习模块，支持分类、聚类、回归分析 |
| 📊 **可视化驱动** | 基于 ECharts 的动态图表，实时渲染光谱数据与分析结果 |
| 🔗 **仪器直连** | 支持 Horiba、Renishaw 等主流拉曼光谱仪数据接口 |
| 📈 **定量分析** | 标准曲线建立、浓度预测、模型验证一体化工作流 |
| 📋 **报告生成** | 模板化报告输出，支持 PDF/Word 多格式导出 |

### 适用场景

- 🔬 **科研实验**：高校、研究所拉曼光谱实验数据分析
- 🏭 **工业检测**：药品成分分析、材料表征、食品安全检测
- 🏥 **医疗诊断**：生物组织光谱分析、疾病标志物检测
- 🌱 **环境监测**：污染物识别、水质分析

---

## 🚀 核心功能

### 1. 综合监控大屏
实时展示系统运行状态、数据处理队列、仪器连接状态等核心指标，支持全局导航与快速跳转。

### 2. 数据管理中心
```
├── 本地文件上传 (.spc/.txt/.csv/.mat)
├── 云端数据库同步
├── 仪器直连采集
├── 实验数据筛选与检索
└── 预处理任务队列管理
```

### 3. 光谱解析中心
- **拉曼光谱可视化**：交互式光谱图，支持缩放、平移、峰位标注
- **官能团匹配**：基于峰位的化学基团智能识别
- **元素选择器**：周期表式元素选择，辅助光谱解析
- **文件树管理**：样本分组与快速切换

### 4. 定量实验分析
- **标准曲线建立**：线性/多项式拟合，自动计算 R²
- **浓度预测**：基于标准曲线的未知样本浓度计算
- **模型验证**：交叉验证、外部验证、Bootstrap 验证

### 5. AI 模型实验室
```
预处理算法 ──┬── 基线校正 (多项式/ALS/Whittaker)
            ├── 去噪处理 (小波/SG 滤波/中值滤波)
            ├── 归一化 (L2/MinMax/Z-score)
            └── 峰识别 (二阶导数/CWT/高斯拟合)

机器学习 ────┬── 分类 (SVM/RF/XGBoost/DNN)
            ├── 聚类 (K-means/DBSCAN/GMM)
            ├── 回归 (PLS/SVR/GPR)
            └── 降维可视化 (PCA/t-SNE/UMAP)

深度学习 ────┬── 预训练模型 (ResNet/ViT/EfficientNet)
            ├── 迁移学习配置
            └── 自定义模型上传
```

### 6. 量子增强视图
- 量子比特资源分配可视化
- 量子后端连接状态监控
- 量子线路编辑与模拟
- 量子化学计算协议库

### 7. 报告生成器
- **模板选择**：学术论文/检测报告/实验记录多模板
- **交互式标注**：光谱图手动标注与注释
- **一键导出**：PDF/Word/HTML 多格式输出

### 8. 系统监控
- GPU/CPU 实时使用率仪表盘
- 内存/显存占用监控
- 处理队列状态追踪
- 系统日志与告警

---

## 🛠 技术栈

### 前端核心

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.0 | 渐进式框架 |
| TypeScript | 4.6 | 类型安全 |
| Vue Router | 4.0 | 路由管理 |
| Vuex | 4.0 | 状态管理 |
| Element Plus | 2.13 | UI 组件库 |

### 可视化

| 技术 | 版本 | 用途 |
|------|------|------|
| ECharts | 4.9 | 图表渲染 |
| DataV Vue3 | 1.7 | 大屏装饰组件 |
| Three.js | 0.182 | 3D 可视化 |

### 构建工具

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue CLI | 5.0 | 项目构建 |
| Babel | - | JS 转译 |
| Sass | 1.97 | CSS 预处理器 |
| ESLint | 8.10 | 代码规范 |

### 网络请求

| 技术 | 版本 | 用途 |
|------|------|------|
| Axios | 1.13 | HTTP 客户端 |

---

## 📦 快速开始

### 环境要求

- **Node.js**: >= 14.16.0
- **npm**: >= 6.14.6
- **浏览器**: Chrome 90+ / Edge 90+ / Firefox 88+

### 安装步骤

#### 1. 克隆项目

```bash
git clone <项目地址>
cd Raman-Spectrum-System
```

#### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

#### 3. 启动开发服务器

```bash
# 启动本地开发服务器 (默认端口 8080)
npm run serve

# 或使用 yarn
yarn serve
```

访问 `http://localhost:8080` 查看效果。

> 💡 **Mock 模式说明**: 默认启用 Mock 服务，**任意账号密码均可登录**，无需后端即可体验完整功能！

#### 4. 登录系统

**默认登录凭据** (Mock 模式):
| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | 任意 | 管理员 | 可访问所有页面 |
| user | 任意 | 普通用户 | 访问常规页面 |
| test | 任意 | 普通用户 | 访问常规页面 |

#### 5. 构建生产版本

```bash
# 生产环境构建
npm run build

# 或使用 yarn
yarn build
```

构建产物位于 `dist/` 目录。

#### 6. 代码检查

```bash
# ESLint 检查
npm run lint

# 或
yarn lint
```

#### 7. 运行测试

```bash
# 运行单元测试
npm run test

# 生成覆盖率报告
npm run test:coverage
```

### 环境变量配置

项目支持多环境配置，通过 `.env` 文件管理：

```bash
# .env.development - 开发环境
VUE_APP_API_BASE_URL=http://localhost:3000

# .env.production - 生产环境
VUE_APP_API_BASE_URL=https://api.raman-system.com
```

---

## 📁 项目结构

```
Raman-Spectrum-System/
├── public/                     # 静态资源
│   ├── favicon.ico            # 网站图标
│   ├── image.png              # 背景图片
│   └── index.html             # HTML 模板
│
├── src/                       # 源代码目录
│   ├── assets/                # 静态资源
│   │   ├── icon/              # 图标字体
│   │   ├── scss/              # 全局样式
│   │   │   ├── index.scss     # 主屏样式
│   │   │   └── style.scss     # 全局样式
│   │   ├── logo.png           # Logo 图片
│   │   └── pageBg.png         # 背景图片
│   │
│   ├── common/                # 公共配置
│   │   └── echart/            # ECharts 配置
│   │       ├── map/           # 地图数据
│   │       │   └── fujian.js  # 福建地图
│   │       └── style/         # 图表主题
│   │           └── theme.js   # 自定义主题
│   │
│   ├── components/            # 公共组件
│   │   ├── echartCanvas/      # ECharts 封装组件
│   │   │   └── index.tsx      # 图表渲染组件
│   │   ├── componentInstall.ts # 组件注册
│   │   └── NavBar.vue         # 顶部导航栏
│   │
│   ├── constant/              # 常量定义
│   │   ├── index.ts           # 常量值
│   │   └── index.d.ts         # 类型定义
│   │
│   ├── router/                # 路由配置
│   │   └── index.ts           # 路由表
│   │
│   ├── store/                 # Vuex 状态管理
│   │   └── index.ts           # Store 配置
│   │
│   ├── utils/                 # 工具函数
│   │   ├── index.ts           # 通用工具
│   │   └── useDraw.ts         # 屏幕适配
│   │
│   ├── views/                 # 页面组件
│   │   ├── index/             # 综合监控大屏
│   │   │   └── index.vue
│   │   ├── login/             # 登录页
│   │   │   └── index.vue
│   │   ├── analysis/          # 光谱解析中心
│   │   │   └── index.vue
│   │   ├── DataManagement/    # 数据管理中心
│   │   │   └── index.vue
│   │   ├── quantitative/      # 定量实验分析
│   │   │   └── index.vue
│   │   ├── model-lab/         # AI 模型实验室
│   │   │   └── index.vue
│   │   ├── quantum/           # 量子增强视图
│   │   │   └── index.vue
│   │   ├── report/            # 报告生成器
│   │   │   └── index.vue
│   │   ├── system/            # 系统监控
│   │   │   └── index.vue
│   │   └── center*/           # 大屏子模块
│   │       ├── center/
│   │       ├── centerLeft1/
│   │       ├── centerLeft2/
│   │       ├── centerRight1/
│   │       ├── centerRight2/
│   │       ├── bottomLeft/
│   │       └── bottomRight/
│   │
│   ├── App.vue                # 根组件
│   ├── main.ts                # 入口文件
│   ├── shims-vue.d.ts         # Vue 类型声明
│   └── shims-plugins-d.ts     # 插件类型声明
│
├── other_modules/             # 特殊依赖包
│   ├── @jiaminghi.rar         # DataV 修复包
│   └── README.md
│
├── .browserslistrc            # 浏览器兼容配置
├── .eslintrc.js               # ESLint 配置
├── .gitignore                 # Git 忽略配置
├── babel.config.js            # Babel 配置
├── package.json               # 项目依赖配置
├── tsconfig.json              # TypeScript 配置
├── vue.config.js              # Vue CLI 配置
└── README.md                  # 项目说明文档
```

---

## 📚 功能模块详解

### 1. 登录页面 (`/login`)

**功能特性**：
- 科技感登录界面，Canvas 动态光谱背景
- 用户名/密码验证
- 后端 API 对接
- 登录状态持久化

**技术实现**：
```typescript
// 登录请求
const handleLogin = async () => {
  const response = await service.post('/login', {
    username: username.value,
    password: password.value
  })
  // 跳转至首页
  await router.push('/dashboard')
}
```

---

### 2. 综合监控大屏 (`/dashboard`)

**功能特性**：
- 1920×1080 基准分辨率，自适应缩放
- DataV 装饰组件营造科技感
- 实时时间显示
- 全局导航入口

**屏幕适配方案**：
```typescript
// useDraw.ts - CSS scale 缩放方案
const calcRate = () => {
  const currentRate = window.innerWidth / window.innerHeight
  if (currentRate > baseProportion) {
    // 更宽屏幕
    scale.width = ((window.innerHeight * baseProportion) / baseWidth).toFixed(5)
  } else {
    // 更高屏幕
    scale.height = ((window.innerWidth / baseProportion) / baseHeight).toFixed(5)
  }
  appRef.value.style.transform = `scale(${scale.width}, ${scale.height})`
}
```

---

### 3. 光谱解析中心 (`/analysis`)

**功能特性**：
- 交互式拉曼光谱图 (400-4000 cm⁻¹)
- 峰位自动标注与手动标记
- 官能团匹配表格
- 元素周期表式选择器

**ECharts 配置示例**：
```javascript
// 光谱图配置
{
  xAxis: {
    type: 'value',
    name: '拉曼位移 (cm⁻¹)',
    min: 400,
    max: 4000,
    inverse: true,  // 拉曼位移从大到小
  },
  series: [{
    type: 'line',
    data: generateRamanData(),
    markLine: {
      data: peakLabels.map(p => ({ xAxis: p.x, label: { formatter: p.label } }))
    }
  }]
}
```

---

### 4. 数据管理中心 (`/data-management`)

**三栏布局**：
```
┌─────────────┬──────────────────┬─────────────┐
│ 数据上传导入 │  实验数据总览     │ 预处理队列   │
│             │                  │             │
│ • 本地上传   │ • 高级筛选       │ • 进行中     │
│ • 云端库     │ • 数据表格       │ • 等待中     │
│ • 仪器直连   │ • 元数据编辑     │ • 历史记录   │
└─────────────┴──────────────────┴─────────────┘
```

**支持文件格式**：
- `.spc` - 光谱标准格式
- `.txt` - 文本数据
- `.csv` - 表格数据
- `.mat` - MATLAB 数据

---

### 5. 定量实验分析 (`/quantitative`)

**工作流程**：
```
1. 选择特征峰位
   ↓
2. 输入浓度梯度数据
   ↓
3. 选择拟合方法 (线性/多项式)
   ↓
4. 生成标准曲线
   ↓
5. 模型验证 (交叉验证/外部验证)
   ↓
6. 未知样本浓度预测
```

**拟合方法**：
- 线性拟合：`y = ax + b`
- 多项式拟合 (2 次)：`y = ax² + bx + c`
- 多项式拟合 (3 次)：`y = ax³ + bx² + cx + d`

---

### 6. AI 模型实验室 (`/model-lab`)

**算法配置中心**：

| 类别 | 算法 | 参数示例 |
|------|------|----------|
| 基线校正 | 多项式拟合 | 阶数：1-10 |
| 去噪处理 | 小波变换 | 小波类型：db4/sym8/coif3 |
| 分类识别 | SVM | 核函数：RBF/Linear/Poly |
| 聚类分析 | K-means | 聚类数 K：2-10 |
| 降维可视化 | t-SNE | 困惑度：5-50 |

**训练监控**：
- 实时 Loss 曲线
- 准确率变化趋势
- 模型性能雷达图

---

### 7. 报告生成器 (`/report`)

**报告模板**：
- 📄 学术论文模板
- 📊 检测报告模板
- 📝 实验记录模板

**输出格式**：
- PDF - 打印友好
- Word - 可编辑
- HTML - 网页浏览

---

## 💻 开发指南

### 添加新页面

1. 在 `src/views/` 下创建新目录
2. 创建 `index.vue` 文件
3. 在 `src/router/index.ts` 添加路由

```typescript
// router/index.ts
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/views/new-page/index.vue')
}
```

### 添加新组件

1. 在 `src/components/` 下创建组件文件
2. 在 `src/components/componentInstall.ts` 注册

```typescript
// componentInstall.ts
import NewComponent from './NewComponent.vue'
app.component('NewComponent', NewComponent)
```

### 使用 ECharts 组件

```vue
<template>
  <echart
    ref="chartRef"
    height="400px"
    width="600px"
    :options="chartOptions"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Echart from '@/components/echartCanvas/index.tsx'

const chartRef = ref()
const chartOptions = ref({
  // ECharts 配置
})
</script>
```

### 屏幕适配规范

项目采用 CSS `scale` 缩放方案，基准尺寸 `1920×1080`：

```scss
// 新页面样式参考
.page-container {
  width: 100vw;
  height: 100vh;
  background: #001529;
  display: flex;
  overflow: hidden;
}
```

---

## ❓ 常见问题

### Q1: 安装依赖时报错

**问题**：`npm install` 失败

**解决方案**：
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 或使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

---

### Q2: DataV 组件报错

**问题**：`<template v-for> key should be placed on the <template> tag`

**解决方案**：
已提供修复包，替换 `node_modules/@jiaminghi` 目录：
```bash
# 解压 other_modules/@jiaminghi.rar
# 覆盖 node_modules/@jiaminghi
```

---

### Q3: 图表不显示

**问题**：ECharts 图表区域空白

**排查步骤**：
1. 检查容器是否有明确宽高
2. 检查 `options` 是否正确传入
3. 调用 `chartRef.value.resize()` 触发重绘

---

### Q4: 屏幕适配异常

**问题**：页面显示比例不正确

**解决方案**：
```typescript
// 手动触发适配计算
import useDraw from '@/utils/useDraw'
const { calcRate } = useDraw()
calcRate()
```

---

### Q5: 后端接口连接失败

**问题**：API 请求报错 `Network Error`

**解决方案**：
1. 检查后端服务是否启动
2. 确认 `.env` 文件中 `VUE_APP_API_BASE_URL` 配置正确
3. 检查跨域配置 (开发环境需在 `vue.config.js` 配置代理)

```javascript
// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}
```

---

## 📝 更新日志

### v2.0.0 (2026-03-05)

**新增功能**：
- ✨ 定量实验分析模块
- ✨ 报告生成器模块
- ✨ 量子增强视图模块
- ✨ 系统监控模块

**功能优化**：
- 🎨 登录页面视觉升级
- 🔧 光谱解析中心交互优化
- 📊 数据管理中心三栏布局重构

**技术升级**：
- ⬆️ Element Plus 升级至 2.13.1
- ⬆️ Three.js 升级至 0.182.0
- 🔒 Axios 升级至 1.13.6

---

### v1.0.0 (2020-12-08)

**初始版本**：
- 基础大屏展示框架
- DataV 装饰组件集成
- ECharts 图表封装
- 屏幕适配方案

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循 ESLint 配置规范
- TypeScript 类型定义完整
- 组件注释清晰
- 提交信息语义化

---

## 📧 联系方式

| 渠道 | 信息 |
|------|------|
| QQ 群 | 1032272034 |
| 项目地址 | [Gitee](https://gitee.com/MTrun/vue-big-screen-plugin) |
| 原作者 | MTrun |

---

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star 支持！**

Made with ❤️ by Raman Team

</div>
