<template>
  <div class="page-container">
    <NavBar />
    <div class="main-content">
      <!-- 左侧面板 - 计算资源监控 -->
      <div class="left-panel">
        <dv-border-box-10>
          <div class="panel-content">
            <h2 class="panel-title">
              <i class="el-icon-monitor"></i>
              计算资源监控
            </h2>

            <!-- GPU/CPU 仪表盘 -->
            <div class="gauge-section">
              <div class="gauge-item">
                <div ref="cpuGauge" class="gauge-chart"></div>
                <div class="gauge-label">
                  <i class="el-icon-cpu"></i>
                  CPU 使用率
                </div>
                <div class="gauge-stats">
                  <span class="stat-item">核心: 16</span>
                  <span class="stat-item">频率: 3.8GHz</span>
                </div>
              </div>
              <div class="gauge-item">
                <div ref="gpuGauge" class="gauge-chart"></div>
                <div class="gauge-label">
                  <i class="el-icon-video-camera"></i>
                  GPU 使用率
                </div>
                <div class="gauge-stats">
                  <span class="stat-item">型号: RTX 4090</span>
                  <span class="stat-item">温度: {{ gpuTemp }}°C</span>
                </div>
              </div>
            </div>

            <!-- 内存占用显示 -->
            <div class="memory-section">
              <h3 class="section-title">
                <i class="el-icon-s-data"></i>
                内存占用
              </h3>
              <div class="memory-item">
                <div class="memory-label">
                  <span>系统内存 (RAM)</span>
                  <span class="memory-value">{{ ramUsage }}% ({{ ramUsed }}GB / {{ ramTotal }}GB)</span>
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
                  <span>显存 (VRAM)</span>
                  <span class="memory-value">{{ vramUsage }}% ({{ vramUsed }}GB / {{ vramTotal }}GB)</span>
                </div>
                <el-progress
                  :percentage="vramUsage"
                  :color="getProgressColor(vramUsage)"
                  :stroke-width="12"
                  class="custom-progress"
                />
              </div>
            </div>

            <!-- 处理队列状态 -->
            <div class="task-queue-section">
              <h3 class="section-title">
                <i class="el-icon-s-operation"></i>
                处理队列状态
              </h3>
              <div class="queue-stats">
                <div class="queue-stat-item running">
                  <div class="stat-number">{{ runningTasks }}</div>
                  <div class="stat-label">运行中</div>
                </div>
                <div class="queue-stat-item waiting">
                  <div class="stat-number">{{ waitingTasks }}</div>
                  <div class="stat-label">等待中</div>
                </div>
                <div class="queue-stat-item completed">
                  <div class="stat-number">{{ completedTasks }}</div>
                  <div class="stat-label">已完成</div>
                </div>
              </div>
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
                    <div class="task-progress" v-if="task.status === 'running'">
                      <el-progress
                        :percentage="task.progress"
                        :show-text="false"
                        :stroke-width="4"
                        color="#00ff7f"
                      />
                    </div>
                    <div class="task-status">{{ task.statusText }}</div>
                  </div>
                  <div class="task-actions" v-if="task.status === 'running' || task.status === 'waiting'">
                    <el-button
                      size="mini"
                      type="text"
                      @click="cancelTask(task.id)"
                      class="cancel-btn"
                    >
                      取消
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </dv-border-box-10>
      </div>

      <!-- 中央面板 - 用户权限管理 -->
      <div class="center-panel">
        <dv-border-box-10>
          <div class="panel-content">
            <h2 class="panel-title">
              <i class="el-icon-user"></i>
              用户权限管理
            </h2>

            <!-- 工作区切换卡片 -->
            <div class="workspace-card">
              <div class="workspace-info">
                <div class="user-avatar">
                  <i class="el-icon-user-solid"></i>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ currentUser.name }}</div>
                  <div class="workspace-type">
                    <i :class="workspaceMode === 'personal' ? 'el-icon-user' : 'el-icon-s-custom'"></i>
                    {{ workspaceMode === 'personal' ? '个人工作区' : '团队工作区' }}
                  </div>
                  <div class="user-team" v-if="workspaceMode === 'team'">{{ currentUser.team }}</div>
                </div>
              </div>
              <div class="workspace-actions">
                <el-button
                  class="switch-workspace-btn"
                  size="small"
                  @click="toggleWorkspace"
                >
                  <i class="el-icon-refresh-right"></i>
                  切换到{{ workspaceMode === 'personal' ? '团队' : '个人' }}工作区
                </el-button>
              </div>
            </div>

            <!-- 数据分享与协作 -->
            <div class="collaboration-section">
              <h3 class="section-title">
                <i class="el-icon-share"></i>
                数据分享与协作
              </h3>
              <div class="share-controls">
                <el-select v-model="selectedProject" placeholder="选择项目" class="share-select">
                  <el-option
                    v-for="project in projects"
                    :key="project.id"
                    :label="project.name"
                    :value="project.id"
                  />
                </el-select>
                <el-button class="share-btn" @click="openShareDialog">
                  <i class="el-icon-share"></i>
                  分享项目
                </el-button>
              </div>
              <div class="shared-items">
                <div
                  v-for="item in sharedItems"
                  :key="item.id"
                  class="shared-item"
                >
                  <div class="shared-icon">
                    <i :class="item.type === 'project' ? 'el-icon-folder-opened' : 'el-icon-document'"></i>
                  </div>
                  <div class="shared-info">
                    <div class="shared-name">{{ item.name }}</div>
                    <div class="shared-meta">
                      <span>分享给: {{ item.sharedWith }}</span>
                      <span>{{ item.date }}</span>
                    </div>
                  </div>
                  <el-button
                    size="mini"
                    type="text"
                    class="revoke-btn"
                    @click="revokeShare(item.id)"
                  >
                    撤销
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 团队成员管理 -->
            <div class="user-table-section">
              <h3 class="section-title">
                <i class="el-icon-s-custom"></i>
                团队成员管理
              </h3>
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
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button
                      size="small"
                      class="action-btn permission-btn"
                      @click="handlePermission(scope.row)"
                    >
                      <i class="el-icon-setting"></i>
                      权限设置
                    </el-button>
                    <el-button
                      size="small"
                      class="action-btn remove-btn"
                      @click="handleRemove(scope.row)"
                    >
                      <i class="el-icon-delete"></i>
                      移出
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </dv-border-box-10>
      </div>

      <!-- 右侧面板 - 版本控制与设置 -->
      <div class="right-panel">
        <dv-border-box-10>
          <div class="panel-content">
            <h2 class="panel-title">
              <i class="el-icon-setting"></i>
              版本控制与系统设置
            </h2>

            <!-- 版本控制 -->
            <div class="version-section">
              <h3 class="section-title">
                <i class="el-icon-document-copy"></i>
                版本历史
              </h3>
              <div class="version-controls">
                <el-button class="version-btn" size="small" @click="createVersion">
                  <i class="el-icon-circle-plus"></i>
                  创建快照
                </el-button>
                <el-button class="version-btn" size="small" @click="compareVersions">
                  <i class="el-icon-s-data"></i>
                  版本对比
                </el-button>
              </div>
              <el-timeline class="custom-timeline">
                <el-timeline-item
                  v-for="version in versionHistory"
                  :key="version.id"
                  :timestamp="version.date"
                  :color="version.color"
                  placement="top"
                >
                  <div class="timeline-content">
                    <div class="version-header">
                      <div class="version-tag">{{ version.version }}</div>
                      <el-button
                        size="mini"
                        type="text"
                        class="restore-btn"
                        @click="restoreVersion(version.id)"
                      >
                        <i class="el-icon-refresh-left"></i>
                        恢复
                      </el-button>
                    </div>
                    <div class="version-desc">{{ version.description }}</div>
                    <div class="version-meta">
                      <span>作者: {{ version.author }}</span>
                      <span>文件数: {{ version.files }}</span>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>

            <!-- 系统偏好设置 -->
            <div class="settings-section">
              <h3 class="section-title">
                <i class="el-icon-s-tools"></i>
                系统偏好设置
              </h3>

              <!-- 显示主题切换 -->
              <div class="setting-item">
                <div class="setting-label">
                  <i class="el-icon-moon"></i>
                  显示主题
                </div>
                <el-switch
                  v-model="settings.darkMode"
                  active-text="暗色"
                  inactive-text="亮色"
                  class="custom-switch"
                  @change="handleThemeChange"
                />
              </div>

              <!-- 数据存储设置 -->
              <div class="setting-item">
                <div class="setting-label">
                  <i class="el-icon-folder-opened"></i>
                  数据存储
                </div>
                <el-radio-group v-model="settings.storage" class="custom-radio-group" @change="handleStorageChange">
                  <el-radio label="local">本地存储</el-radio>
                  <el-radio label="cloud">云端存储</el-radio>
                </el-radio-group>
              </div>

              <!-- 自动备份 -->
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

              <!-- 快捷键自定义 -->
              <div class="setting-item keyboard-setting">
                <div class="setting-label">
                  <i class="el-icon-attract"></i>
                  快捷键自定义
                </div>
                <el-button size="small" class="keyboard-btn" @click="openKeyboardSettings">
                  <i class="el-icon-setting"></i>
                  配置快捷键
                </el-button>
              </div>

              <!-- 快捷键列表 -->
              <div class="keyboard-shortcuts" v-if="showKeyboardSettings">
                <div class="shortcut-item" v-for="shortcut in shortcuts" :key="shortcut.id">
                  <span class="shortcut-action">{{ shortcut.action }}</span>
                  <el-tag class="shortcut-key" size="small">{{ shortcut.key }}</el-tag>
                  <el-button
                    size="mini"
                    type="text"
                    @click="editShortcut(shortcut.id)"
                    class="edit-shortcut-btn"
                  >
                    修改
                  </el-button>
                </div>
              </div>

              <!-- 语言设置 -->
              <div class="setting-item">
                <div class="setting-label">
                  <i class="el-icon-s-comment"></i>
                  界面语言
                </div>
                <el-select v-model="settings.language" class="language-select" size="small">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                  <el-option label="日本語" value="ja-JP" />
                </el-select>
              </div>

              <!-- 通知设置 -->
              <div class="setting-item">
                <div class="setting-label">
                  <i class="el-icon-bell"></i>
                  系统通知
                </div>
                <el-switch
                  v-model="settings.notifications"
                  active-text="开启"
                  inactive-text="关闭"
                  class="custom-switch"
                />
              </div>

              <el-button class="save-settings-btn" @click="saveSettings">
                <i class="el-icon-check"></i> 保存所有设置
              </el-button>
            </div>
          </div>
        </dv-border-box-10>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'

