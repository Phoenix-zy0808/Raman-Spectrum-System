<template>
  <div class="page-container">
    <NavBar />

    <div class="spectral-analysis-center">
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
          </div>
        </DvBorderBox13>
      </div>

      <div class="center-panel">
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
              </div>
            </div>
          </DvBorderBox12>
        </div>

        <div class="chart-area">
          <DvBorderBox13>
            <div class="chart-container">
              <div class="chart-title">拉曼光谱解析图</div>
              <div ref="chartRef" class="chart"></div>
            </div>
          </DvBorderBox13>
        </div>
      </div>

      <div class="right-panel">
        <DvBorderBox12>
          <div class="panel-content">
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
                <span class="param-value">{{ deviceParams.wavelength }} nm</span>
              </div>
            </div>

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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const router = useRouter() // 2. 获取路由实例
const route = useRoute()
// 1. 获取当前路由路径（用于判断哪个按钮该高亮）
const currentRoute = computed(() => route.path)
// 2. 定义8个页面的目录配置
const menuList = [
  { name: '综合监控', path: '/dashboard' },
  { name: '数据管理', path: '/DataManagement' }, // 还没做，暂时会跳到 analysis 或报错
  { name: '光谱解析', path: '/analysis' },
  { name: '定量实验', path: '/quantitative' },
  { name: 'AI 模型', path: '/model-lab' },
  { name: '量子视图', path: '/quantum' },
  { name: '报告生成', path: '/report' },
  { name: '系统监控', path: '/system' }
]
// 3. 定义跳转函数
const gotoPage = (path: string) => {
  router.push(path)
}
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

// 视图模式
const viewMode = ref<'original' | 'processed'>('processed')

// 识别结果
const recognitionResult = ref({
  substance: '一蒸馏直馏汽油',
  matchScore: 94.7
})

// 设备参数
const deviceParams = ref({
  laserPower: 50,
  scanTime: 10,
  temperature: 25.3,
  wavelength: 785
})

// 图表引用
const chartRef = ref<HTMLElement>()
const gaugeRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null
let gaugeInstance: ECharts | null = null

