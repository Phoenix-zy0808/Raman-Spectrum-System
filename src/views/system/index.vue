<template>
  <div class="page-container">
    <NavBar />
    <div class="main-content">
      <div class="left-panel">
        <dv-border-box-10>
          <div class="panel-content">
            <h2 class="panel-title">
              <i class="el-icon-monitor"></i>
              计算资源监控
            </h2>

            <div class="gauge-section">
              <div class="gauge-item">
                <div ref="cpuGauge" class="gauge-chart"></div>
                <div class="gauge-label">CPU 使用率</div>
              </div>
              <div class="gauge-item">
                <div ref="gpuGauge" class="gauge-chart"></div>
                <div class="gauge-label">GPU 使用率</div>
              </div>
            </div>

            <div class="memory-section">
              <h3 class="section-title">内存监控</h3>
              <div class="memory-item">
                <div class="memory-label">
                  <span>RAM 占用</span>
                  <span class="memory-value">{{ ramUsage }}%</span>
                </div>
                <el-progress
                  :percentage="ramUsage"
                  :color="getProgressColor(ramUsage)"
                  :stroke-width="12"
                  class="custom-progress"
                />
              </div>
              <div class="memory-item">
                <div class="memory-label">
                  <span>VRAM 占用</span>
                  <span class="memory-value">{{ vramUsage }}%</span>
                </div>
                <el-progress
                  :percentage="vramUsage"
                  :color="getProgressColor(vramUsage)"
                  :stroke-width="12"
                  class="custom-progress"
                />
              </div>
            </div>

            <div class="task-queue-section">
              <h3 class="section-title">任务队列</h3>
              <div class="task-list">
                <div
                  v-for="task in taskQueue"
                  :key="task.id"
                  class="task-item"
                  :class="task.status"
                >
                  <div class="task-icon">
                    <i :class="getTaskIcon(task.status)"></i>
                  </div>
                  <div class="task-info">
                    <div class="task-name">{{ task.name }}</div>
                    <div class="task-status">{{ task.statusText }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </dv-border-box-10>
      </div>

      <div class="center-panel">
        <dv-border-box-10>
          <div class="panel-content">
            <h2 class="panel-title">
              <i class="el-icon-user"></i>
              用户与权限管理
            </h2>

            <div class="workspace-card">
              <div class="workspace-info">
                <div class="user-avatar">
                  <i class="el-icon-user-solid"></i>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ currentUser.name }}</div>
                  <div class="user-team">团队: {{ currentUser.team }}</div>
                </div>
              </div>
              <el-button class="switch-workspace-btn" size="small">
                <i class="el-icon-refresh"></i> 切换工作区
              </el-button>
            </div>

            <div class="user-table-section">
              <el-table
                :data="teamMembers"
                class="custom-user-table"
                :header-cell-style="{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }"
              >
                <el-table-column width="60">
                  <template #default="scope">
                    <div class="table-avatar">
                      <i class="el-icon-user-solid"></i>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="role" label="角色" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="getRoleTagType(scope.row.role)"
                      effect="dark"
                      size="small"
                      class="role-tag"
                    >
                      {{ scope.row.role }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <span class="status-indicator" :class="scope.row.status">
                      <i class="status-dot"></i>
                      {{ scope.row.status === 'online' ? '在线' : '离线' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                  <template #default="scope">
                    <el-button
                      size="small"
                      class="action-btn permission-btn"
                      @click="handlePermission(scope.row)"
                    >
                      权限设置
                    </el-button>
                    <el-button
                      size="small"
                      class="action-btn remove-btn"
                      @click="handleRemove(scope.row)"
                    >
                      移出团队
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </dv-border-box-10>
      </div>

      <div class="right-panel">
        <dv-border-box-10>
          <div class="panel-content">
            <h2 class="panel-title">
              <i class="el-icon-setting"></i>
              版本控制与系统设置
            </h2>

            <div class="version-section">
              <h3 class="section-title">版本历史</h3>
              <el-timeline class="custom-timeline">
                <el-timeline-item
                  v-for="version in versionHistory"
                  :key="version.id"
                  :timestamp="version.date"
                  :color="version.color"
                  placement="top"
                >
                  <div class="timeline-content">
                    <div class="version-tag">{{ version.version }}</div>
                    <div class="version-desc">{{ version.description }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>

            <div class="settings-section">
              <h3 class="section-title">系统偏好设置</h3>

              <div class="setting-item">
                <div class="setting-label">
                  <i class="el-icon-moon"></i>
                  主题模式
                </div>
                <el-switch
                  v-model="settings.darkMode"
                  active-text="深色"
                  inactive-text="浅色"
                  class="custom-switch"
                />
              </div>

              <div class="setting-item">
                <div class="setting-label">
                  <i class="el-icon-folder-opened"></i>
                  数据存储
                </div>
                <el-radio-group v-model="settings.storage" class="custom-radio-group">
                  <el-radio label="local">本地存储</el-radio>
                  <el-radio label="cloud">云端存储</el-radio>
                </el-radio-group>
              </div>

              <div class="setting-item">
                <div class="setting-label">
                  <i class="el-icon-upload"></i>
                  自动备份
                </div>
                <el-switch
                  v-model="settings.autoBackup"
                  active-text="开启"
                  inactive-text="关闭"
                  class="custom-switch"
                />
              </div>

              <el-button class="save-settings-btn" type="primary">
                <i class="el-icon-check"></i> 保存设置
              </el-button>
            </div>
          </div>
        </dv-border-box-10>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import echarts from 'echarts'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'SystemMonitor',
  components: {
    NavBar
  },
  setup() {
    const cpuGauge = ref<HTMLElement | null>(null)
    const gpuGauge = ref<HTMLElement | null>(null)
    let cpuGaugeInstance: any = null
    let gpuGaugeInstance: any = null

    const cpuUsage = ref(45)
    const gpuUsage = ref(68)
    const ramUsage = ref(72)
    const vramUsage = ref(55)

    const currentUser = ref({
      name: '张研究员',
      team: '拉曼光谱分析实验室'
    })

    const taskQueue = ref([
      { id: 1, name: '光谱预处理', status: 'running', statusText: '运行中' },
      { id: 2, name: '模型训练', status: 'waiting', statusText: '等待中' },
      { id: 3, name: '数据导出', status: 'running', statusText: '运行中' },
      { id: 4, name: '峰位识别', status: 'completed', statusText: '已完成' },
      { id: 5, name: '光谱对比', status: 'waiting', statusText: '等待中' }
    ])

    const teamMembers = ref([
      { id: 1, name: '张研究员', role: '管理员', status: 'online' },
      { id: 2, name: '李工程师', role: '研究员', status: 'online' },
      { id: 3, name: '王分析师', role: '研究员', status: 'offline' },
      { id: 4, name: '刘助理', role: '访客', status: 'online' },
      { id: 5, name: '陈教授', role: '管理员', status: 'offline' }
    ])

    const versionHistory = ref([
      {
        id: 1,
        version: 'V1.5',
        date: '2026-02-08',
        description: '新增智能报告生成功能',
        color: '#00e5ff'
      },
      {
        id: 2,
        version: 'V1.4',
        date: '2026-02-01',
        description: '优化定量分析算法',
        color: '#00ff7f'
      },
      {
        id: 3,
        version: 'V1.3',
        date: '2026-01-25',
        description: '新增300组标准样本',
        color: '#00e5ff'
      },
      {
        id: 4,
        version: 'V1.2',
        date: '2026-01-18',
        description: '优化去噪算法性能',
        color: '#ff6b00'
      },
      {
        id: 5,
        version: 'V1.1',
        date: '2026-01-10',
        description: '修复已知问题',
        color: '#00e5ff'
      }
    ])

    const settings = ref({
      darkMode: true,
      storage: 'cloud',
      autoBackup: true
    })

    let updateInterval: any = null

    const getProgressColor = (percentage: number) => {
      if (percentage >= 80) return '#ff6b00'
      if (percentage >= 60) return '#ffba00'
      return '#00e5ff'
    }

    const getTaskIcon = (status: string) => {
      switch (status) {
        case 'running':
          return 'el-icon-loading'
        case 'waiting':
          return 'el-icon-time'
        case 'completed':
          return 'el-icon-success'
        default:
          return 'el-icon-info'
      }
    }

    const getRoleTagType = (role: string) => {
      switch (role) {
        case '管理员':
          return 'danger'
        case '研究员':
          return 'primary'
        case '访客':
          return 'info'
        default:
          return 'info'
      }
    }

    const handlePermission = (user: any) => {
      ElMessage.info(`正在设置 ${user.name} 的权限...`)
    }

    const handleRemove = (user: any) => {
      ElMessage.warning(`确认要移出 ${user.name} 吗？`)
    }

    const renderCPUGauge = () => {
      if (!cpuGauge.value) return

      if (!cpuGaugeInstance) {
        cpuGaugeInstance = echarts.init(cpuGauge.value)
      }

      const option = {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: '85%',
            axisLine: {
              lineStyle: {
                width: 12,
                color: [
                  [0.6, '#00e5ff'],
                  [0.8, '#ffba00'],
                  [1, '#ff6b00']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: '#00e5ff'
              },
              width: 4
            },
            axisTick: {
              distance: -12,
              length: 6,
              lineStyle: {
                color: '#00e5ff',
                width: 1
              }
            },
            splitLine: {
              distance: -15,
              length: 12,
              lineStyle: {
                color: '#00e5ff',
                width: 2
              }
            },
            axisLabel: {
              distance: 18,
              color: '#00e5ff',
              fontSize: 10
            },
            detail: {
              valueAnimation: true,
              formatter: '{value}%',
              color: '#00e5ff',
              fontSize: 18,
              fontWeight: 'bold',
              offsetCenter: [0, '70%']
            },
            data: [{ value: cpuUsage.value }]
          }
        ]
      }

      cpuGaugeInstance.setOption(option)
    }

    const renderGPUGauge = () => {
      if (!gpuGauge.value) return

      if (!gpuGaugeInstance) {
        gpuGaugeInstance = echarts.init(gpuGauge.value)
      }

      const option = {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: '85%',
            axisLine: {
              lineStyle: {
                width: 12,
                color: [
                  [0.6, '#00e5ff'],
                  [0.8, '#ffba00'],
                  [1, '#ff6b00']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: '#ff6b00'
              },
              width: 4
            },
            axisTick: {
              distance: -12,
              length: 6,
              lineStyle: {
                color: '#00e5ff',
                width: 1
              }
            },
            splitLine: {
              distance: -15,
              length: 12,
              lineStyle: {
                color: '#00e5ff',
                width: 2
              }
            },
            axisLabel: {
              distance: 18,
              color: '#00e5ff',
              fontSize: 10
            },
            detail: {
              valueAnimation: true,
              formatter: '{value}%',
              color: '#ff6b00',
              fontSize: 18,
              fontWeight: 'bold',
              offsetCenter: [0, '70%']
            },
            data: [{ value: gpuUsage.value }]
          }
        ]
      }

      gpuGaugeInstance.setOption(option)
    }

    const updateResourceData = () => {
      cpuUsage.value = Math.max(20, Math.min(95, cpuUsage.value + (Math.random() - 0.5) * 10))
      gpuUsage.value = Math.max(30, Math.min(90, gpuUsage.value + (Math.random() - 0.5) * 8))
      ramUsage.value = Math.max(40, Math.min(85, ramUsage.value + (Math.random() - 0.5) * 5))
      vramUsage.value = Math.max(30, Math.min(80, vramUsage.value + (Math.random() - 0.5) * 6))

      renderCPUGauge()
      renderGPUGauge()
    }

    onMounted(() => {
      renderCPUGauge()
      renderGPUGauge()

      updateInterval = setInterval(updateResourceData, 2000)

      window.addEventListener('resize', () => {
        cpuGaugeInstance?.resize()
        gpuGaugeInstance?.resize()
      })
    })

    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    })

    return {
      cpuGauge,
      gpuGauge,
      cpuUsage,
      gpuUsage,
      ramUsage,
      vramUsage,
      currentUser,
      taskQueue,
      teamMembers,
      versionHistory,
      settings,
      getProgressColor,
      getTaskIcon,
      getRoleTagType,
      handlePermission,
      handleRemove
    }
  }
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #001529 0%, #000814 100%);
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.left-panel {
  width: 30%;
  height: 100%;
  overflow-y: auto;
}