export default defineComponent({
  name: 'SystemMonitor',
  components: {
    NavBar
  },
  setup() {
    // 图表实例
    const cpuGauge = ref<HTMLElement | null>(null)
    const gpuGauge = ref<HTMLElement | null>(null)
    let cpuGaugeInstance: ECharts | null = null
    let gpuGaugeInstance: ECharts | null = null

    // 资源使用数据
    const cpuUsage = ref(45)
    const gpuUsage = ref(68)
    const gpuTemp = ref(72)
    const ramUsage = ref(72)
    const ramUsed = ref(57.6)
    const ramTotal = ref(80)
    const vramUsage = ref(55)
    const vramUsed = ref(13.2)
    const vramTotal = ref(24)

    // 工作区模式
    const workspaceMode = ref<'personal' | 'team'>('personal')

    // 当前用户
    const currentUser = ref({
      name: '张研究员',
      team: '拉曼光谱分析实验室'
    })

    // 项目列表
    const projects = ref([
      { id: 1, name: '苯系物光谱分析项目' },
      { id: 2, name: '定量分析标准曲线' },
      { id: 3, name: '多组分混合物识别' }
    ])

    const selectedProject = ref(1)

    // 分享项目列表
    const sharedItems = ref([
      { id: 1, name: '苯系物光谱分析项目', type: 'project', sharedWith: '李工程师', date: '2026-02-08' },
      { id: 2, name: '标准样本数据集', type: 'data', sharedWith: '王分析师', date: '2026-02-07' },
      { id: 3, name: '实验报告模板', type: 'document', sharedWith: '团队成员', date: '2026-02-06' }
    ])

    // 任务队列
    const taskQueue = ref([
      { id: 1, name: '光谱预处理 - 基线校正', status: 'running', statusText: '运行中', progress: 67 },
      { id: 2, name: 'PCA降维分析', status: 'running', statusText: '运行中', progress: 42 },
      { id: 3, name: '模型训练 - ResNet50', status: 'waiting', statusText: '队列等待', progress: 0 },
      { id: 4, name: '数据导出 - Excel', status: 'waiting', statusText: '队列等待', progress: 0 },
      { id: 5, name: '峰位识别与标注', status: 'completed', statusText: '已完成', progress: 100 },
      { id: 6, name: '光谱对比分析', status: 'completed', statusText: '已完成', progress: 100 }
    ])

    // 团队成员
    const teamMembers = ref([
      { id: 1, name: '张研究员', role: '管理员', status: 'online' },
      { id: 2, name: '李工程师', role: '研究员', status: 'online' },
      { id: 3, name: '王分析师', role: '研究员', status: 'offline' },
      { id: 4, name: '刘助理', role: '访客', status: 'online' },
      { id: 5, name: '陈教授', role: '管理员', status: 'offline' }
    ])

    // 版本历史
    const versionHistory = ref([
      {
        id: 1,
        version: 'V1.5.0',
        date: '2026-02-09 15:30',
        description: '新增智能报告生成功能',
        author: '张研究员',
        files: 12,
        color: '#00e5ff'
      },
      {
        id: 2,
        version: 'V1.4.2',
        date: '2026-02-08 10:15',
        description: '优化定量分析算法',
        author: '李工程师',
        files: 8,
        color: '#00ff7f'
      },
      {
        id: 3,
        version: 'V1.4.1',
        date: '2026-02-07 14:22',
        description: '新增300组标准样本',
        author: '王分析师',
        files: 305,
        color: '#00e5ff'
      },
      {
        id: 4,
        version: 'V1.4.0',
        date: '2026-02-06 09:45',
        description: '重构数据预处理模块',
        author: '张研究员',
        files: 15,
        color: '#ff6b00'
      },
      {
        id: 5,
        version: 'V1.3.5',
        date: '2026-02-05 16:30',
        description: '修复峰位检测bug',
        author: '李工程师',
        files: 3,
        color: '#00e5ff'
      }
    ])

    // 快捷键设置
    const shortcuts = ref([
      { id: 1, action: '保存项目', key: 'Ctrl + S' },
      { id: 2, action: '导出报告', key: 'Ctrl + E' },
      { id: 3, action: '快速分析', key: 'Ctrl + R' },
      { id: 4, action: '撤销操作', key: 'Ctrl + Z' },
      { id: 5, action: '重做操作', key: 'Ctrl + Y' },
      { id: 6, action: '全屏模式', key: 'F11' }
    ])

    const showKeyboardSettings = ref(false)

    // 系统设置
    const settings = ref({
      darkMode: true,
      storage: 'cloud',
      autoBackup: true,
      language: 'zh-CN',
      notifications: true
    })

    let updateInterval: number | null = null

    // 计算属性
    const runningTasks = computed(() => taskQueue.value.filter(t => t.status === 'running').length)
    const waitingTasks = computed(() => taskQueue.value.filter(t => t.status === 'waiting').length)
    const completedTasks = computed(() => taskQueue.value.filter(t => t.status === 'completed').length)

    // 获取进度条颜色
    const getProgressColor = (percentage: number) => {
      if (percentage >= 80) return '#ff6b00'
      if (percentage >= 60) return '#ffba00'
      return '#00e5ff'
    }

    // 获取任务图标
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

    // 获取角色标签类型
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

    // 切换工作区
    const toggleWorkspace = () => {
      workspaceMode.value = workspaceMode.value === 'personal' ? 'team' : 'personal'
      const mode = workspaceMode.value === 'personal' ? '个人工作区' : '团队工作区'
      ElMessage.success(`已切换到${mode}`)
    }

    // 打开分享对话框
    const openShareDialog = () => {
      ElMessageBox.prompt('请输入要分享给的用户邮箱', '分享项目', {
        confirmButtonText: '分享',
        cancelButtonText: '取消',
        inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
        inputErrorMessage: '请输入有效的邮箱地址'
      }).then(({ value }) => {
        ElMessage.success(`项目已分享给 ${value}`)
      }).catch(() => {
        ElMessage.info('已取消分享')
      })
    }

    // 撤销分享
    const revokeShare = (id: number) => {
      const index = sharedItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        sharedItems.value.splice(index, 1)
        ElMessage.success('已撤销分享')
      }
    }

    // 取消任务
    const cancelTask = (id: number) => {
      ElMessageBox.confirm('确认要取消这个任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = taskQueue.value.findIndex(task => task.id === id)
        if (index !== -1) {
          taskQueue.value.splice(index, 1)
          ElMessage.success('任务已取消')
        }
      }).catch(() => {})
    }

    // 权限设置
    const handlePermission = (user: any) => {
      ElMessage.info(`正在设置 ${user.name} 的权限...`)
    }

    // 移出团队
    const handleRemove = (user: any) => {
      ElMessageBox.confirm(`确认要将 ${user.name} 移出团队吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success(`已将 ${user.name} 移出团队`)
      }).catch(() => {})
    }

    // 创建版本快照
    const createVersion = () => {
      ElMessageBox.prompt('请输入版本描述', '创建版本快照', {
        confirmButtonText: '创建',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        versionHistory.value.unshift({
          id: versionHistory.value.length + 1,
          version: `V1.${versionHistory.value.length + 1}.0`,
          date: new Date().toLocaleString('zh-CN'),
          description: value,
          author: currentUser.value.name,
          files: Math.floor(Math.random() * 20) + 5,
          color: '#00e5ff'
        })
        ElMessage.success('版本快照创建成功')
      }).catch(() => {})
    }

    // 对比版本
    const compareVersions = () => {
      ElMessage.info('版本对比功能开发中...')
    }

    // 恢复版本
    const restoreVersion = (id: number) => {
      const version = versionHistory.value.find(v => v.id === id)
      if (version) {
        ElMessageBox.confirm(`确认要恢复到版本 ${version.version} 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          ElMessage.success(`已恢复到版本 ${version.version}`)
        }).catch(() => {})
      }
    }

    // 主题切换
    const handleThemeChange = (value: boolean) => {
      const theme = value ? '暗色' : '亮色'
      ElMessage.success(`已切换到${theme}主题`)
    }

    // 存储设置变更
    const handleStorageChange = (value: string) => {
      const storage = value === 'local' ? '本地' : '云端'
      ElMessage.success(`数据将保存到${storage}存储`)
    }

    // 打开快捷键设置
    const openKeyboardSettings = () => {
      showKeyboardSettings.value = !showKeyboardSettings.value
    }

    // 编辑快捷键
    const editShortcut = (id: number) => {
      ElMessage.info('快捷键编辑功能开发中...')
    }

    // 保存设置
    const saveSettings = () => {
      ElMessage.success('设置已保存')
    }

    // 渲染CPU仪表盘
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
            radius: '90%',
            axisLine: {
              lineStyle: {
                width: 14,
                color: [
                  [0.6, '#00e5ff'],
                  [0.8, '#ffba00'],
                  [1, '#ff6b00']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: '#00e5ff',
                shadowColor: '#00e5ff',
                shadowBlur: 10
              },
              width: 5
            },
            axisTick: {
              distance: -14,
              length: 8,
              lineStyle: {
                color: '#00e5ff',
                width: 2
              }
            },
            splitLine: {
              distance: -18,
              length: 14,
              lineStyle: {
                color: '#00e5ff',
                width: 3
              }
            },
            axisLabel: {
              distance: 20,
              color: '#00e5ff',
              fontSize: 11,
              fontWeight: 'bold'
            },
            detail: {
              valueAnimation: true,
              formatter: '{value}%',
              color: '#00e5ff',
              fontSize: 20,
              fontWeight: 'bold',
              offsetCenter: [0, '75%']
            },
            data: [{ value: cpuUsage.value }]
          }
        ]
      }

      cpuGaugeInstance.setOption(option)
    }

    // 渲染GPU仪表盘
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
            radius: '90%',
            axisLine: {
              lineStyle: {
                width: 14,
                color: [
                  [0.6, '#00e5ff'],
                  [0.8, '#ffba00'],
                  [1, '#ff6b00']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: '#ff6b00',
                shadowColor: '#ff6b00',
                shadowBlur: 10
              },
              width: 5
            },
            axisTick: {
              distance: -14,
              length: 8,
              lineStyle: {
                color: '#00e5ff',
                width: 2
              }
            },
            splitLine: {
              distance: -18,
              length: 14,
              lineStyle: {
                color: '#00e5ff',
                width: 3
              }
            },
            axisLabel: {
              distance: 20,
              color: '#00e5ff',
              fontSize: 11,
              fontWeight: 'bold'
            },
            detail: {
              valueAnimation: true,
              formatter: '{value}%',
              color: '#ff6b00',
              fontSize: 20,
              fontWeight: 'bold',
              offsetCenter: [0, '75%']
            },
            data: [{ value: gpuUsage.value }]
          }
        ]
      }

      gpuGaugeInstance.setOption(option)
    }

    // 更新资源数据
    const updateResourceData = () => {
      cpuUsage.value = Math.max(20, Math.min(95, cpuUsage.value + (Math.random() - 0.5) * 10))
      gpuUsage.value = Math.max(30, Math.min(90, gpuUsage.value + (Math.random() - 0.5) * 8))
      gpuTemp.value = Math.max(60, Math.min(85, gpuTemp.value + (Math.random() - 0.5) * 3))
      ramUsage.value = Math.max(40, Math.min(85, ramUsage.value + (Math.random() - 0.5) * 5))
      vramUsage.value = Math.max(30, Math.min(80, vramUsage.value + (Math.random() - 0.5) * 6))

      ramUsed.value = Number((ramTotal.value * ramUsage.value / 100).toFixed(1))
      vramUsed.value = Number((vramTotal.value * vramUsage.value / 100).toFixed(1))

      // 更新运行中任务的进度
      taskQueue.value.forEach(task => {
        if (task.status === 'running') {
          task.progress = Math.min(100, task.progress + Math.random() * 5)
          if (task.progress >= 100) {
            task.status = 'completed'
            task.statusText = '已完成'
          }
        }
      })

      renderCPUGauge()
      renderGPUGauge()
    }

    // 窗口resize处理
    const handleResize = () => {
      cpuGaugeInstance?.resize()
      gpuGaugeInstance?.resize()
    }

    onMounted(() => {
      renderCPUGauge()
      renderGPUGauge()

      updateInterval = window.setInterval(updateResourceData, 2000)
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
      window.removeEventListener('resize', handleResize)
      cpuGaugeInstance?.dispose()
      gpuGaugeInstance?.dispose()
    })

    return {
      cpuGauge,
      gpuGauge,
      cpuUsage,
      gpuUsage,
      gpuTemp,
      ramUsage,
      ramUsed,
      ramTotal,
      vramUsage,
      vramUsed,
      vramTotal,
      workspaceMode,
      currentUser,
      projects,
      selectedProject,
      sharedItems,
      taskQueue,
      teamMembers,
      versionHistory,
      shortcuts,
      showKeyboardSettings,
      settings,
      runningTasks,
      waitingTasks,
      completedTasks,
      getProgressColor,
      getTaskIcon,
      getRoleTagType,
      toggleWorkspace,
      openShareDialog,
      revokeShare,
      cancelTask,
      handlePermission,
      handleRemove,
      createVersion,
      compareVersions,
      restoreVersion,
      handleThemeChange,
      handleStorageChange,
      openKeyboardSettings,
      editShortcut,
      saveSettings
    }
  }
})
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #001529 0%, #000814 100%);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  min-height: 0;
}