// 生成拉曼光谱数据
const generateSpectrumData = () => {
  const data: [number, number][] = []
  for (let i = 400; i <= 3200; i += 10) {
    let intensity = Math.random() * 100
    // 添加特征峰
    if (i >= 1000 && i <= 1100) intensity += 300 * Math.exp(-Math.pow((i - 1050) / 20, 2))
    if (i >= 1400 && i <= 1500) intensity += 400 * Math.exp(-Math.pow((i - 1450) / 25, 2))
    if (i >= 2800 && i <= 2950) intensity += 500 * Math.exp(-Math.pow((i - 2900) / 30, 2))
    data.push([i, intensity])
  }
  return data
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
      backgroundColor: 'rgba(0, 21, 41, 0.9)',
      borderColor: '#00f6ff',
      borderWidth: 1,
      textStyle: {
        color: '#00f6ff',
        fontSize: 14
      },
      formatter: (params: any) => {
        const point = params[0]
        return `
          <div style="padding: 8px;">
            <div style="color: #00ff88; font-weight: bold; margin-bottom: 5px;">
              波数: ${point.data[0]} cm⁻¹
            </div>
            <div style="color: #00f6ff;">
              强度: ${point.data[1].toFixed(2)}
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
        fontSize: 14,
        padding: [5, 0, 0, 0]
      },
      axisLine: {
        lineStyle: { color: '#00f6ff', width: 2 }
      },
      axisLabel: {
        color: '#00f6ff',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 246, 255, 0.1)' }
      }
    },
    yAxis: {
      type: 'value',
      name: '强度',
      nameTextStyle: {
        color: '#00f6ff',
        fontSize: 14
      },
      axisLine: {
        lineStyle: { color: '#00f6ff', width: 2 }
      },
      axisLabel: {
        color: '#00f6ff',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 246, 255, 0.1)' }
      }
    },
    series: [
      {
        type: 'line',
        data: generateSpectrumData(),
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: false,
        smooth: true,
        lineStyle: {
          width: 2,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00f6ff' },
            { offset: 0.5, color: '#00ff88' },
            { offset: 1, color: '#00f6ff' }
          ]),
          shadowColor: '#00f6ff',
          shadowBlur: 10
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 246, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 246, 255, 0.05)' }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)
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
        radius: '80%',
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
          width: 12
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [[1, 'rgba(0, 246, 255, 0.2)']]
          }
        },
        axisTick: {
          distance: -16,
          splitNumber: 5,
          lineStyle: {
            width: 2,
            color: '#00f6ff'
          }
        },
        splitLine: {
          distance: -20,
          length: 10,
          lineStyle: {
            width: 3,
            color: '#00f6ff'
          }
        },
        axisLabel: {
          distance: -32,
          color: '#00f6ff',
          fontSize: 10
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
          offsetCenter: [0, '0%'],
          fontSize: 28,
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

    // 更新图表
    if (chartInstance) {
      chartInstance.setOption({
        series: [{ data: generateSpectrumData() }]
      })
    }

    // 更新仪表盘
    if (gaugeInstance) {
      gaugeInstance.setOption({
        series: [{ data: [{ value: recognitionResult.value.matchScore }] }]
      })
    }
  }
}

// 处理算法变化
const handleAlgorithmChange = () => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [{ data: generateSpectrumData() }]
    })
  }
}

// 进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#00ff88'
  if (percentage >= 70) return '#00f6ff'
  return '#ff6b00'
}

// 响应式处理
const handleResize = () => {
  chartInstance?.resize()
  gaugeInstance?.resize()
}

onMounted(() => {
  nextTick(() => {
    initChart()
    initGauge()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  gaugeInstance?.dispose()
})
</script>
<style lang="scss" scoped>
// 页面总容器
.page-container {
  width: 100vw;  /* 强制宽度为视口宽度 */
  height: 100vh; /* 强制高度为视口高度 */
  background: #001529;
  display: flex;
  flex-direction: column;

  /* 核心修改：强制隐藏所有溢出的内容，杀掉滚动条 */
  overflow: hidden;

  /* 确保没有默认边距干扰 */
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

// 顶部导航栏样式
.header-section {
  height: 80px;
  flex-shrink: 0;
  position: relative;
  background: rgba(0, 21, 41, 0.8);
  border-bottom: 1px solid rgba(80, 227, 194, 0.3);

  .header-bg {
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px;
    background-image: url('~@/assets/pageBg.png'); // 如果有背景图的话
    background-size: cover;
  }

  .header-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    .title-text {
      font-size: 32px;
      font-weight: bold;
      color: #b3efff;
      text-shadow: 0 0 10px rgba(0, 246, 255, 0.5);
      letter-spacing: 4px;
      margin-bottom: 5px;
    }

    .dv-dec-6 {
      width: 250px;
      height: 8px;
    }
  }

  .nav-btn-group {
    display: flex;
    gap: 10px;
    flex: 1;
    justify-content: flex-end;

    /* 修改点：隐藏滚动条但保留功能，或者直接 hidden */
    overflow: hidden;
    /* 如果你想在屏幕很窄时也能显示完，建议加上这个自动换行，但通常大屏不需要 */
    /* flex-wrap: wrap; */

    .nav-btn {
      /* 修改点：缩小一点最小宽度，防止挤出滚动条 */
      min-width: 90px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      background: rgba(0, 50, 150, 0.3);
      border: 1px solid #0055ff;
      transform: skewX(-20deg);
      cursor: pointer;
      color: #00baff;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s;
      position: relative;
      padding: 0 10px;

      .text {
        display: inline-block;
        transform: skewX(20deg);
        /* 防止文字换行导致按钮变高 */
        white-space: nowrap;
      }

      /* ... 其他 hover, active 样式保持不变 ... */
      &:hover {
        box-shadow: 0 0 15px #00e5ff inset;
        color: #fff;
      }

      &.active {
        background: rgba(0, 229, 255, 0.3);
        border-color: #00e5ff;
        color: #fff;
        box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
      }
    }
  }
}

// 主体内容区域 (原 spectral-analysis-center)
.spectral-analysis-center {
  flex: 1; // 自动占满剩余高度
  display: flex;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;

  // ... 后面完全保留你原来的样式 ...
  // 左侧面板
  .left-panel {
    width: 280px;
    flex-shrink: 0;

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
        flex: 1;
        min-height: 200px;

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