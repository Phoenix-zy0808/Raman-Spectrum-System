<template>
  <div class="page-container">
    <NavBar />

    <div class="spectral-analysis-center">
      <!-- 左侧面板 - 样本管理 -->
      <div class="left-panel">
        <DvBorderBox13>
          <div class="panel-content">
            <div class="panel-title">
              <span class="title-icon">📊</span>
              <span>样本管理</span>
            </div>
            <div class="tree-container">
              <ElTree
                :data="sampleTreeData"
                :props="{ children: 'children', label: 'label' }"
                node-key="id"
                default-expand-all
                @node-click="handleNodeClick"
                class="sample-tree"
              >
                <template #default="{ node, data }">
                  <span class="tree-node">
                    <span :class="['node-icon', data.type]">●</span>
                    <span class="node-label">{{ node.label }}</span>
                  </span>
                </template>
              </ElTree>
            </div>

            <!-- 模态切换区域 -->
            <div class="modal-switch-section">
              <div class="section-title">模态切换</div>
              <div class="switch-group">
                <div class="switch-item">
                  <span class="switch-label">激发波长</span>
                  <ElSelect v-model="modalSettings.wavelength" class="glow-select" @change="handleModalChange">
                    <ElOption label="532 nm" :value="532" />
                    <ElOption label="633 nm" :value="633" />
                    <ElOption label="785 nm" :value="785" />
                    <ElOption label="1064 nm" :value="1064" />
                  </ElSelect>
                </div>
                <div class="switch-item">
                  <span class="switch-label">偏振模式</span>
                  <ElSelect v-model="modalSettings.polarization" class="glow-select" @change="handleModalChange">
                    <ElOption label="垂直偏振" value="vertical" />
                    <ElOption label="水平偏振" value="horizontal" />
                    <ElOption label="圆偏振" value="circular" />
                    <ElOption label="非偏振" value="none" />
                  </ElSelect>
                </div>
                <div class="switch-item">
                  <span class="switch-label">测量模式</span>
                  <ElSelect v-model="modalSettings.scanMode" class="glow-select" @change="handleModalChange">
                    <ElOption label="点扫描" value="point" />
                    <ElOption label="线扫描" value="line" />
                    <ElOption label="面扫描" value="area" />
                  </ElSelect>
                </div>
              </div>
            </div>
          </div>
        </DvBorderBox13>
      </div>

      <!-- 中央面板 -->
      <div class="center-panel">
        <!-- 控制栏 -->
        <div class="control-bar">
          <DvBorderBox12>
            <div class="control-content">
              <div class="control-group">
                <div class="control-item">
                  <span class="control-label">背景扣除</span>
                  <ElSwitch
                    v-model="algorithmConfig.backgroundSubtraction"
                    class="glow-switch"
                    @change="handleAlgorithmChange"
                  />
                </div>
                <div class="control-item">
                  <span class="control-label">基线校正</span>
                  <ElSwitch
                    v-model="algorithmConfig.baselineCorrection"
                    class="glow-switch"
                    @change="handleAlgorithmChange"
                  />
                </div>
                <div class="control-item">
                  <span class="control-label">平滑处理</span>
                  <ElSwitch
                    v-model="algorithmConfig.smoothing"
                    class="glow-switch"
                    @change="handleAlgorithmChange"
                  />
                </div>
                <div class="control-item">
                  <span class="control-label">峰值检测</span>
                  <ElSwitch
                    v-model="algorithmConfig.peakDetection"
                    class="glow-switch"
                    @change="handleAlgorithmChange"
                  />
                </div>
              </div>
              <div class="view-toggle">
                <ElButton
                  :type="viewMode === 'original' ? 'primary' : ''"
                  @click="viewMode = 'original'"
                  class="toggle-btn"
                >
                  原始图
                </ElButton>
                <ElButton
                  :type="viewMode === 'processed' ? 'primary' : ''"
                  @click="viewMode = 'processed'"
                  class="toggle-btn"
                >
                  预处理图
                </ElButton>
                <ElButton
                  :type="viewMode === 'comparison' ? 'primary' : ''"
                  @click="viewMode = 'comparison'"
                  class="toggle-btn"
                >
                  模态对比
                </ElButton>
              </div>
            </div>
          </DvBorderBox12>
        </div>

        <!-- 主图表区域 -->
        <div class="chart-area">
          <DvBorderBox13>
            <div class="chart-container">
              <div class="chart-title">
                {{ getChartTitle() }}
              </div>

              <!-- 模态对比视图 -->
              <div v-if="viewMode === 'comparison'" class="comparison-view">
                <div ref="comparisonChart1" class="comparison-chart"></div>
                <div ref="comparisonChart2" class="comparison-chart"></div>
              </div>

              <!-- 单一光谱视图 -->
              <div v-else ref="chartRef" class="chart"></div>
            </div>
          </DvBorderBox13>
        </div>

        <!-- 时间序列控制 -->
        <div class="timeline-control">
          <DvBorderBox12>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">时间序列动态监控</span>
                <div class="timeline-buttons">
                  <ElButton
                    :type="isPlaying ? '' : 'primary'"
                    @click="togglePlayback"
                    class="timeline-btn"
                    size="small"
                  >
                    {{ isPlaying ? '⏸ 暂停' : '▶ 播放' }}
                  </ElButton>
                  <ElButton
                    @click="resetTimeline"
                    class="timeline-btn"
                    size="small"
                  >
                    ⟲ 重置
                  </ElButton>
                  <span class="time-display">时间: {{ currentTime.toFixed(1) }}s / {{ totalTime }}s</span>
                </div>
              </div>
              <div class="timeline-slider">
                <ElSlider
                  v-model="currentTime"
                  :max="totalTime"
                  :step="0.1"
                  :show-tooltip="true"
                  @change="handleTimeChange"
                  class="glow-slider"
                />
              </div>
            </div>
          </DvBorderBox12>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <DvBorderBox12>
          <div class="panel-content">
            <!-- AI 识别结果 -->
            <div class="panel-title">
              <span class="title-icon">🤖</span>
              <span>AI 智能识别</span>
            </div>

            <div class="result-section">
              <div class="result-title">识别物质</div>
              <div class="substance-name">{{ recognitionResult.substance }}</div>

              <div class="match-score">
                <div class="score-label">匹配度</div>
                <div class="score-value">{{ recognitionResult.matchScore }}%</div>
                <ElProgress
                  :percentage="recognitionResult.matchScore"
                  :color="getProgressColor(recognitionResult.matchScore)"
                  :stroke-width="12"
                  class="glow-progress"
                />
              </div>
            </div>

            <!-- 空间-光谱协同视图 -->
            <div class="spatial-spectral-section">
              <div class="section-title">空间-光谱协同</div>
              <div class="imaging-container">
                <!-- 2D化学成像 -->
                <div ref="imagingRef" class="chemical-imaging" @click="handleImagingClick"></div>

                <!-- 多通道融合显示 -->
                <div class="channel-fusion">
                  <div class="channel-item" v-for="(channel, index) in channels" :key="index">
                    <div class="channel-color" :style="{ background: channel.color }"></div>
                    <span class="channel-name">{{ channel.name }}</span>
                    <span class="channel-value">{{ channel.intensity }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 设备参数 -->
            <div class="params-section">
              <div class="params-title">设备参数</div>
              <div class="param-item">
                <span class="param-label">激光强度</span>
                <span class="param-value">{{ deviceParams.laserPower }} mW</span>
              </div>
              <div class="param-item">
                <span class="param-label">扫描时间</span>
                <span class="param-value">{{ deviceParams.scanTime }} s</span>
              </div>
              <div class="param-item">
                <span class="param-label">设备温度</span>
                <span class="param-value">{{ deviceParams.temperature }} °C</span>
              </div>
              <div class="param-item">
                <span class="param-label">波长范围</span>
                <span class="param-value">{{ modalSettings.wavelength }} nm</span>
              </div>
              <div class="param-item">
                <span class="param-label">偏振状态</span>
                <span class="param-value">{{ getPolarizationLabel() }}</span>
              </div>
            </div>

            <!-- 仪表盘 -->
            <div class="gauge-container">
              <div ref="gaugeRef" class="gauge"></div>
            </div>
          </div>
        </DvBorderBox12>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const route = useRoute()

// 样本树数据
const sampleTreeData = ref([
  {
    id: '1',
    label: '常用方案',
    type: 'folder',
    children: [
      { id: '1-1', label: '标准汽油样本', type: 'file' },
      { id: '1-2', label: '柴油混合物', type: 'file' },
      { id: '1-3', label: '航空煤油', type: 'file' }
    ]
  },
  {
    id: '2',
    label: '常减压装置',
    type: 'folder',
    children: [
      { id: '2-1', label: '一蒸馏直馏汽油', type: 'file' },
      { id: '2-2', label: '常压重油', type: 'file' },
      { id: '2-3', label: '减压蜡油', type: 'file' }
    ]
  },
  {
    id: '3',
    label: '二催化装置',
    type: 'folder',
    children: [
      { id: '3-1', label: '催化汽油', type: 'file' },
      { id: '3-2', label: '催化柴油', type: 'file' },
      { id: '3-3', label: '催化油浆', type: 'file' }
    ]
  }
])

// 算法配置
const algorithmConfig = ref({
  backgroundSubtraction: true,
  baselineCorrection: true,
  smoothing: false,
  peakDetection: true
})

// 模态设置
const modalSettings = ref({
  wavelength: 785,
  polarization: 'vertical',
  scanMode: 'point'
})

// 视图模式
const viewMode = ref<'original' | 'processed' | 'comparison'>('processed')

// 时间序列
const currentTime = ref(0)
const totalTime = ref(60)
const isPlaying = ref(false)
let timelineTimer: number | null = null

// 识别结果
const recognitionResult = ref({
  substance: '一蒸馏直馏汽油',
  matchScore: 94.7
})

// 设备参数
const deviceParams = ref({
  laserPower: 50,
  scanTime: 10,
  temperature: 25.3
})

// 多通道数据
const channels = ref([
  { name: 'C-H伸缩', color: '#ff6b00', intensity: 85 },
  { name: 'C=C伸缩', color: '#00f6ff', intensity: 72 },
  { name: 'C-C伸缩', color: '#00ff88', intensity: 68 },
  { name: '芳香环', color: '#ff00ff', intensity: 45 }
])

// 图表引用
const chartRef = ref<HTMLElement>()
const comparisonChart1 = ref<HTMLElement>()
const comparisonChart2 = ref<HTMLElement>()
const gaugeRef = ref<HTMLElement>()
const imagingRef = ref<HTMLElement>()

let chartInstance: ECharts | null = null
let comparison1Instance: ECharts | null = null
let comparison2Instance: ECharts | null = null
let gaugeInstance: ECharts | null = null
let imagingInstance: ECharts | null = null

// 选中的空间位置
const selectedPosition = ref({ x: 0, y: 0 })

// 生成拉曼光谱数据
const generateSpectrumData = (timeOffset = 0, wavelength = 785) => {
  const data: [number, number][] = []
  const wavelengthFactor = wavelength / 785

  for (let i = 400; i <= 3200; i += 10) {
    let intensity = Math.random() * 50 + timeOffset * 2

    // 特征峰随波长变化
    if (i >= 1000 && i <= 1100) {
      intensity += (300 + timeOffset * 5) * Math.exp(-Math.pow((i - 1050 * wavelengthFactor) / 20, 2))
    }
    if (i >= 1400 && i <= 1500) {
      intensity += (400 + timeOffset * 8) * Math.exp(-Math.pow((i - 1450 * wavelengthFactor) / 25, 2))
    }
    if (i >= 2800 && i <= 2950) {
      intensity += (500 + timeOffset * 10) * Math.exp(-Math.pow((i - 2900 * wavelengthFactor) / 30, 2))
    }

    data.push([i, Math.max(0, intensity)])
  }
  return data
}

// 获取图表标题
const getChartTitle = () => {
  if (viewMode.value === 'comparison') {
    return '多模态对比分析'
  }
  return viewMode.value === 'original' ? '原始拉曼光谱' : '预处理拉曼光谱'
}

// 获取偏振标签
const getPolarizationLabel = () => {
  const labels: Record<string, string> = {
    vertical: '垂直偏振',
    horizontal: '水平偏振',
    circular: '圆偏振',
    none: '非偏振'
  }
  return labels[modalSettings.value.polarization] || '未知'
}

// 初始化主图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '8%',
      right: '5%',
      top: '15%',
      bottom: '12%'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 21, 41, 0.95)',
      borderColor: '#00f6ff',
      borderWidth: 2,
      textStyle: {
        color: '#00f6ff',
        fontSize: 14
      },
      formatter: (params: any) => {
        const point = params[0]
        return `
          <div style="padding: 10px;">
            <div style="color: #00ff88; font-weight: bold; margin-bottom: 8px; font-size: 16px;">
              波数: ${point.data[0]} cm⁻¹
            </div>
            <div style="color: #00f6ff; font-size: 14px;">
              强度: ${point.data[1].toFixed(2)}
            </div>
            <div style="color: rgba(0,246,255,0.7); font-size: 12px; margin-top: 5px;">
              时间: ${currentTime.value.toFixed(1)}s
            </div>
          </div>
        `
      }
    },
    xAxis: {
      type: 'value',
      name: '波数 (cm⁻¹)',
      nameTextStyle: {
        color: '#00f6ff',
        fontSize: 16,
        fontWeight: 'bold',
        padding: [8, 0, 0, 0]
      },
      axisLine: {
        lineStyle: { color: '#00f6ff', width: 2 }
      },
      axisLabel: {
        color: '#00f6ff',
        fontSize: 13,
        fontWeight: 'bold'
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 246, 255, 0.15)', width: 1 }
      }
    },
    yAxis: {
      type: 'value',
      name: '强度',
      nameTextStyle: {
        color: '#00f6ff',
        fontSize: 16,
        fontWeight: 'bold'
      },
      axisLine: {
        lineStyle: { color: '#00f6ff', width: 2 }
      },
      axisLabel: {
        color: '#00f6ff',
        fontSize: 13,
        fontWeight: 'bold'
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 246, 255, 0.15)', width: 1 }
      }
    },
    series: [
      {
        type: 'line',
        data: generateSpectrumData(currentTime.value, modalSettings.value.wavelength),
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        smooth: true,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00f6ff' },
            { offset: 0.5, color: '#00ff88' },
            { offset: 1, color: '#00f6ff' }
          ]),
          shadowColor: '#00f6ff',
          shadowBlur: 15
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 246, 255, 0.4)' },
            { offset: 1, color: 'rgba(0, 246, 255, 0.05)' }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