// ========== 左侧面板 ==========
.left-panel {
  width: 30%;
  min-width: 350px;
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 21, 41, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.4);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 107, 0, 0.6);
    }
  }
}

.panel-content {
  padding: 20px;
  height: 100%;
}

.panel-title {
  font-size: 19px;
  font-weight: bold;
  color: #00e5ff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.6);

  i {
    font-size: 22px;
  }
}

.section-title {
  font-size: 15px;
  color: #00e5ff;
  margin-bottom: 14px;
  font-weight: 600;
  padding-left: 12px;
  border-left: 4px solid #ff6b00;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 16px;
  }
}

// CPU/GPU仪表盘
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
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.gauge-chart {
  width: 100%;
  height: 180px;
}

.gauge-label {
  margin-top: 8px;
  font-size: 14px;
  color: #00e5ff;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 6px;
}

.gauge-stats {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: rgba(0, 229, 255, 0.7);
}

// 内存占用
.memory-section {
  margin-bottom: 24px;
}

.memory-item {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
}

.memory-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  color: #00e5ff;
}

.memory-value {
  font-weight: bold;
  color: #ff6b00;
  text-shadow: 0 0 8px rgba(255, 107, 0, 0.5);
}

.custom-progress :deep(.el-progress-bar__outer) {
  background: rgba(0, 21, 41, 0.5);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 6px;
}

