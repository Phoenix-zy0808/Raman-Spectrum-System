# 拉曼光谱智能检测系统 - 开发指南

> 版本：2.0.0  
> 最后更新：2026 年 3 月 6 日

## 目录

1. [项目简介](#项目简介)
2. [技术栈](#技术栈)
3. [快速开始](#快速开始)
4. [项目结构](#项目结构)
5. [开发规范](#开发规范)
6. [常见问题](#常见问题)

---

## 项目简介

拉曼光谱智能检测系统是一个基于 Vue 3 + TypeScript + Element Plus 的科研/工业级光谱分析软件。系统提供光谱数据导入、预处理、寻峰分析、官能团匹配、AI 预测、定量分析、报告生成等功能。

### 主要功能

- 📊 **光谱可视化** - 基于 ECharts 的高性能光谱图展示
- 🔍 **智能寻峰** - 自动识别峰位并计算半高宽、峰面积
- 🧪 **预处理** - 基线校正、平滑去噪、归一化等
- 🤖 **AI 分析** - 深度学习模型预测物质成分
- 📈 **定量分析** - 浓度预测、曲线拟合
- 📝 **报告生成** - 一键生成 PDF/Excel/Word 报告

---

## 技术栈

### 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.x | 渐进式 JavaScript 框架 |
| TypeScript | 5.x | JavaScript 超集 |
| Vue Router | 4.x | 官方路由管理器 |
| Pinia | 2.x | Vue 状态管理 |

### UI 组件

| 技术 | 版本 | 说明 |
|------|------|------|
| Element Plus | 2.x | Vue 3 组件库 |
| ECharts | 5.x | 可视化图表库 |
| DataV | 1.x | 数据可视化组件 |

### 工具库

| 技术 | 版本 | 说明 |
|------|------|------|
| Axios | 1.x | HTTP 客户端 |
| Three.js | 0.x | 3D 图形库 |
| SCSS | 1.x | CSS 预处理器 |

### 开发工具

| 技术 | 版本 | 说明 |
|------|------|------|
| Vite | 5.x | 前端构建工具 |
| Vitest | 1.x | 单元测试框架 |
| ESLint | 8.x | 代码检查 |

---

## 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x 或 yarn >= 1.x

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run serve
# 或
yarn serve
```

访问 http://localhost:8080

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 代码检查

```bash
npm run lint
# 或
yarn lint
```

### 运行测试

```bash
npm run test
# 或
yarn test
```

### 生成测试覆盖率报告

```bash
npm run test:coverage
```

---

## 项目结构

```
src/
├── api/                    # API 接口层
│   ├── index.ts           # 统一 API 导出
│   └── spectrum.ts        # 光谱分析 API（兼容旧代码）
├── assets/                # 静态资源
├── common/                # 公共模块
├── components/            # 公共组件
├── constant/              # 常量定义
├── router/                # 路由配置
│   └── index.ts
├── store/                 # 状态管理
│   ├── index.ts          # Pinia 实例
│   ├── auth.ts           # 认证状态
│   ├── spectrum.ts       # 光谱状态
│   └── app.ts            # 应用状态
├── styles/                # 全局样式
│   ├── variables.scss    # Design Token 变量
│   ├── mixins.scss       # SCSS 混合器
│   └── element-theme.scss # Element Plus 主题
├── utils/                 # 工具函数
│   ├── request.ts        # Axios 封装
│   ├── constants.ts      # API 常量
│   └── errorHandler.ts   # 错误处理
├── views/                 # 页面组件
│   ├── login/            # 登录页
│   ├── dashboard/        # 首页
│   ├── analysis/         # 光谱分析
│   └── ...
├── App.vue               # 根组件
└── main.ts               # 入口文件

tests/                     # 测试文件
├── setup.ts              # 测试配置
├── store/                # Store 测试
└── utils/                # 工具测试

docs/                      # 文档
├── API.md                # API 文档
└── GUIDE.md              # 开发指南
```

---

## 开发规范

### 命名规范

#### 文件命名

- **组件文件**: PascalCase，如 `SpectrumChart.vue`
- **工具文件**: camelCase，如 `errorHandler.ts`
- **样式文件**: kebab-case，如 `element-theme.scss`
- **测试文件**: `*.test.ts` 或 `*.spec.ts`

#### 变量命名

```typescript
// 变量：camelCase
const userName = 'test'

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3

// 类/组件：PascalCase
class SpectrumAnalyzer {}

// 接口/类型：PascalCase
interface UserInfo {}

// 枚举：PascalCase
enum ErrorLevel { INFO, WARNING, ERROR }
```

### TypeScript 规范

#### 禁止使用 any

```typescript
// ❌ 错误
function processData(data: any) {}

// ✅ 正确
function processData(data: unknown) {}
function processData<T>(data: T) {}
interface ProcessData { /* ... */ }
function processData(data: ProcessData) {}
```

#### 明确返回类型

```typescript
// ❌ 错误
function getUser() {
  return { id: 1, name: 'test' }
}

// ✅ 正确
interface User {
  id: number
  name: string
}

function getUser(): User {
  return { id: 1, name: 'test' }
}
```

### 组件开发规范

#### 单文件组件结构

```vue
<template>
  <!-- 模板代码 -->
</template>

<script setup lang="ts">
// 导入
import { ref, computed } from 'vue'
import { useSpectrumStore } from '@/store/spectrum'

// Props 定义
interface Props {
  fileId: string
  showLegend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLegend: true
})

// Emits 定义
interface Emits {
  (e: 'update', value: number): void
  (e: 'error', error: Error): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)

// 计算属性
const spectrumData = computed(() => {
  // ...
})

// 方法
function handleUpdate() {
  emit('update', 100)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.component-name {
  // 样式代码
}
</style>
```

#### 使用 Design Token

```vue
<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.container {
  @include tech-card;
  @include flex(column, center, center);
  
  background-color: $bg-card;
  color: $text-primary;
  border-color: $border-color;
  
  &:hover {
    box-shadow: $shadow-glow-strong;
  }
}
</style>
```

### API 调用规范

```typescript
import { spectrumApi, type SpectrumDataResponse } from '@/api'
import { handleError } from '@/utils/errorHandler'

async function loadSpectrumData(fileId: string) {
  try {
    const response = await spectrumApi.getData(fileId)
    const data = response.data as SpectrumDataResponse
    return data.spectrum
  } catch (error) {
    handleError(error, {
      message: '加载光谱数据失败',
      context: { fileId }
    })
    throw error
  }
}
```

### 状态管理规范

```typescript
import { defineStore } from 'pinia'
import type { UserInfo } from '@/store/auth'

export const useAuthStore = defineStore('auth', {
  // 状态
  state: () => ({
    isLoggedIn: false,
    userInfo: null as UserInfo | null,
  }),

  // 计算属性
  getters: {
    userName: (state) => state.userInfo?.username || '未登录用户',
  },

  // 方法
  actions: {
    loginSuccess(token: string, userInfo: UserInfo) {
      this.isLoggedIn = true
      this.userInfo = userInfo
      localStorage.setItem('raman_token', token)
    },
  },
})
```

---

## 常见问题

### 1. 页面刷新后状态丢失

**原因**: Pinia 状态在页面刷新后会重置

**解决**: 使用 `loadFromStorage()` 方法从 localStorage 恢复状态

```typescript
// router/index.ts
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) {
    const loaded = authStore.loadFromStorage()
    // ...
  }
  next()
})
```

### 2. TypeScript 类型错误

**检查**:
- 确保所有接口都有明确定义
- 不要使用 `any`，使用 `unknown` 或具体类型
- API 响应类型与实际数据匹配

### 3. 样式不生效

**检查**:
- 是否导入了 Design Token 变量
- 是否使用了正确的 SCSS 变量
- 全局样式是否放在 `element-theme.scss`

### 4. 跨域问题

开发环境下，代理配置在 `vue.config.js`:

```javascript
proxy: {
  '/api': {
    target: process.env.VUE_APP_API_BASE_URL,
    changeOrigin: true,
  },
}
```

### 5. 构建失败

**尝试**:
```bash
# 清理缓存
rm -rf node_modules dist package-lock.json

# 重新安装
npm install

# 重新构建
npm run build
```

---

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 更新日志

### v2.0.0 (2026-03-06)

**改进**:
- ✅ 修复 Pinia 状态管理问题
- ✅ 移除登录硬编码，对接真实后端
- ✅ 完善 TypeScript 类型系统
- ✅ 添加全局错误处理
- ✅ 建立 Design Token 系统
- ✅ 添加路由权限控制
- ✅ 添加 Vitest 单元测试

**新增**:
- 📁 完整的 API 文档
- 📁 开发指南文档
- 🧪 单元测试配置

---

## 联系方式

- 项目地址：[GitHub](https://github.com/your-org/raman-spectrum-system)
- 问题反馈：[Issues](https://github.com/your-org/raman-spectrum-system/issues)