.center-panel {
  width: 40%;
  height: 100%;
  overflow-y: auto;
}

.right-panel {
  width: 30%;
  height: 100%;
  overflow-y: auto;
}

.panel-content {
  padding: 20px;
  height: 100%;
}

.panel-title {
  font-size: 18px;
  font-weight: bold;
  color: #00e5ff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.6);
}

.panel-title i {
  font-size: 20px;
}

.section-title {
  font-size: 15px;
  color: #00e5ff;
  margin-bottom: 12px;
  font-weight: 600;
  padding-left: 10px;
  border-left: 3px solid #ff6b00;
}

.gauge-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.gauge-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-chart {
  width: 100%;
  height: 180px;
}

.gauge-label {
  margin-top: 8px;
  font-size: 13px;
  color: #00e5ff;
  font-weight: 600;
  text-align: center;
}

.memory-section {
  margin-bottom: 24px;
}

.memory-item {
  margin-bottom: 16px;
}

.memory-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #00e5ff;
}

.memory-value {
  font-weight: bold;
  color: #ff6b00;
}

.custom-progress :deep(.el-progress-bar__outer) {
  background: rgba(0, 21, 41, 0.5);
  border: 1px solid rgba(0, 229, 255, 0.3);
}

.custom-progress :deep(.el-progress-bar__inner) {
  border-radius: 4px;
  box-shadow: 0 0 10px currentColor;
  transition: all 0.3s;
}