.custom-progress :deep(.el-progress-bar__inner) {
  border-radius: 6px;
  box-shadow: 0 0 10px currentColor;
  transition: all 0.3s;
}

.custom-progress :deep(.el-progress__text) {
  color: #00e5ff !important;
  font-size: 12px !important;
  font-weight: bold !important;
}

// 任务队列
.task-queue-section {
  margin-top: 24px;
}

.queue-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.queue-stat-item {
  padding: 12px;
  background: rgba(0, 229, 255, 0.05);
  border: 2px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(0, 229, 255, 0.5);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
  }

  &.running {
    border-color: #00ff7f;
  }

  &.waiting {
    border-color: #ffba00;
  }

  &.completed {
    border-color: #00e5ff;
  }

  .stat-number {
    font-size: 24px;
    font-weight: bold;
    color: #00e5ff;
    margin-bottom: 4px;
  }

  &.running .stat-number {
    color: #00ff7f;
    text-shadow: 0 0 10px rgba(0, 255, 127, 0.6);
  }

  &.waiting .stat-number {
    color: #ffba00;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(0, 229, 255, 0.7);
  }
}

.task-list {
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.3);
    border-radius: 3px;
  }
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

  &:hover {
    background: rgba(0, 229, 255, 0.1);
    border-color: #00e5ff;
    transform: translateX(4px);
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
  }

  &.running {
    border-left: 4px solid #00ff7f;
  }

  &.waiting {
    border-left: 4px solid #ffba00;
  }

  &.completed {
    border-left: 4px solid #00e5ff;
    opacity: 0.7;
  }

  .task-icon {
    font-size: 18px;
    color: #00e5ff;
  }

  &.running .task-icon {
    color: #00ff7f;
    animation: spin 1s linear infinite;
  }

  &.waiting .task-icon {
    color: #ffba00;
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

  .task-progress {
    margin: 6px 0;
  }

  .task-status {
    font-size: 11px;
    color: rgba(0, 229, 255, 0.7);
  }

  .task-actions {
    .cancel-btn {
      color: #ff6b00;
      padding: 0;

      &:hover {
        color: #ff0000;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// ========== 中央面板 ==========
.center-panel {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 21, 41, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.4);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 107, 0, 0.6);
    }
  }
}

