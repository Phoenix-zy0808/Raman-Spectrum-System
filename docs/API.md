# 拉曼光谱智能检测系统 - API 文档

> 版本：2.0.0  
> 最后更新：2026 年 3 月 6 日

## 目录

- [认证 API](#认证-api)
- [文件管理 API](#文件管理-api)
- [光谱分析 API](#光谱分析-api)
- [数据处理 API](#数据处理-api)
- [定量分析 API](#定量分析-api)
- [报告生成 API](#报告生成-api)
- [系统 API](#系统-api)

---

## 认证 API

### 1. 用户登录

**接口**: `POST /login`

**请求参数**:
```typescript
interface LoginParams {
  username: string    // 用户名
  password: string    // 密码
  captcha?: string    // 验证码（可选）
}
```

**响应数据**:
```typescript
interface LoginResponse {
  token: string       // JWT Token
  user: UserInfo      // 用户信息
  expires_in?: number // Token 过期时间（秒）
}
```

**示例**:
```typescript
import { authApi } from '@/api'

const response = await authApi.login({
  username: 'testuser',
  password: 'password123'
})
```

---

### 2. 用户登出

**接口**: `POST /logout`

**响应数据**:
```typescript
interface LogoutResponse {
  message: string
}
```

**示例**:
```typescript
await authApi.logout()
```

---

### 3. 刷新 Token

**接口**: `POST /auth/refresh`

**响应数据**:
```typescript
interface RefreshResponse {
  token: string
}
```

**示例**:
```typescript
const response = await authApi.refreshToken()
```

---

### 4. 用户注册

**接口**: `POST /auth/register`

**请求参数**:
```typescript
interface RegisterParams {
  username: string
  password: string
  email?: string
  captcha?: string
}
```

**示例**:
```typescript
await authApi.register({
  username: 'newuser',
  password: 'password123',
  email: 'user@example.com'
})
```

---

### 5. 修改密码

**接口**: `POST /auth/change-password`

**请求参数**:
```typescript
interface ChangePasswordParams {
  old_password: string
  new_password: string
}
```

**示例**:
```typescript
await authApi.changePassword({
  old_password: 'oldpass',
  new_password: 'newpass123'
})
```

---

## 文件管理 API

### 1. 获取文件列表

**接口**: `GET /api/files`

**响应数据**:
```typescript
interface FileListResponse {
  files: SpectrumFile[]
}

interface SpectrumFile {
  file_id: string
  file_name: string
  upload_time?: string
  element?: string
  status?: string
}
```

**示例**:
```typescript
import { filesApi } from '@/api'

const response = await filesApi.list()
console.log(response.data.files)
```

---

### 2. 上传文件

**接口**: `POST /api/upload`

**请求参数**:
- `file`: File - 文件对象
- `element?: string` - 元素类型
- `onProgress?: (percent: number) => void` - 上传进度回调

**响应数据**:
```typescript
interface UploadResponse {
  file_id: string
  file_name: string
  upload_time?: string
}
```

**示例**:
```typescript
const file = fileInput.files[0]
await filesApi.upload(file, 'C', (percent) => {
  console.log(`上传进度：${percent}%`)
})
```

---

### 3. 删除文件

**接口**: `DELETE /api/files`

**请求参数**:
```typescript
{
  file_id: string
}
```

**示例**:
```typescript
await filesApi.delete('file-id-123')
```

---

### 4. 获取文件详情

**接口**: `GET /api/files/detail`

**请求参数**:
```typescript
{
  file_id: string
}
```

**响应数据**:
```typescript
interface FileDetailResponse {
  file: SpectrumFile
}
```

**示例**:
```typescript
const response = await filesApi.detail('file-id-123')
```

---

### 5. 重命名文件

**接口**: `PUT /api/files/rename`

**请求参数**:
```typescript
interface FileRenameParams {
  file_id: string
  new_name: string
}
```

**示例**:
```typescript
await filesApi.rename('file-id-123', 'new-name.spc')
```

---

## 光谱分析 API

### 1. 获取光谱数据

**接口**: `GET /api/files/detail/data`

**请求参数**:
```typescript
{
  file_id: string
}
```

**响应数据**:
```typescript
interface SpectrumDataResponse {
  spectrum: SpectrumDataPoint[]
}

interface SpectrumDataPoint {
  x: number  // 波数 (cm⁻¹)
  y: number  // 强度
}
```

**示例**:
```typescript
import { spectrumApi } from '@/api'

const response = await spectrumApi.getData('file-id-123')
const spectrum = response.data.spectrum
```

---

### 2. 基线校正

**接口**: `POST /api/analysis/baseline`

**请求参数**:
```typescript
interface BaselineParams {
  file_id: string
  method?: string      // 'polynomial' | 'als' | 'asls' | 'whittaker'
  params?: Record<string, unknown>
}
```

**响应数据**:
```typescript
interface BaselineResponse {
  spectrum: SpectrumDataPoint[]
}
```

**示例**:
```typescript
await spectrumApi.baseline('file-id-123', 'als', {
  lambda: 100000,
  p: 0.01
})
```

---

### 3. 平滑处理

**接口**: `POST /api/analysis/smooth`

**请求参数**:
```typescript
interface SmoothParams {
  file_id: string
  method?: string      // 'savitzky_golay' | 'moving_average'
  window_size?: number
}
```

**示例**:
```typescript
await spectrumApi.smooth('file-id-123', 'savitzky_golay', 5)
```

---

### 4. 寻峰分析

**接口**: `POST /api/analysis/peaks`

**请求参数**:
```typescript
interface PeakAnalysisParams {
  file_id: string
  element_range?: [number, number]
  sensitivity?: number
  min_peak_width?: number
}
```

**响应数据**:
```typescript
interface PeakAnalysisResponse {
  peaks: PeakResult[]
  spectrum?: SpectrumDataPoint[]
}

interface PeakResult {
  position: number     // 峰位
  intensity: number    // 强度
  halfWidth?: number   // 半高宽
  area?: number        // 峰面积
  assignment?: string  // 官能团归属
}
```

**示例**:
```typescript
import { analysisApi } from '@/api'

const response = await analysisApi.peaks({
  file_id: 'file-id-123',
  element_range: [400, 4000],
  sensitivity: 1.0,
  min_peak_width: 3
})
```

---

### 5. 官能团匹配

**接口**: `POST /api/analysis/match`

**请求参数**:
```typescript
{
  peaks: number[]  // 峰位列表
}
```

**响应数据**:
```typescript
interface MatchResponse {
  groups: string[]
  assignments: Array<{
    peak: number
    group: string
    confidence: number
  }>
}
```

**示例**:
```typescript
const response = await analysisApi.match([500, 1000, 1500, 2000])
```

---

## 数据处理 API

### 1. 执行算法

**接口**: `POST /api/process/execute`

**请求参数**:
```typescript
interface ProcessExecuteParams {
  file_id: string
  algorithm: string
  params?: Record<string, unknown>
}
```

**响应数据**:
```typescript
interface ProcessExecuteResponse {
  spectrum: SpectrumDataPoint[]
  metrics?: Record<string, unknown>
}
```

**示例**:
```typescript
import { processApi } from '@/api'

await processApi.execute({
  file_id: 'file-id-123',
  algorithm: 'wavelet_denoise',
  params: { level: 5 }
})
```

---

### 2. 获取处理队列

**接口**: `GET /api/process/queue`

**响应数据**:
```typescript
interface QueueResponse {
  queue: ProcessExecuteParams[]
}
```

---

### 3. 取消处理

**接口**: `DELETE /api/process/{taskId}`

**示例**:
```typescript
await processApi.cancel('task-id-123')
```

---

### 4. 获取处理状态

**接口**: `GET /api/process/status/{taskId}`

**响应数据**:
```typescript
interface StatusResponse {
  status: string
  progress: number
}
```

---

## 定量分析 API

### 1. 曲线拟合

**接口**: `POST /api/quantitative/fit`

**请求参数**:
```typescript
interface QuantitativeFitParams {
  data: Array<{ x: number; y: number }>
  model?: string
}
```

**响应数据**:
```typescript
interface FitResponse {
  model_id: string
  r_squared: number
}
```

---

### 2. 浓度预测

**接口**: `POST /api/quantitative/predict`

**请求参数**:
```typescript
interface QuantitativePredictParams {
  spectrum: Array<{ x: number; y: number }>
  model_id: string
}
```

**响应数据**:
```typescript
interface PredictResponse {
  concentration: number
  confidence: number
}
```

---

## 报告生成 API

### 1. 生成报告

**接口**: `POST /api/report/generate`

**请求参数**:
```typescript
interface ReportGenerateParams {
  file_id: string
  format: 'pdf' | 'excel' | 'word'
  template?: string
  include_raw_data?: boolean
}
```

**响应数据**:
```typescript
interface ExportResponse {
  download_url: string
  file_name?: string
  expires_in?: number
}
```

**示例**:
```typescript
import { reportApi } from '@/api'

const response = await reportApi.generate('file-id-123', 'pdf')
window.open(response.data.download_url)
```

---

### 2. 获取报告列表

**接口**: `GET /api/reports`

**响应数据**:
```typescript
interface ReportListResponse {
  reports: Array<{
    id: string
    name: string
    created_at: string
    format: string
  }>
}
```

---

## 系统 API

### 1. 获取系统资源

**接口**: `GET /api/system/resources`

**响应数据**:
```typescript
interface SystemResource {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  gpu_usage?: number
}
```

---

### 2. 获取系统日志

**接口**: `GET /api/system/logs`

**响应数据**:
```typescript
interface LogsResponse {
  logs: Array<{
    level: string
    message: string
    timestamp: string
  }>
}
```

---

### 3. 获取系统配置

**接口**: `GET /api/system/config`

**响应数据**:
```typescript
interface SystemConfig {
  app_name: string
  version: string
  features?: string[]
}
```

---

## 错误处理

所有 API 错误统一通过 `request.ts` 拦截器处理：

- **401**: 未授权，自动跳转登录页
- **403**: 权限不足，显示警告通知
- **404**: 资源不存在
- **500**: 服务器内部错误
- **502/503/504**: 网关错误

### 自定义错误处理

```typescript
import { get } from '@/utils/request'
import { handleError, ErrorLevel } from '@/utils/errorHandler'

try {
  const response = await get('/api/data', undefined, {
    showError: false  // 关闭默认错误提示
  })
} catch (error) {
  handleError(error, {
    level: ErrorLevel.WARNING,
    context: { api: '/api/data' }
  })
}
```

---

## 类型定义

所有类型定义位于 `src/api/index.ts`，使用时直接导入：

```typescript
import type {
  LoginParams,
  LoginResponse,
  SpectrumFile,
  PeakResult,
  // ... 其他类型
} from '@/api'
```