.custom-progress :deep(.el-progress__text) {
  color: #00e5ff !important;
  font-size: 12px !important;
}

.task-queue-section {
  margin-top: 24px;
}

.task-list {
  max-height: 300px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s;
}

.task-item:hover {
  background: rgba(0, 229, 255, 0.1);
  border-color: #00e5ff;
  transform: translateX(4px);
}

.task-item.running {
  border-left: 3px solid #00ff7f;
}

.task-item.waiting {
  border-left: 3px solid #ffba00;
}

.task-item.completed {
  border-left: 3px solid #00e5ff;
}

.task-icon {
  font-size: 18px;
  color: #00e5ff;
}

.task-item.running .task-icon {
  color: #00ff7f;
  animation: spin 1s linear infinite;
}

.task-item.waiting .task-icon {
  color: #ffba00;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: 13px;
  color: #00e5ff;
  font-weight: 500;
  margin-bottom: 4px;
}

.task-status {
  font-size: 11px;
  color: rgba(0, 229, 255, 0.7);
}

.workspace-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 20px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 8px;
}

.workspace-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #00e5ff, #00b8d4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #001529;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 16px;
  font-weight: bold;
  color: #00e5ff;
}

.user-team {
  font-size: 12px;
  color: rgba(0, 229, 255, 0.7);
}