// 工作区卡片
.workspace-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  background: rgba(0, 229, 255, 0.08);
  border: 2px solid rgba(0, 229, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(0, 229, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
  }
}

.workspace-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #00e5ff, #00b8d4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #001529;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.6);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: #00e5ff;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
}

.workspace-type {
  font-size: 13px;
  color: #00ff7f;
  display: flex;
  align-items: center;
  gap: 6px;
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
  font-weight: 600;

  &:hover {
    background: rgba(255, 107, 0, 0.3) !important;
    box-shadow: 0 0 15px rgba(255, 107, 0, 0.5);
    transform: translateY(-2px);
  }
}

// 协作分享
.collaboration-section {
  margin-bottom: 24px;
}

.share-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.share-select {
  flex: 1;

  :deep(.el-input__inner) {
    background: rgba(0, 229, 255, 0.08);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #00e5ff;
  }
}

.share-btn {
  background: rgba(0, 229, 255, 0.2) !important;
  border: 1px solid #00e5ff !important;
  color: #00e5ff !important;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 229, 255, 0.3) !important;
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
  }
}

.shared-items {
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.3);
    border-radius: 3px;
  }
}

.shared-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 229, 255, 0.1);
    border-color: #00e5ff;
    transform: translateX(4px);
  }

  .shared-icon {
    font-size: 24px;
    color: #00e5ff;
  }

  .shared-info {
    flex: 1;

    .shared-name {
      font-size: 13px;
      color: #00e5ff;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .shared-meta {
      font-size: 11px;
      color: rgba(0, 229, 255, 0.6);
      display: flex;
      gap: 12px;
    }
  }

  .revoke-btn {
    color: #ff6b00;
    padding: 0;

    &:hover {
      color: #ff0000;
    }
  }
}