// 初始化对比图表
const initComparisonCharts = () => {
  if (!comparisonChart1.value || !comparisonChart2.value) return

  // 第一个对比图 - 不同波长
  comparison1Instance = echarts.init(comparisonChart1.value)
  const option1 = {
    backgroundColor: 'transparent',
    title: {
      text: `${modalSettings.value.wavelength}nm vs 532nm 波长对比`,
      left: 'center',
      top: '3%',
      textStyle: {
        color: '#00f6ff',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    grid: { left: '10%', right: '5%', top: '18%', bottom: '15%' },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 21, 41, 0.95)',
      borderColor: '#00f6ff',
      borderWidth: 2
    },
    legend: {
      data: [`${modalSettings.value.wavelength}nm`, '532nm'],
      top: '8%',
      textStyle: { color: '#00f6ff', fontSize: 12 }
    },
    xAxis: {
      type: 'value',
      name: '波数 (cm⁻¹)',
      nameTextStyle: { color: '#00f6ff', fontSize: 13 },
      axisLine: { lineStyle: { color: '#00f6ff' } },
      axisLabel: { color: '#00f6ff', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(0, 246, 255, 0.1)' } }
    },
    yAxis: {
      type: 'value',
      name: '强度',
      nameTextStyle: { color: '#00f6ff', fontSize: 13 },
      axisLine: { lineStyle: { color: '#00f6ff' } },
      axisLabel: { color: '#00f6ff', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(0, 246, 255, 0.1)' } }
    },
    series: [
      {
        name: `${modalSettings.value.wavelength}nm`,
        type: 'line',
        data: generateSpectrumData(currentTime.value, modalSettings.value.wavelength),
        smooth: true,
        lineStyle: { width: 2, color: '#00f6ff' },
        showSymbol: false
      },
      {
        name: '532nm',
        type: 'line',
        data: generateSpectrumData(currentTime.value, 532),
        smooth: true,
        lineStyle: { width: 2, color: '#ff6b00' },
        showSymbol: false
      }
    ]
  }
  comparison1Instance.setOption(option1)

  // 第二个对比图 - 不同偏振
  comparison2Instance = echarts.init(comparisonChart2.value)
  const option2 = {
    backgroundColor: 'transparent',
    title: {
      text: '偏振模式对比',
      left: 'center',
      top: '3%',
      textStyle: {
        color: '#00f6ff',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    grid: { left: '10%', right: '5%', top: '18%', bottom: '15%' },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 21, 41, 0.95)',
      borderColor: '#00f6ff',
      borderWidth: 2
    },
    legend: {
      data: ['垂直偏振', '水平偏振', '圆偏振'],
      top: '8%',
      textStyle: { color: '#00f6ff', fontSize: 12 }
    },
    xAxis: {
      type: 'value',
      name: '波数 (cm⁻¹)',
      nameTextStyle: { color: '#00f6ff', fontSize: 13 },
      axisLine: { lineStyle: { color: '#00f6ff' } },
      axisLabel: { color: '#00f6ff', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(0, 246, 255, 0.1)' } }
    },
    yAxis: {
      type: 'value',
      name: '强度',
      nameTextStyle: { color: '#00f6ff', fontSize: 13 },
      axisLine: { lineStyle: { color: '#00f6ff' } },
      axisLabel: { color: '#00f6ff', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(0, 246, 255, 0.1)' } }
    },
    series: [
      {
        name: '垂直偏振',
        type: 'line',
        data: generateSpectrumData(currentTime.value).map(([x, y]) => [x, y * 1.0]),
        smooth: true,
        lineStyle: { width: 2, color: '#00f6ff' },
        showSymbol: false
      },
      {
        name: '水平偏振',
        type: 'line',
        data: generateSpectrumData(currentTime.value).map(([x, y]) => [x, y * 0.7]),
        smooth: true,
        lineStyle: { width: 2, color: '#00ff88' },
        showSymbol: false
      },
      {
        name: '圆偏振',
        type: 'line',
        data: generateSpectrumData(currentTime.value).map(([x, y]) => [x, y * 0.85]),
        smooth: true,
        lineStyle: { width: 2, color: '#ff00ff' },
        showSymbol: false
      }
    ]
  }
  comparison2Instance.setOption(option2)
}

// 初始化化学成像
const initChemicalImaging = () => {
  if (!imagingRef.value) return

  imagingInstance = echarts.init(imagingRef.value)

  // 生成2D化学成像数据
  const data: [number, number, number][] = []
  for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 50; j++) {
      const value = Math.sin(i / 5) * Math.cos(j / 5) * 50 + 50 + Math.random() * 20
      data.push([i, j, value])
    }
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(0, 21, 41, 0.95)',
      borderColor: '#00f6ff',
      borderWidth: 2,
      textStyle: { color: '#00f6ff', fontSize: 12 },
      formatter: (params: any) => {
        return `
          <div style="padding: 8px;">
            <div style="color: #00ff88; font-weight: bold;">
              位置: (${params.data[0]}, ${params.data[1]})
            </div>
            <div style="color: #00f6ff; margin-top: 5px;">
              强度: ${params.data[2].toFixed(1)}
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '5%',
      right: '15%',
      top: '5%',
      bottom: '5%'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 50 }, (_, i) => i),
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#00f6ff' } },
      axisLabel: { show: false }
    },
    yAxis: {
      type: 'category',
      data: Array.from({ length: 50 }, (_, i) => i),
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#00f6ff' } },
      axisLabel: { show: false }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'vertical',
      right: '0%',
      top: 'center',
      textStyle: { color: '#00f6ff', fontSize: 10 },
      inRange: {
        color: ['#001529', '#00f6ff', '#00ff88', '#ff6b00', '#ff0000']
      }
    },
    series: [
      {
        type: 'heatmap',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: '#00f6ff'
          }
        }
      }
    ]
  }

  imagingInstance.setOption(option)

  // 添加点击事件
  imagingInstance.on('click', (params: any) => {
    selectedPosition.value = { x: params.data[0], y: params.data[1] }
    handleImagingClick()
  })
}

// 初始化仪表盘
const initGauge = () => {
  if (!gaugeRef.value) return

  gaugeInstance = echarts.init(gaugeRef.value)

  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        radius: '85%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff6b00' },
            { offset: 0.5, color: '#00ff88' },
            { offset: 1, color: '#00f6ff' }
          ])
        },
        progress: {
          show: true,
          width: 14
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 14,
            color: [[1, 'rgba(0, 246, 255, 0.2)']]
          }
        },
        axisTick: {
          distance: -18,
          splitNumber: 5,
          lineStyle: {
            width: 2,
            color: '#00f6ff'
          }
        },
        splitLine: {
          distance: -22,
          length: 12,
          lineStyle: {
            width: 3,
            color: '#00f6ff'
          }
        },
        axisLabel: {
          distance: -35,
          color: '#00f6ff',
          fontSize: 11,
          fontWeight: 'bold'
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '5%'],
          fontSize: 32,
          fontWeight: 'bolder',
          formatter: '{value}%',
          color: '#00ff88'
        },
        data: [
          {
            value: recognitionResult.value.matchScore
          }
        ]
      }
    ]
  }

  gaugeInstance.setOption(option)
}

// 处理节点点击
const handleNodeClick = (data: any) => {
  if (data.type === 'file') {
    recognitionResult.value.substance = data.label
    recognitionResult.value.matchScore = Math.floor(Math.random() * 15 + 85)

    updateAllCharts()
    updateGauge()
  }
}

// 处理成像点击
const handleImagingClick = () => {
  // 更新光谱图以反映选中位置的光谱
  if (chartInstance && viewMode.value !== 'comparison') {
    const offset = (selectedPosition.value.x + selectedPosition.value.y) / 10
    chartInstance.setOption({
      series: [{
        data: generateSpectrumData(currentTime.value + offset, modalSettings.value.wavelength)
      }]
    })
  }
}

// 处理算法变化
const handleAlgorithmChange = () => {
  updateAllCharts()
}

// 处理模态变化
const handleModalChange = () => {
  updateAllCharts()
}

// 处理时间变化
const handleTimeChange = () => {
  updateAllCharts()
}

// 播放/暂停时间序列
const togglePlayback = () => {
  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    timelineTimer = window.setInterval(() => {
      currentTime.value += 0.1
      if (currentTime.value >= totalTime.value) {
        currentTime.value = 0
      }
      handleTimeChange()
    }, 100)
  } else {
    if (timelineTimer !== null) {
      clearInterval(timelineTimer)
      timelineTimer = null
    }
  }
}

// 重置时间线
const resetTimeline = () => {
  currentTime.value = 0
  isPlaying.value = false
  if (timelineTimer !== null) {
    clearInterval(timelineTimer)
    timelineTimer = null
  }
  handleTimeChange()
}

// 更新所有图表
const updateAllCharts = () => {
  if (viewMode.value === 'comparison') {
    updateComparisonCharts()
  } else {
    updateMainChart()
  }
}

// 更新主图表
const updateMainChart = () => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [{
        data: generateSpectrumData(currentTime.value, modalSettings.value.wavelength)
      }]
    })
  }
}

// 更新对比图表
const updateComparisonCharts = () => {
  if (comparison1Instance) {
    comparison1Instance.setOption({
      title: {
        text: `${modalSettings.value.wavelength}nm vs 532nm 波长对比`
      },
      legend: {
        data: [`${modalSettings.value.wavelength}nm`, '532nm']
      },
      series: [
        {
          name: `${modalSettings.value.wavelength}nm`,
          data: generateSpectrumData(currentTime.value, modalSettings.value.wavelength)
        },
        {
          name: '532nm',
          data: generateSpectrumData(currentTime.value, 532)
        }
      ]
    })
  }

  if (comparison2Instance) {
    comparison2Instance.setOption({
      series: [
        {
          data: generateSpectrumData(currentTime.value).map(([x, y]) => [x, y * 1.0])
        },
        {
          data: generateSpectrumData(currentTime.value).map(([x, y]) => [x, y * 0.7])
        },
        {
          data: generateSpectrumData(currentTime.value).map(([x, y]) => [x, y * 0.85])
        }
      ]
    })
  }
}

// 更新仪表盘
const updateGauge = () => {
  if (gaugeInstance) {
    gaugeInstance.setOption({
      series: [{
        data: [{ value: recognitionResult.value.matchScore }]
      }]
    })
  }
}

// 进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#00ff88'
  if (percentage >= 70) return '#00f6ff'
  return '#ff6b00'
}

// 监听视图模式变化
watch(viewMode, (newMode) => {
  nextTick(() => {
    if (newMode === 'comparison') {
      initComparisonCharts()
    } else {
      initChart()
    }
  })
})

// 响应式处理
const handleResize = () => {
  chartInstance?.resize()
  comparison1Instance?.resize()
  comparison2Instance?.resize()
  gaugeInstance?.resize()
  imagingInstance?.resize()
}

onMounted(() => {
  nextTick(() => {
    initChart()
    initGauge()
    initChemicalImaging()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (timelineTimer !== null) {
    clearInterval(timelineTimer)
  }
  chartInstance?.dispose()
  comparison1Instance?.dispose()
  comparison2Instance?.dispose()
  gaugeInstance?.dispose()
  imagingInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  background: #001529;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.spectral-analysis-center {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;

  // 左侧面板
  .left-panel {
    width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    .panel-content {
      height: 100%;
      padding: 20px;
      display: flex;
      flex-direction: column;

      .panel-title {
        font-size: 18px;
        font-weight: bold;
        color: #00f6ff;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        text-shadow: 0 0 10px #00f6ff;

        .title-icon {
          font-size: 20px;
          filter: drop-shadow(0 0 5px #00f6ff);
        }
      }

      .tree-container {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 20px;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(0, 246, 255, 0.3);
          border-radius: 3px;

          &:hover {
            background: rgba(0, 246, 255, 0.5);
          }
        }

        &::-webkit-scrollbar-track {
          background: rgba(0, 21, 41, 0.5);
        }
      }

      .modal-switch-section {
        background: rgba(0, 21, 41, 0.6);
        border: 1px solid rgba(0, 246, 255, 0.3);
        border-radius: 8px;
        padding: 15px;
        box-shadow: inset 0 0 20px rgba(0, 246, 255, 0.1);

        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #00f6ff;
          margin-bottom: 15px;
          text-shadow: 0 0 5px rgba(0, 246, 255, 0.5);
        }

        .switch-group {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .switch-item {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .switch-label {
              font-size: 12px;
              color: rgba(0, 246, 255, 0.8);
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          }
        }
      }
    }
  }

  // 树形组件样式
  :deep(.sample-tree) {
    background: transparent;
    color: #00f6ff;

    .el-tree-node__content {
      background: transparent;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background: rgba(0, 246, 255, 0.1);
        box-shadow: 0 0 10px rgba(0, 246, 255, 0.3);
      }
    }

    .el-tree-node.is-current > .el-tree-node__content {
      background: rgba(0, 255, 136, 0.2);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
    }

    .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #00f6ff;

      .node-icon {
        font-size: 10px;

        &.folder {
          color: #ff6b00;
          text-shadow: 0 0 5px #ff6b00;
        }

        &.file {
          color: #00ff88;
          text-shadow: 0 0 5px #00ff88;
        }
      }

      .node-label {
        font-size: 14px;
      }
    }
  }

  // 自定义选择器样式
  :deep(.glow-select) {
    width: 100%;

    .el-input__wrapper {
      background: rgba(0, 21, 41, 0.8);
      border: 1px solid #00f6ff;
      box-shadow: 0 0 10px rgba(0, 246, 255, 0.3);

      &:hover {
        box-shadow: 0 0 15px rgba(0, 246, 255, 0.5);
      }
    }

    .el-input__inner {
      color: #00f6ff;
      font-size: 13px;
    }
  }

  // 中央面板
  .center-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;

    .control-bar {
      height: 100px;
      flex-shrink: 0;

      .control-content {
        height: 100%;
        padding: 15px 25px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .control-group {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;

          .control-item {
            display: flex;
            align-items: center;
            gap: 10px;

            .control-label {
              font-size: 14px;
              color: #00f6ff;
              text-shadow: 0 0 5px rgba(0, 246, 255, 0.5);
            }
          }
        }

        .view-toggle {
          display: flex;
          gap: 10px;

          .toggle-btn {
            background: rgba(0, 21, 41, 0.8);
            border: 1px solid #00f6ff;
            color: #00f6ff;
            font-size: 14px;
            padding: 8px 20px;
            transition: all 0.3s;

            &:hover {
              background: rgba(0, 246, 255, 0.2);
              box-shadow: 0 0 15px rgba(0, 246, 255, 0.5);
              transform: translateY(-2px);
            }

            &.el-button--primary {
              background: linear-gradient(135deg, #00f6ff, #00ff88);
              border-color: #00ff88;
              color: #001529;
              font-weight: bold;
              box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
            }
          }
        }
      }
    }

    .chart-area {
      flex: 1;
      min-height: 0;

      .chart-container {
        height: 100%;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .chart-title {
          font-size: 20px;
          font-weight: bold;
          color: #00f6ff;
          text-align: center;
          margin-bottom: 15px;
          text-shadow: 0 0 15px #00f6ff;
          letter-spacing: 2px;
        }

        .chart {
          flex: 1;
          min-height: 0;
        }

        .comparison-view {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          min-height: 0;

          .comparison-chart {
            width: 100%;
            height: 100%;
            border: 1px solid rgba(0, 246, 255, 0.2);
            border-radius: 8px;
            background: rgba(0, 21, 41, 0.3);
          }
        }
      }
    }

    .timeline-control {
      height: 120px;
      flex-shrink: 0;

      .timeline-content {
        height: 100%;
        padding: 15px 25px;
        display: flex;
        flex-direction: column;
        gap: 15px;

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .timeline-title {
            font-size: 16px;
            font-weight: bold;
            color: #00f6ff;
            text-shadow: 0 0 10px rgba(0, 246, 255, 0.5);
          }

          .timeline-buttons {
            display: flex;
            align-items: center;
            gap: 10px;

            .timeline-btn {
              background: rgba(0, 21, 41, 0.8);
              border: 1px solid #00f6ff;
              color: #00f6ff;
              font-size: 13px;
              padding: 6px 15px;
              transition: all 0.3s;

              &:hover {
                background: rgba(0, 246, 255, 0.2);
                box-shadow: 0 0 15px rgba(0, 246, 255, 0.5);
              }

              &.el-button--primary {
                background: linear-gradient(135deg, #00f6ff, #00ff88);
                border-color: #00ff88;
                color: #001529;
                font-weight: bold;
                box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
              }
            }

            .time-display {
              color: #00ff88;
              font-size: 14px;
              font-weight: bold;
              text-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
              margin-left: 10px;
            }
          }
        }

        .timeline-slider {
          flex: 1;
        }
      }
    }
  }

  // 发光开关样式
  :deep(.glow-switch) {
    .el-switch__core {
      background: rgba(255, 107, 0, 0.3);
      border: 1px solid #ff6b00;
      box-shadow: 0 0 10px rgba(255, 107, 0, 0.3);
    }

    &.is-checked .el-switch__core {
      background: linear-gradient(135deg, #00f6ff, #00ff88);
      border-color: #00ff88;
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
    }

    .el-switch__action {
      background: #fff;
      box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
    }
  }

  // 发光滑块样式
  :deep(.glow-slider) {
    .el-slider__runway {
      background: rgba(0, 246, 255, 0.2);
      border: 1px solid rgba(0, 246, 255, 0.3);
      height: 8px;
    }

    .el-slider__bar {
      background: linear-gradient(90deg, #00f6ff, #00ff88);
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    .el-slider__button {
      background: #00ff88;
      border: 2px solid #00f6ff;
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.8);
    }
  }

  // 右侧面板
  .right-panel {
    width: 320px;
    flex-shrink: 0;

    .panel-content {
      height: 100%;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 246, 255, 0.3);
        border-radius: 3px;
      }

      .panel-title {
        font-size: 18px;
        font-weight: bold;
        color: #00f6ff;
        display: flex;
        align-items: center;
        gap: 10px;
        text-shadow: 0 0 10px #00f6ff;

        .title-icon {
          font-size: 20px;
          filter: drop-shadow(0 0 5px #00ff88);
        }
      }

      .result-section {
        background: rgba(0, 21, 41, 0.6);
        border: 1px solid rgba(0, 246, 255, 0.3);
        border-radius: 8px;
        padding: 20px;
        box-shadow: inset 0 0 20px rgba(0, 246, 255, 0.1);

        .result-title {
          font-size: 12px;
          color: rgba(0, 246, 255, 0.7);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .substance-name {
          font-size: 22px;
          font-weight: bold;
          color: #00ff88;
          margin-bottom: 20px;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        .match-score {
          .score-label {
            font-size: 12px;
            color: rgba(0, 246, 255, 0.7);
            margin-bottom: 8px;
          }

          .score-value {
            font-size: 32px;
            font-weight: bold;
            color: #00ff88;
            margin-bottom: 15px;
            text-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
          }
        }
      }

      .spatial-spectral-section {
        background: rgba(0, 21, 41, 0.6);
        border: 1px solid rgba(0, 246, 255, 0.3);
        border-radius: 8px;
        padding: 15px;

        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #00f6ff;
          margin-bottom: 15px;
          text-shadow: 0 0 5px rgba(0, 246, 255, 0.5);
        }

        .imaging-container {
          .chemical-imaging {
            height: 250px;
            margin-bottom: 15px;
            border: 1px solid rgba(0, 246, 255, 0.2);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: rgba(0, 246, 255, 0.5);
              box-shadow: 0 0 15px rgba(0, 246, 255, 0.3);
            }
          }

          .channel-fusion {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .channel-item {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 8px;
              background: rgba(0, 21, 41, 0.5);
              border-radius: 6px;
              border: 1px solid rgba(0, 246, 255, 0.2);
              transition: all 0.3s;

              &:hover {
                border-color: rgba(0, 246, 255, 0.5);
                box-shadow: 0 0 10px rgba(0, 246, 255, 0.3);
              }

              .channel-color {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                box-shadow: 0 0 8px currentColor;
              }

              .channel-name {
                flex: 1;
                font-size: 13px;
                color: #00f6ff;
              }

              .channel-value {
                font-size: 13px;
                font-weight: bold;
                color: #00ff88;
              }
            }
          }
        }
      }

      .params-section {
        background: rgba(0, 21, 41, 0.6);
        border: 1px solid rgba(0, 246, 255, 0.3);
        border-radius: 8px;
        padding: 20px;

        .params-title {
          font-size: 14px;
          font-weight: bold;
          color: #00f6ff;
          margin-bottom: 15px;
          text-shadow: 0 0 5px rgba(0, 246, 255, 0.5);
        }

        .param-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 246, 255, 0.1);

          &:last-child {
            border-bottom: none;
          }

          .param-label {
            font-size: 13px;
            color: rgba(0, 246, 255, 0.8);
          }

          .param-value {
            font-size: 14px;
            font-weight: bold;
            color: #00ff88;
            text-shadow: 0 0 5px rgba(0, 255, 136, 0.3);
          }
        }
      }

      .gauge-container {
        height: 220px;

        .gauge {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  // 进度条样式
  :deep(.glow-progress) {
    .el-progress-bar__outer {
      background: rgba(0, 246, 255, 0.2);
      border: 1px solid rgba(0, 246, 255, 0.3);
      border-radius: 6px;
    }

    .el-progress-bar__inner {
      border-radius: 6px;
      box-shadow: 0 0 10px currentColor;
      transition: all 0.6s ease;
    }

    .el-progress__text {
      color: #00f6ff;
      font-weight: bold;
      text-shadow: 0 0 5px rgba(0, 246, 255, 0.5);
    }
  }
}
</style>