.switch-workspace-btn {
  background: rgba(255, 107, 0, 0.2) !important;
  border: 1px solid #ff6b00 !important;
  color: #ff6b00 !important;
  transition: all 0.3s;
}

.switch-workspace-btn:hover {
  background: rgba(255, 107, 0, 0.3) !important;
  box-shadow: 0 0 15px rgba(255, 107, 0, 0.5);
  transform: translateY(-2px);
}

.user-table-section {
  margin-top: 16px;
}

.custom-user-table {
  background: transparent !important;
}

.custom-user-table :deep(.el-table__body-wrapper) {
  background: transparent;
}

.custom-user-table :deep(.el-table tr) {
  background: rgba(0, 21, 41, 0.3);
}

.custom-user-table :deep(.el-table__row:hover > td) {
  background: rgba(0, 229, 255, 0.1) !important;
}

.custom-user-table :deep(.el-table td),
.custom-user-table :deep(.el-table th) {
  border-color: rgba(0, 229, 255, 0.1);
  color: #00e5ff;
}

.custom-user-table :deep(.el-table__header-wrapper th) {
  background: rgba(0, 229, 255, 0.1) !important;
  color: #00e5ff !important;
  font-weight: 600;
}

.table-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #00e5ff, #00b8d4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #001529;
}

.role-tag {
  font-size: 11px;
  padding: 2px 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00e5ff;
}

.status-indicator.online .status-dot {
  background: #00ff7f;
  box-shadow: 0 0 8px #00ff7f;
  animation: pulse 2s ease-in-out infinite;
}

.status-indicator.offline .status-dot {
  background: #666;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.action-btn {
  font-size: 11px;
  padding: 4px 8px;
  margin: 0 2px;
}