// 团队成员表格
.user-table-section {
  margin-top: 24px;
}

.custom-user-table {
  background: transparent !important;

  :deep(.el-table__body-wrapper) {
    background: transparent;
  }

  :deep(.el-table tr) {
    background: rgba(0, 21, 41, 0.3);
  }

  :deep(.el-table__row:hover > td) {
    background: rgba(0, 229, 255, 0.1) !important;
  }

  :deep(.el-table td),
  :deep(.el-table th) {
    border-color: rgba(0, 229, 255, 0.1);
    color: #00e5ff;
  }

  :deep(.el-table__header-wrapper th) {
    background: rgba(0, 229, 255, 0.1) !important;
    color: #00e5ff !important;
    font-weight: 600;
  }
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
  padding: 3px 10px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00e5ff;
  }

  &.online .status-dot {
    background: #00ff7f;
    box-shadow: 0 0 8px #00ff7f;
    animation: pulse 2s ease-in-out infinite;
  }

  &.offline .status-dot {
    background: #666;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.action-btn {
  font-size: 11px;
  padding: 5px 10px;
  margin: 0 4px;
}

.permission-btn {
  background: rgba(0, 229, 255, 0.2) !important;
  border: 1px solid rgba(0, 229, 255, 0.5) !important;
  color: #00e5ff !important;

  &:hover {
    background: rgba(0, 229, 255, 0.3) !important;
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  }
}

