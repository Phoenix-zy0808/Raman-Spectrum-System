<template>
  <div class="mock-config-panel">
    <el-dialog
      v-model="visible"
      title="Mock 服务配置"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="config-content">
        <!-- Mock 开关 -->
        <div class="config-item">
          <span class="label">Mock 服务</span>
          <el-switch
            v-model="mockEnabled"
            @change="toggleMock"
            active-text="开启"
            inactive-text="关闭"
          />
        </div>

        <!-- 延迟设置 -->
        <div class="config-item">
          <span class="label">模拟延迟</span>
          <el-slider
            v-model="mockDelay"
            :min="0"
            :max="2000"
            :step="100"
            :marks="delayMarks"
            @change="updateDelay"
          />
          <span class="value">{{ mockDelay }} ms</span>
        </div>

        <!-- 错误率设置 -->
        <div class="config-item">
          <span class="label">模拟错误率</span>
          <el-slider
            v-model="mockErrorRate"
            :min="0"
            :max="20"
            :step="1"
            :format-tooltip="formatErrorRate"
            @change="updateErrorRate"
          />
          <span class="value">{{ mockErrorRate }}%</span>
        </div>

        <!-- 状态指示 -->
        <div class="status-indicator">
          <el-tag :type="mockEnabled ? 'success' : 'info'" size="small">
            <el-icon v-if="mockEnabled"><Check /></el-icon>
            {{ mockEnabled ? 'Mock 服务运行中' : 'Mock 服务已关闭' }}
          </el-tag>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <el-button @click="resetConfig">重置配置</el-button>
          <el-button type="primary" @click="viewMockData">查看 Mock 数据</el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Mock 数据查看对话框 -->
    <el-dialog
      v-model="dataVisible"
      title="Mock 数据预览"
      width="800px"
    >
      <el-tabs>
        <el-tab-pane label="文件列表">
          <el-table :data="mockFiles" max-height="300" style="width: 100%">
            <el-table-column prop="file_id" label="ID" width="180" />
            <el-table-column prop="file_name" label="文件名" />
            <el-table-column prop="element" label="元素" width="80" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="光谱数据">
          <div class="spectrum-preview">
            <p>共 {{ mockSpectrum?.length || 0 }} 个数据点</p>
            <p class="hint">数据范围：X: 400-4000 cm⁻¹</p>
          </div>
        </el-tab-pane>
        <el-tab-pane label="用户数据">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ mockUser?.username }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ mockUser?.role }}</el-descriptions-item>
            <el-descriptions-item label="Token">mock_token_***</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { mockInterceptor } from '@/mock'

// 对话框可见性
const visible = defineModel<boolean>('visible', { default: false })
const dataVisible = ref(false)

// Mock 配置
const mockEnabled = ref(true)
const mockDelay = ref(300)
const mockErrorRate = ref(2)

// Mock 数据预览
const mockFiles = ref<Array<{ file_id: string; file_name: string; element: string }>>([])
const mockSpectrum = ref<Array<{ x: number; y: number }>>([])
const mockUser = ref<{ username: string; role: string } | null>(null)

// 延迟标记
const delayMarks = computed(() => ({
  0: '无延迟',
  500: '正常',
  1000: '较慢',
  2000: '很慢',
}))

// 切换 Mock
function toggleMock(enabled: boolean) {
  mockInterceptor.setEnabled(enabled)
  localStorage.setItem('raman_mock_enabled', enabled ? 'true' : 'false')
}

// 更新延迟
function updateDelay(delay: number) {
  mockInterceptor.setDelay(delay)
}

// 更新错误率
function updateErrorRate(rate: number) {
  mockInterceptor.setErrorRate(rate / 100)
}

// 格式化错误率提示
function formatErrorRate(value: number) {
  return `${value}%`
}

// 重置配置
function resetConfig() {
  mockEnabled.value = true
  mockDelay.value = 300
  mockErrorRate.value = 2
  mockInterceptor.setEnabled(true)
  mockInterceptor.setDelay(300)
  mockInterceptor.setErrorRate(0.02)
  localStorage.setItem('raman_mock_enabled', 'true')
}

// 查看 Mock 数据
function viewMockData() {
  const data = mockInterceptor.getMockData()
  mockFiles.value = Array.from(data.files.values()).slice(0, 10)
  const firstSpectrum = data.spectrumData.values().next().value
  mockSpectrum.value = firstSpectrum || []
  const firstUser = data.users.values().next().value
  mockUser.value = firstUser ? { username: firstUser.user.username, role: firstUser.user.role } : null
  dataVisible.value = true
}

// 加载保存的配置
function loadConfig() {
  const saved = localStorage.getItem('raman_mock_enabled')
  if (saved !== null) {
    mockEnabled.value = saved === 'true'
    mockInterceptor.setEnabled(mockEnabled.value)
  }
}

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    loadConfig()
  }
})

// 初始化
loadConfig()
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.mock-config-panel {
  .config-content {
    padding: 10px 0;
  }

  .config-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    .label {
      width: 100px;
      color: $text-primary;
      font-size: 14px;
    }

    .value {
      width: 60px;
      text-align: right;
      color: $text-secondary;
      font-size: 13px;
    }

    :deep(.el-slider) {
      flex: 1;
      margin: 0 16px;

      .el-slider__bar {
        background-color: $primary-color;
      }

      .el-slider__button {
        border-color: $primary-color;
      }
    }
  }

  .status-indicator {
    margin: 20px 0;
    text-align: center;
  }

  .quick-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .spectrum-preview {
    text-align: center;
    padding: 40px 0;
    color: $text-regular;

    p {
      margin: 8px 0;
    }

    .hint {
      font-size: 12px;
      opacity: 0.7;
    }
  }
}
</style>