.permission-btn {
  background: rgba(0, 229, 255, 0.2) !important;
  border: 1px solid rgba(0, 229, 255, 0.5) !important;
  color: #00e5ff !important;
}

.permission-btn:hover {
  background: rgba(0, 229, 255, 0.3) !important;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}

.remove-btn {
  background: rgba(255, 107, 0, 0.2) !important;
  border: 1px solid rgba(255, 107, 0, 0.5) !important;
  color: #ff6b00 !important;
}

.remove-btn:hover {
  background: rgba(255, 107, 0, 0.3) !important;
  box-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
}

.version-section {
  margin-bottom: 24px;
}

.custom-timeline {
  margin-top: 12px;
  padding-left: 4px;
}

.custom-timeline :deep(.el-timeline-item__wrapper) {
  padding-left: 24px;
}

.custom-timeline :deep(.el-timeline-item__timestamp) {
  color: rgba(0, 229, 255, 0.7);
  font-size: 11px;
}

.custom-timeline :deep(.el-timeline-item__node) {
  background: transparent;
  border-width: 2px;
}

.custom-timeline :deep(.el-timeline-item__tail) {
  border-left: 2px dashed rgba(0, 229, 255, 0.3);
}

.timeline-content {
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.timeline-content:hover {
  background: rgba(0, 229, 255, 0.1);
  border-color: #00e5ff;
  transform: translateX(4px);
}

.version-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(0, 229, 255, 0.2);
  border: 1px solid #00e5ff;
  border-radius: 4px;
  color: #00e5ff;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 6px;
}

.version-desc {
  font-size: 13px;
  color: rgba(0, 229, 255, 0.8);
}

.settings-section {
  margin-top: 24px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  margin-bottom: 12px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s;
}

.setting-item:hover {
  background: rgba(0, 229, 255, 0.08);
  border-color: #00e5ff;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #00e5ff;
  font-weight: 500;
}

.setting-label i {
  font-size: 16px;
}

.custom-switch :deep(.el-switch__core) {
  background: rgba(0, 229, 255, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.5);
}

.custom-switch :deep(.el-switch.is-checked .el-switch__core) {
  background: #00e5ff;
}

.custom-switch :deep(.el-switch__label) {
  color: #00e5ff;
  font-size: 12px;
}

.custom-radio-group {
  display: flex;
  gap: 12px;
}

.custom-radio-group :deep(.el-radio__label) {
  color: #00e5ff;
  font-size: 12px;
}

.custom-radio-group :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #00e5ff;
  border-color: #00e5ff;
}

.custom-radio-group :deep(.el-radio__inner) {
  border-color: rgba(0, 229, 255, 0.5);
  background: rgba(0, 229, 255, 0.1);
}

.save-settings-btn {
  width: 100%;
  margin-top: 16px;
  background: linear-gradient(135deg, #ff6b00, #ff4500) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 600;
  padding: 12px;
  box-shadow: 0 0 20px rgba(255, 107, 0, 0.4);
  transition: all 0.3s;
}

.save-settings-btn:hover {
  box-shadow: 0 0 30px rgba(255, 107, 0, 0.7);
  transform: translateY(-2px);
}

.left-panel::-webkit-scrollbar,
.center-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar,
.task-list::-webkit-scrollbar {
  width: 6px;
}

.left-panel::-webkit-scrollbar-track,
.center-panel::-webkit-scrollbar-track,
.right-panel::-webkit-scrollbar-track,
.task-list::-webkit-scrollbar-track {
  background: rgba(0, 21, 41, 0.3);
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb,
.center-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb,
.task-list::-webkit-scrollbar-thumb {
  background: rgba(0, 229, 255, 0.4);
  border-radius: 3px;
  transition: all 0.3s;
}

.left-panel::-webkit-scrollbar-thumb:hover,
.center-panel::-webkit-scrollbar-thumb:hover,
.right-panel::-webkit-scrollbar-thumb:hover,
.task-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 0, 0.6);
}

@media (max-width: 1600px) {
  .gauge-chart {
    height: 150px;
  }

  .panel-title {
    font-size: 16px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    overflow-y: auto;
  }

  .left-panel,
  .center-panel,
  .right-panel {
    width: 100% !important;
    height: auto;
  }

  .gauge-section {
    max-width: 600px;
    margin: 0 auto 24px;
  }
}
</style>