.remove-btn {
  background: rgba(255, 107, 0, 0.2) !important;
  border: 1px solid rgba(255, 107, 0, 0.5) !important;
  color: #ff6b00 !important;

  &:hover {
    background: rgba(255, 107, 0, 0.3) !important;
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
  }
}

// ========== 右侧面板 ==========
.right-panel {
  width: 30%;
  min-width: 350px;
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 21, 41, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.4);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 107, 0, 0.6);
    }
  }
}

// 版本控制
.version-section {
  margin-bottom: 24px;
}

.version-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.version-btn {
  background: rgba(0, 229, 255, 0.1) !important;
  border: 1px solid rgba(0, 229, 255, 0.3) !important;
  color: #00e5ff !important;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 229, 255, 0.2) !important;
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
  }
}

.custom-timeline {
  margin-top: 12px;
  padding-left: 6px;

  :deep(.el-timeline-item__wrapper) {
    padding-left: 28px;
  }

  :deep(.el-timeline-item__timestamp) {
    color: rgba(0, 229, 255, 0.7);
    font-size: 11px;
    font-weight: 500;
  }

  :deep(.el-timeline-item__node) {
    background: transparent;
    border-width: 3px;
  }

  :deep(.el-timeline-item__tail) {
    border-left: 2px dashed rgba(0, 229, 255, 0.3);
  }
}

.timeline-content {
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 229, 255, 0.1);
    border-color: #00e5ff;
    transform: translateX(4px);
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
  }
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.version-tag {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(0, 229, 255, 0.2);
  border: 1px solid #00e5ff;
  border-radius: 4px;
  color: #00e5ff;
  font-size: 12px;
  font-weight: bold;
}

.restore-btn {
  color: #00ff7f;
  padding: 0;

  &:hover {
    color: #00e5ff;
  }
}

.version-desc {
  font-size: 13px;
  color: rgba(0, 229, 255, 0.8);
  margin-bottom: 8px;
}

.version-meta {
  font-size: 11px;
  color: rgba(0, 229, 255, 0.6);
  display: flex;
  gap: 12px;
}

// 系统设置
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

  &:hover {
    background: rgba(0, 229, 255, 0.08);
    border-color: #00e5ff;
  }

  &.keyboard-setting {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #00e5ff;
  font-weight: 500;

  i {
    font-size: 16px;
  }
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

  :deep(.el-radio__label) {
    color: #00e5ff;
    font-size: 12px;
  }

  :deep(.el-radio__input.is-checked .el-radio__inner) {
    background: #00e5ff;
    border-color: #00e5ff;
  }

  :deep(.el-radio__inner) {
    border-color: rgba(0, 229, 255, 0.5);
    background: rgba(0, 229, 255, 0.1);
  }
}

.keyboard-btn {
  background: rgba(0, 229, 255, 0.2) !important;
  border: 1px solid rgba(0, 229, 255, 0.5) !important;
  color: #00e5ff !important;

  &:hover {
    background: rgba(0, 229, 255, 0.3) !important;
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
  }
}

.keyboard-shortcuts {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.3);
    border-radius: 3px;
  }
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: rgba(0, 21, 41, 0.5);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 4px;

  &:hover {
    border-color: rgba(0, 229, 255, 0.4);
  }

  .shortcut-action {
    font-size: 12px;
    color: rgba(0, 229, 255, 0.8);
  }

  .shortcut-key {
    background: rgba(0, 229, 255, 0.2);
    border-color: rgba(0, 229, 255, 0.5);
    color: #00e5ff;
    font-family: 'Courier New', monospace;
    font-weight: bold;
  }

  .edit-shortcut-btn {
    color: #00ff7f;
    padding: 0;

    &:hover {
      color: #00e5ff;
    }
  }
}

.language-select {
  :deep(.el-input__inner) {
    background: rgba(0, 229, 255, 0.08);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #00e5ff;
  }
}

.save-settings-btn {
  width: 100%;
  margin-top: 16px;
  background: linear-gradient(135deg, #ff6b00, #ff4500) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 600;
  padding: 14px;
  font-size: 15px;
  box-shadow: 0 0 20px rgba(255, 107, 0, 0.4);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 0 30px rgba(255, 107, 0, 0.7);
    transform: translateY(-2px);
  }
}

// ========== 响应式设计 ==========
@media screen and (max-width: 1600px) {
  .gauge-chart {
    height: 150px;
  }

  .panel-title {
    font-size: 17px;
  }
}

@media screen and (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    overflow-y: auto;
  }

  .left-panel,
  .center-panel,
  .right-panel {
    width: 100% !important;
    height: auto;
    min-height: 500px;
  }

  .gauge-section {
    max-width: 600px;
    margin: 0 auto 24px;
  }
}
</style>