<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧面板 - 量子资源管理器 -->
      <div class="left-panel">
        <dv-border-box-12>
          <div class="panel-content">
            <div class="panel-title">
              <span class="title-text">量子资源管理器</span>
              <span class="title-icon">⚛️</span>
            </div>

            <!-- 量子比特分配状态 -->
            <div class="section-block">
              <div class="section-header">量子比特分配</div>
              <div ref="qubitAllocationRef" class="qubit-allocation-chart"></div>
            </div>

            <!-- 量子后端连接状态 -->
            <div class="section-block">
              <div class="section-header">量子后端</div>
              <div class="quantum-backend">
                <div class="backend-info">
                  <div class="backend-name">{{ currentBackend.name }}</div>
                  <div class="backend-status" :class="currentBackend.status">
                    <span class="status-dot"></span>
                    {{ currentBackend.status === 'online' ? 'Online' : 'Offline' }}
                  </div>
                </div>
                <div class="backend-specs">
                  <div class="spec-item">
                    <span class="spec-label">量子比特:</span>
                    <span class="spec-value">{{ currentBackend.qubits }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">拓扑:</span>
                    <span class="spec-value">{{ currentBackend.topology }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">可用:</span>
                    <span class="spec-value">{{ currentBackend.available }}/{{ currentBackend.qubits }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 量子任务队列 -->
            <div class="section-block">
              <div class="section-header">量子任务队列</div>
              <div class="task-queue">
                <div
                  v-for="(task, index) in taskQueue"
                  :key="index"
                  class="task-item"
                  :class="task.status"
                >
                  <div class="task-header">
                    <div class="task-name">{{ task.name }}</div>
                    <div class="task-status">{{ task.statusText }}</div>
                  </div>
                  <div class="task-progress" v-if="task.progress !== undefined">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: task.progress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ task.progress }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 协议库 -->
            <div class="section-block">
              <div class="section-header">协议库</div>
              <div class="protocol-list">
                <el-radio-group v-model="selectedProtocol" class="protocol-group">
                  <el-radio
                    v-for="protocol in protocols"
                    :key="protocol.value"
                    :label="protocol.value"
                    class="protocol-radio"
                  >
                    {{ protocol.label }}
                  </el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>
        </dv-border-box-12>
      </div>

      <!-- 中央主区域 - 核心工作台 -->
      <div class="center-panel">
        <!-- 量子线路编辑区 -->
        <div class="circuit-section">
          <dv-border-box-13>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">量子线路设计</span>
                <div class="circuit-controls">
                  <button class="circuit-btn" @click="resetCircuit">
                    <span>🔄 重置</span>
                  </button>
                  <button class="circuit-btn primary" @click="executeCircuit">
                    <span>▶ 执行</span>
                  </button>
                </div>
              </div>

              <!-- 量子线路画布 -->
              <div class="quantum-circuit">
                <div
                  v-for="(qubit, index) in quantumCircuit.qubits"
                  :key="index"
                  class="qubit-line"
                >
                  <div class="qubit-label">|q{{ index }}⟩</div>
                  <div class="circuit-wire"></div>

                  <!-- 量子门 -->
                  <div
                    v-for="(gate, gateIndex) in qubit.gates"
                    :key="gateIndex"
                    class="quantum-gate"
                    :class="gate.type"
                    :style="{ left: gate.position + '%' }"
                  >
                    {{ gate.label }}
                  </div>

                  <!-- 测量符号 -->
                  <div class="measurement-gate" v-if="qubit.measure">
                    <div class="measure-box">M</div>
                  </div>
                </div>

                <!-- CNOT 连接线 -->
                <svg class="cnot-connections" width="100%" height="100%">
                  <line
                    v-for="(cnot, index) in cnotConnections"
                    :key="index"
                    :x1="cnot.x + '%'"
                    :y1="cnot.y1"
                    :x2="cnot.x + '%'"
                    :y2="cnot.y2"
                    stroke="#bf00ff"
                    stroke-width="2"
                  />
                  <circle
                    v-for="(cnot, index) in cnotConnections"
                    :key="'control-' + index"
                    :cx="cnot.x + '%'"
                    :cy="cnot.y1"
                    r="4"
                    fill="#bf00ff"
                  />
                  <circle
                    v-for="(cnot, index) in cnotConnections"
                    :key="'target-' + index"
                    :cx="cnot.x + '%'"
                    :cy="cnot.y2"
                    r="8"
                    fill="none"
                    stroke="#bf00ff"
                    stroke-width="2"
                  />
                </svg>
              </div>
            </div>
          </dv-border-box-13>
        </div>

        <!-- 量子态可视化与对比区域 -->
        <div class="visualization-section">
          <div class="viz-left">
            <dv-border-box-13>
              <div class="panel-content">
                <div class="panel-title">
                  <span class="title-text">量子态布洛赫投影</span>
                </div>
                <div ref="blochSphereRef" class="bloch-sphere-container"></div>
              </div>
            </dv-border-box-13>
          </div>

          <div class="viz-right">
            <dv-border-box-13>
              <div class="panel-content">
                <div class="panel-title">
                  <span class="title-text">量子增强效果对比</span>
                  <div class="legend-box">
                    <span class="legend-item classical">
                      <span class="legend-dot"></span>经典处理
                    </span>
                    <span class="legend-item quantum">
                      <span class="legend-dot"></span>量子增强
                    </span>
                  </div>
                </div>
                <div ref="comparisonChartRef" class="chart-container"></div>
              </div>
            </dv-border-box-13>
          </div>
        </div>
      </div>

      <!-- 右侧面板 - 参数与监控 -->
      <div class="right-panel">
        <!-- 量子实验参数 -->
        <div class="params-section">
          <dv-border-box-12>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">量子实验参数</span>
              </div>

              <div class="param-controls">
                <div class="param-item">
                  <div class="param-label">
                    纠缠度
                    <span class="param-value">{{ quantumParams.entanglement }}%</span>
                  </div>
                  <el-slider
                    v-model="quantumParams.entanglement"
                    :min="0"
                    :max="100"
                  />
                </div>

                <div class="param-item">
                  <div class="param-label">
                    相干时间
                    <span class="param-value">{{ quantumParams.coherenceTime }} μs</span>
                  </div>
                  <el-slider
                    v-model="quantumParams.coherenceTime"
                    :min="10"
                    :max="200"
                  />
                </div>

                <div class="param-item">
                  <div class="param-label">
                    量子神经网络层数
                    <span class="param-value">{{ quantumParams.qnnLayers }}</span>
                  </div>
                  <el-slider
                    v-model="quantumParams.qnnLayers"
                    :min="1"
                    :max="10"
                  />
                </div>

                <div class="param-item">
                  <div class="param-label">
                    测量次数
                    <span class="param-value">{{ quantumParams.shots }}</span>
                  </div>
                  <el-slider
                    v-model="quantumParams.shots"
                    :min="100"
                    :max="10000"
                    :step="100"
                  />
                </div>
              </div>
            </div>
          </dv-border-box-12>
        </div>

        <!-- 量子系统监控 -->
        <div class="monitor-section">
          <dv-border-box-12>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">量子系统监控</span>
              </div>

              <div class="monitor-gauges">
                <div class="gauge-item">
                  <div class="gauge-label">量子比特保真度</div>
                  <div ref="fidelityGaugeRef" class="gauge-chart"></div>
                </div>

                <div class="gauge-item">
                  <div class="gauge-label">纠缠熵</div>
                  <div ref="entropyGaugeRef" class="gauge-chart"></div>
                </div>
              </div>
            </div>
          </dv-border-box-12>
        </div>

        <!-- 误差模型设置 -->
        <div class="error-section">
          <dv-border-box-12>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">误差模型</span>
              </div>

              <div class="error-controls">
                <div class="error-item">
                  <span class="error-label">退相干噪声</span>
                  <el-switch
                    v-model="errorModel.decoherence"
                    active-color="#bf00ff"
                  />
                </div>

                <div class="error-item">
                  <span class="error-label">门错误率</span>
                  <el-switch
                    v-model="errorModel.gateError"
                    active-color="#bf00ff"
                  />
                </div>

                <div class="error-item">
                  <span class="error-label">测量误差</span>
                  <el-switch
                    v-model="errorModel.measurementError"
                    active-color="#bf00ff"
                  />
                </div>
              </div>
            </div>
          </dv-border-box-12>
        </div>
      </div>
    </div>

    <!-- 底部面板 - 量子系统状态 -->
    <div class="bottom-panel">
      <!-- 量子计算状态 -->
      <div class="bottom-section">
        <dv-border-box-12>
          <div class="panel-content">
            <div class="panel-title">
              <span class="title-text">量子计算状态</span>
            </div>

            <div class="compute-status">
              <div class="status-item">
                <div class="status-label">量子处理器</div>
                <div class="status-value online">
                  <span class="status-indicator"></span>
                  运行中
                </div>
              </div>

              <div class="status-item">
                <div class="status-label">当前任务</div>
                <div class="status-value">Shor算法分解</div>
              </div>

              <div class="status-item wide">
                <div class="status-label">任务进度</div>
                <div class="progress-container">
                  <div class="progress-bar-bottom">
                    <div class="progress-fill-bottom" :style="{ width: taskProgress + '%' }"></div>
                  </div>
                  <span class="progress-percentage">{{ taskProgress }}%</span>
                </div>
              </div>

              <div class="status-item">
                <div class="status-label">预计完成</div>
                <div class="status-value">2分37秒</div>
              </div>
            </div>
          </div>
        </dv-border-box-12>
      </div>

      <!-- 量子系统实时监控 -->
      <div class="bottom-section">
        <dv-border-box-12>
          <div class="panel-content">
            <div class="panel-title">
              <span class="title-text">系统实时监控</span>
            </div>

            <div class="realtime-monitor">
              <div class="monitor-item">
                <div class="monitor-label">温度</div>
                <div class="monitor-value">
                  <span class="value-number">15</span>
                  <span class="value-unit">mK</span>
                </div>
              </div>

              <div class="monitor-item">
                <div class="monitor-label">CPU负载</div>
                <div class="monitor-value">
                  <span class="value-number">{{ systemMonitor.cpuLoad }}</span>
                  <span class="value-unit">%</span>
                </div>
              </div>

              <div class="monitor-item">
                <div class="monitor-label">内存使用</div>
                <div class="monitor-value">
                  <span class="value-number">{{ systemMonitor.memoryUsage }}</span>
                  <span class="value-unit">%</span>
                </div>
              </div>

              <div class="monitor-item">
                <div class="monitor-label">网络延迟</div>
                <div class="monitor-value">
                  <span class="value-number">{{ systemMonitor.latency }}</span>
                  <span class="value-unit">ms</span>
                </div>
              </div>
            </div>
          </div>
        </dv-border-box-12>
      </div>

      <!-- 量子安全状态 -->
      <div class="bottom-section">
        <dv-border-box-12>
          <div class="panel-content">
            <div class="panel-title">
              <span class="title-text">量子安全状态</span>
            </div>

            <div class="security-status">
              <div class="security-item">
                <div class="security-icon">🔐</div>
                <div class="security-info">
                  <div class="security-label">量子密钥分发</div>
                  <div class="security-value active">活跃</div>
                </div>
              </div>

              <div class="security-item">
                <div class="security-icon">🛡️</div>
                <div class="security-info">
                  <div class="security-label">加密状态</div>
                  <div class="security-value active">QKD-256</div>
                </div>
              </div>

              <div class="security-item">
                <div class="security-icon">📊</div>
                <div class="security-info">
                  <div class="security-label">密钥生成率</div>
                  <div class="security-value">{{ securityStatus.keyRate }} kbps</div>
                </div>
              </div>

              <div class="security-item">
                <div class="security-icon">✓</div>
                <div class="security-info">
                  <div class="security-label">误码率</div>
                  <div class="security-value">{{ securityStatus.errorRate }}%</div>
                </div>
              </div>
            </div>
          </div>
        </dv-border-box-12>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { BorderBox12 as DvBorderBox12, BorderBox13 as DvBorderBox13 } from '@kjgl77/datav-vue3'
import * as echarts from 'echarts'
import NavBar from '@/components/NavBar.vue'

export default defineComponent({
  name: 'QuantumView',
  components: {
    DvBorderBox12,
    DvBorderBox13,
    NavBar
  },
  setup() {
    // 量子后端信息
    const currentBackend = ref({
      name: 'IBM Q System One',
      status: 'online',
      qubits: 27,
      available: 23,
      topology: '重六角格'
    })

    // 任务队列
    const taskQueue = ref([
      { name: 'Shor算法分解', status: 'running', statusText: '运行中', progress: 67 },
      { name: 'Grover搜索优化', status: 'pending', statusText: '排队中' },
      { name: 'VQE能量计算', status: 'pending', statusText: '排队中' },
      { name: 'QAOA组合优化', status: 'completed', statusText: '已完成', progress: 100 }
    ])

    // 协议库
    const protocols = [
      { label: '标准量子测量协议', value: 'standard' },
      { label: '量子增强算法', value: 'enhanced' },
      { label: '量子纠错协议', value: 'error_correction' }
    ]
    const selectedProtocol = ref('enhanced')

    // 量子线路数据
    const quantumCircuit = ref({
      qubits: [
        {
          gates: [
            { type: 'hadamard', label: 'H', position: 15 },
            { type: 'phase', label: 'S', position: 45 }
          ],
          measure: true
        },
        {
          gates: [
            { type: 'pauli-x', label: 'X', position: 30 }
          ],
          measure: true
        },
        {
          gates: [
            { type: 'rotation', label: 'Ry', position: 60 }
          ],
          measure: true
        }
      ]
    })

    // CNOT 连接
    const cnotConnections = ref([
      { x: 30, y1: 60, y2: 120 },
      { x: 60, y1: 120, y2: 180 }
    ])

    // 量子参数
    const quantumParams = ref({
      entanglement: 85,
      coherenceTime: 120,
      qnnLayers: 5,
      shots: 1000
    })

    // 误差模型
    const errorModel = ref({
      decoherence: true,
      gateError: false,
      measurementError: true
    })

    // 任务进度
    const taskProgress = ref(67)

    // 系统监控数据
    const systemMonitor = ref({
      cpuLoad: 45,
      memoryUsage: 62,
      latency: 12
    })

    // 安全状态
    const securityStatus = ref({
      keyRate: 156,
      errorRate: 0.8 as number
    })

    // 图表引用
    const qubitAllocationRef = ref<HTMLElement | null>(null)
    const comparisonChartRef = ref<HTMLElement | null>(null)
    const blochSphereRef = ref<HTMLElement | null>(null)
    const fidelityGaugeRef = ref<HTMLElement | null>(null)
    const entropyGaugeRef = ref<HTMLElement | null>(null)

    let qubitAllocationChart: any = null
    let comparisonChart: any = null
    let blochSphereChart: any = null
    let fidelityGauge: any = null
    let entropyGauge: any = null

    // 初始化量子比特分配图表
    const initQubitAllocationChart = () => {
      if (!qubitAllocationRef.value) return

      qubitAllocationChart = echarts.init(qubitAllocationRef.value)

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 21, 41, 0.9)',
          borderColor: '#00e5ff',
          borderWidth: 1,
          textStyle: {
            color: '#00e5ff'
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{c}个',
              color: '#00e5ff',
              fontSize: 11
            },
            labelLine: {
              length: 10,
              length2: 10,
              lineStyle: {
                color: '#00e5ff'
              }
            },
            data: [
              {
                value: 23,
                name: '可用',
                itemStyle: {
                  color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 1, y2: 1,
                    colorStops: [
                      { offset: 0, color: '#00ff7f' },
                      { offset: 1, color: '#00e5ff' }
                    ]
                  },
                  shadowBlur: 20,
                  shadowColor: 'rgba(0, 255, 127, 0.5)'
                }
              },
              {
                value: 4,
                name: '占用',
                itemStyle: {
                  color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 1, y2: 1,
                    colorStops: [
                      { offset: 0, color: '#bf00ff' },
                      { offset: 1, color: '#ff00ff' }
                    ]
                  },
                  shadowBlur: 20,
                  shadowColor: 'rgba(191, 0, 255, 0.5)'
                }
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 30,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }

      qubitAllocationChart.setOption(option)
    }

    // 初始化对比图表
    const initComparisonChart = () => {
      if (!comparisonChartRef.value) return

      comparisonChart = echarts.init(comparisonChartRef.value)

      const xData = Array.from({ length: 20 }, (_, i) => `样本${i + 1}`)
      const classicalData = xData.map(() => 0.6 + Math.random() * 0.15)
      const quantumData = xData.map(() => 0.85 + Math.random() * 0.1)

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 21, 41, 0.9)',
          borderColor: '#00e5ff',
          borderWidth: 1,
          textStyle: {
            color: '#00e5ff'
          }
        },
        grid: {
          left: '10%',
          right: '8%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: xData,
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff',
            interval: 4,
            rotate: 30,
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          name: '信噪比 (dB)',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 11
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff',
            fontSize: 10
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '经典处理',
            type: 'line',
            data: classicalData,
            smooth: true,
            lineStyle: {
              color: '#00e5ff',
              width: 2
            },
            itemStyle: {
              color: '#00e5ff'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 229, 255, 0.3)' },
                  { offset: 1, color: 'rgba(0, 229, 255, 0.05)' }
                ]
              }
            }
          },
          {
            name: '量子增强',
            type: 'line',
            data: quantumData,
            smooth: true,
            lineStyle: {
              color: '#bf00ff',
              width: 3
            },
            itemStyle: {
              color: '#bf00ff'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(191, 0, 255, 0.4)' },
                  { offset: 1, color: 'rgba(191, 0, 255, 0.05)' }
                ]
              }
            }
          }
        ]
      }

      comparisonChart.setOption(option)
    }

    // 初始化布洛赫球（2D投影版本）
    const initBlochSphere = () => {
      if (!blochSphereRef.value) return

      blochSphereChart = echarts.init(blochSphereRef.value)

      // 量子态参数
      const theta = Math.PI / 3
      const phi = Math.PI / 4

      // 生成圆形数据
      const circleData = []
      for (let i = 0; i <= 100; i++) {
        const angle = (i / 100) * 2 * Math.PI
        circleData.push([Math.cos(angle), Math.sin(angle)])
      }

      // 量子态在XY平面的投影
      const stateX = Math.sin(theta) * Math.cos(phi)
      const stateY = Math.sin(theta) * Math.sin(phi)

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          show: false
        },
        xAxis: {
          type: 'value',
          min: -1.2,
          max: 1.2,
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          min: -1.2,
          max: 1.2,
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            show: false
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '10%'
        },
        series: [
          // 单位圆
          {
            type: 'line',
            data: circleData,
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.5)',
              width: 2
            },
            symbol: 'none',
            smooth: false
          },
          // X轴
          {
            type: 'line',
            data: [[-1.2, 0], [1.2, 0]],
            lineStyle: {
              color: '#00e5ff',
              width: 1
            },
            symbol: 'none'
          },
          // Y轴
          {
            type: 'line',
            data: [[0, -1.2], [0, 1.2]],
            lineStyle: {
              color: '#00e5ff',
              width: 1
            },
            symbol: 'none'
          },
          // 量子态向量
          {
            type: 'line',
            data: [[0, 0], [stateX, stateY]],
            lineStyle: {
              color: '#bf00ff',
              width: 3
            },
            symbol: 'none'
          },
          // 量子态点
          {
            type: 'scatter',
            data: [[stateX, stateY]],
            symbolSize: 15,
            itemStyle: {
              color: '#00ff7f',
              shadowBlur: 20,
              shadowColor: 'rgba(0, 255, 127, 0.8)'
            },
            label: {
              show: true,
              formatter: '|ψ⟩',
              position: 'top',
              color: '#00ff7f',
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          // 坐标轴标签
          {
            type: 'scatter',
            data: [[1.1, 0], [0, 1.1], [-1.1, 0], [0, -1.1]],
            symbol: 'none',
            label: {
              show: true,
              formatter: function(params: any) {
                const labels = ['|0⟩', '|+⟩', '|1⟩', '|−⟩']
                return labels[params.dataIndex]
              },
              color: '#00e5ff',
              fontSize: 12
            }
          }
        ]
      }

      blochSphereChart.setOption(option)

      // 添加动画效果
      let angle = phi
      setInterval(() => {
        angle += 0.02
        const newStateX = Math.sin(theta) * Math.cos(angle)
        const newStateY = Math.sin(theta) * Math.sin(angle)

        blochSphereChart.setOption({
          series: [
            {}, {}, {},
            {
              data: [[0, 0], [newStateX, newStateY]]
            },
            {
              data: [[newStateX, newStateY]]
            },
            {}
          ]
        })
      }, 50)
    }

    // 初始化保真度仪表盘
    const initFidelityGauge = () => {
      if (!fidelityGaugeRef.value) return

      fidelityGauge = echarts.init(fidelityGaugeRef.value)

      const option = {
        backgroundColor: 'transparent',
        series: [
          {
            type: 'gauge',
            radius: '85%',
            startAngle: 225,
            endAngle: -45,
            axisLine: {
              lineStyle: {
                width: 12,
                color: [
                  [0.6, '#ff6b00'],
                  [0.85, '#00e5ff'],
                  [1, '#bf00ff']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: '#bf00ff'
              },
              width: 4,
              length: '60%'
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
              distance: -12,
              length: 10,
              lineStyle: {
                color: '#00e5ff',
                width: 2
              }
            },
            axisLabel: {
              color: '#00e5ff',
              distance: 18,
              fontSize: 10
            },
            detail: {
              valueAnimation: true,
              formatter: '{value}%',
              color: '#bf00ff',
              fontSize: 16,
              offsetCenter: [0, '70%']
            },
            data: [
              {
                value: 94.7,
                name: ''
              }
            ]
          }
        ]
      }

      fidelityGauge.setOption(option)
    }

    // 初始化纠缠熵仪表盘
    const initEntropyGauge = () => {
      if (!entropyGaugeRef.value) return

      entropyGauge = echarts.init(entropyGaugeRef.value)

      const option = {
        backgroundColor: 'transparent',
        series: [
          {
            type: 'gauge',
            radius: '85%',
            startAngle: 225,
            endAngle: -45,
            min: 0,
            max: 10,
            axisLine: {
              lineStyle: {
                width: 12,
                color: [
                  [0.3, '#00ff7f'],
                  [0.7, '#00e5ff'],
                  [1, '#bf00ff']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: '#bf00ff'
              },
              width: 4,
              length: '60%'
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
              distance: -12,
              length: 10,
              lineStyle: {
                color: '#00e5ff',
                width: 2
              }
            },
            axisLabel: {
              color: '#00e5ff',
              distance: 18,
              fontSize: 10
            },
            detail: {
              valueAnimation: true,
              formatter: '{value}',
              color: '#bf00ff',
              fontSize: 16,
              offsetCenter: [0, '70%']
            },
            data: [
              {
                value: 7.3,
                name: ''
              }
            ]
          }
        ]
      }

      entropyGauge.setOption(option)
    }

    // 重置线路
    const resetCircuit = () => {
      console.log('重置量子线路')
    }

    // 执行线路
    const executeCircuit = () => {
      console.log('执行量子线路')
      // 模拟任务进度增长
      const interval = setInterval(() => {
        if (taskProgress.value < 100) {
          taskProgress.value += 1
        } else {
          clearInterval(interval)
        }
      }, 100)
    }

    // 窗口resize处理
    const handleResize = () => {
      qubitAllocationChart?.resize()
      comparisonChart?.resize()
      blochSphereChart?.resize()
      fidelityGauge?.resize()
      entropyGauge?.resize()
    }

    // 模拟实时数据更新
    const startDataSimulation = () => {
      setInterval(() => {
        systemMonitor.value.cpuLoad = 40 + Math.floor(Math.random() * 20)
        systemMonitor.value.memoryUsage = 55 + Math.floor(Math.random() * 15)
        systemMonitor.value.latency = 10 + Math.floor(Math.random() * 5)
        securityStatus.value.keyRate = 150 + Math.floor(Math.random() * 20)
        securityStatus.value.errorRate = parseFloat((0.5 + Math.random() * 0.5).toFixed(1))
      }, 3000)
    }

    onMounted(() => {
      nextTick(() => {
        initQubitAllocationChart()
        initComparisonChart()
        initBlochSphere()
        initFidelityGauge()
        initEntropyGauge()
        startDataSimulation()
        window.addEventListener('resize', handleResize)
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      qubitAllocationChart?.dispose()
      comparisonChart?.dispose()
      blochSphereChart?.dispose()
      fidelityGauge?.dispose()
      entropyGauge?.dispose()
    })

    return {
      currentBackend,
      taskQueue,
      protocols,
      selectedProtocol,
      quantumCircuit,
      cnotConnections,
      quantumParams,
      errorModel,
      taskProgress,
      systemMonitor,
      securityStatus,
      qubitAllocationRef,
      comparisonChartRef,
      blochSphereRef,
      fidelityGaugeRef,
      entropyGaugeRef,
      resetCircuit,
      executeCircuit
    }
  }
})
</script>

<style lang="scss" scoped>
// ========== 页面容器 ==========
.page-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #001529 0%, #001a35 50%, #001529 100%);
  position: relative;

  // 量子风格背景效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(191, 0, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(0, 229, 255, 0.1) 0%, transparent 50%),
      linear-gradient(rgba(0, 229, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 229, 255, 0.02) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
    pointer-events: none;
    z-index: 0;
    animation: quantumPulse 8s ease-in-out infinite;
  }
}

@keyframes quantumPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

// ========== 主内容区 ==========
.main-content {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px 12px 0 12px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  min-height: 0;
}

// ========== 底部面板 ==========
.bottom-panel {
  flex: 0 0 140px;
  display: flex;
  gap: 12px;
  padding: 0 12px 12px 12px;
  position: relative;
  z-index: 1;

  .bottom-section {
    flex: 1;
    min-width: 0;
  }
}

// ========== 通用面板样式 ==========
.panel-content {
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(191, 0, 255, 0.3);
  flex-shrink: 0;

  .title-text {
    font-size: 16px;
    font-weight: bold;
    color: #bf00ff;
    text-shadow: 0 0 10px #bf00ff, 0 0 20px rgba(191, 0, 255, 0.5);
    letter-spacing: 2px;
  }

  .title-icon {
    font-size: 20px;
    filter: drop-shadow(0 0 8px #bf00ff);
    animation: rotate 10s linear infinite;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// ========== 左侧面板 ==========
.left-panel {
  flex: 0 0 18%;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .section-block {
    margin-bottom: 15px;
    flex-shrink: 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-header {
    font-size: 13px;
    color: #00e5ff;
    margin-bottom: 10px;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
    letter-spacing: 1px;
  }

  // 量子比特分配图表
  .qubit-allocation-chart {
    height: 150px;
    width: 100%;
  }

  // 量子后端样式
  .quantum-backend {
    background: rgba(191, 0, 255, 0.05);
    border: 1px solid rgba(191, 0, 255, 0.3);
    border-radius: 6px;
    padding: 10px;

    .backend-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .backend-name {
        font-size: 14px;
        color: #bf00ff;
        font-weight: bold;
        text-shadow: 0 0 8px rgba(191, 0, 255, 0.5);
      }

      .backend-status {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        color: #00ff7f;

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00ff7f;
          box-shadow: 0 0 10px #00ff7f;
          animation: statusBlink 2s infinite;
        }

        &.offline {
          color: #ff6b00;

          .status-dot {
            background: #ff6b00;
            box-shadow: 0 0 10px #ff6b00;
          }
        }
      }
    }

    .backend-specs {
      .spec-item {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        margin-bottom: 5px;

        &:last-child {
          margin-bottom: 0;
        }

        .spec-label {
          color: #00e5ff;
        }

        .spec-value {
          color: #bf00ff;
          font-weight: bold;
        }
      }
    }
  }

  @keyframes statusBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  // 任务队列样式
  .task-queue {
    max-height: 200px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 229, 255, 0.1);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: #bf00ff;
      border-radius: 2px;
      box-shadow: 0 0 5px #bf00ff;
    }

    .task-item {
      padding: 8px;
      margin-bottom: 8px;
      background: rgba(0, 229, 255, 0.05);
      border-left: 3px solid #00e5ff;
      border-radius: 4px;
      transition: all 0.3s;

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        background: rgba(0, 229, 255, 0.1);
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
      }

      &.running {
        border-left-color: #00ff7f;
        background: rgba(0, 255, 127, 0.05);
        animation: taskRunning 2s infinite;
      }

      &.completed {
        border-left-color: #666;
        opacity: 0.6;
      }

      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;

        .task-name {
          font-size: 12px;
          color: #00e5ff;
        }

        .task-status {
          font-size: 10px;
          color: #bf00ff;
        }
      }

      .task-progress {
        display: flex;
        align-items: center;
        gap: 8px;

        .progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(0, 229, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00e5ff, #bf00ff);
            transition: width 0.3s;
            box-shadow: 0 0 5px rgba(191, 0, 255, 0.5);
          }
        }

        .progress-text {
          font-size: 10px;
          color: #bf00ff;
          min-width: 35px;
          text-align: right;
        }
      }
    }
  }

  @keyframes taskRunning {
    0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 127, 0.3); }
    50% { box-shadow: 0 0 15px rgba(0, 255, 127, 0.6); }
  }

  // 协议库样式
  .protocol-list {
    .protocol-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }
  }
}

// ========== 中央面板 ==========
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;

  .circuit-section {
    flex: 0 0 45%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .visualization-section {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 12px;

    .viz-left,
    .viz-right {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
  }

  .circuit-controls {
    display: flex;
    gap: 8px;

    .circuit-btn {
      padding: 5px 14px;
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 4px;
      color: #00e5ff;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgba(0, 229, 255, 0.2);
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
      }

      &.primary {
        background: rgba(191, 0, 255, 0.2);
        border-color: rgba(191, 0, 255, 0.5);
        color: #bf00ff;

        &:hover {
          background: rgba(191, 0, 255, 0.3);
          box-shadow: 0 0 15px rgba(191, 0, 255, 0.4);
        }
      }
    }
  }

  // 量子线路画布
  .quantum-circuit {
    flex: 1;
    position: relative;
    padding: 15px;
    background: rgba(0, 21, 41, 0.3);
    border-radius: 6px;
    min-height: 0;
    overflow: hidden;

    .qubit-line {
      position: relative;
      height: 55px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;

      &:last-child {
        margin-bottom: 0;
      }

      .qubit-label {
        width: 45px;
        font-size: 13px;
        color: #bf00ff;
        font-weight: bold;
        text-shadow: 0 0 8px rgba(191, 0, 255, 0.5);
        flex-shrink: 0;
      }

      .circuit-wire {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, #00e5ff 0%, #bf00ff 100%);
        box-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
        position: relative;
      }

      .quantum-gate {
        position: absolute;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: bold;
        border-radius: 4px;
        top: 50%;
        transform: translateY(-50%);
        transition: all 0.3s;
        cursor: pointer;

        &.hadamard {
          background: rgba(0, 229, 255, 0.3);
          border: 2px solid #00e5ff;
          color: #00e5ff;
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
        }

        &.pauli-x {
          background: rgba(0, 255, 127, 0.3);
          border: 2px solid #00ff7f;
          color: #00ff7f;
          box-shadow: 0 0 15px rgba(0, 255, 127, 0.5);
        }

        &.phase,
        &.rotation {
          background: rgba(191, 0, 255, 0.3);
          border: 2px solid #bf00ff;
          color: #bf00ff;
          box-shadow: 0 0 15px rgba(191, 0, 255, 0.5);
        }

        &:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 0 25px currentColor;
        }
      }

      .measurement-gate {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);

        .measure-box {
          width: 32px;
          height: 32px;
          background: rgba(255, 107, 0, 0.3);
          border: 2px solid #ff6b00;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff6b00;
          font-size: 13px;
          font-weight: bold;
          box-shadow: 0 0 15px rgba(255, 107, 0, 0.5);
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            transform: scale(1.15);
            box-shadow: 0 0 25px rgba(255, 107, 0, 0.7);
          }
        }
      }
    }

    .cnot-connections {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }
  }

  // 布洛赫球容器
  .bloch-sphere-container {
    flex: 1;
    width: 100%;
    min-height: 0;
  }

  // 图例样式
  .legend-box {
    display: flex;
    gap: 15px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;

      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.classical {
        color: #00e5ff;

        .legend-dot {
          background: #00e5ff;
          box-shadow: 0 0 8px #00e5ff;
        }
      }

      &.quantum {
        color: #bf00ff;

        .legend-dot {
          background: #bf00ff;
          box-shadow: 0 0 8px #bf00ff;
        }
      }
    }
  }

  .chart-container {
    flex: 1;
    width: 100%;
    min-height: 0;
  }
}

// ========== 右侧面板 ==========
.right-panel {
  flex: 0 0 22%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 280px;
  min-height: 0;

  .params-section {
    flex: 1 1 40%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .monitor-section {
    flex: 1 1 35%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .error-section {
    flex: 1 1 25%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  // 参数控制样式
  .param-controls {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
    padding-right: 5px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 229, 255, 0.1);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: #bf00ff;
      border-radius: 2px;
    }

    .param-item {
      flex-shrink: 0;

      .param-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        color: #00e5ff;
        text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);

        .param-value {
          color: #bf00ff;
          font-weight: bold;
          text-shadow: 0 0 8px rgba(191, 0, 255, 0.5);
        }
      }
    }
  }

  // 仪表盘样式
  .monitor-gauges {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .gauge-item {
      flex: 1;
      display: flex;
      flex-direction: column;

      .gauge-label {
        font-size: 12px;
        color: #00e5ff;
        margin-bottom: 6px;
        text-align: center;
        text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
      }

      .gauge-chart {
        flex: 1;
        min-height: 0;
      }
    }
  }

  // 误差控制样式
  .error-controls {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;

    .error-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: rgba(191, 0, 255, 0.05);
      border: 1px solid rgba(191, 0, 255, 0.2);
      border-radius: 6px;
      transition: all 0.3s;

      &:hover {
        background: rgba(191, 0, 255, 0.1);
        box-shadow: 0 0 10px rgba(191, 0, 255, 0.2);
      }

      .error-label {
        font-size: 12px;
        color: #00e5ff;
        text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
      }
    }
  }
}

// ========== 底部面板样式 ==========
.compute-status {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;

  .status-item {
    display: flex;
    flex-direction: column;
    gap: 5px;

    &.wide {
      flex: 1;
      min-width: 200px;
    }

    .status-label {
      font-size: 11px;
      color: #00e5ff;
      opacity: 0.8;
    }

    .status-value {
      font-size: 13px;
      color: #bf00ff;
      font-weight: bold;

      &.online {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #00ff7f;

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff7f;
          box-shadow: 0 0 10px #00ff7f;
          animation: pulse 2s infinite;
        }
      }
    }

    .progress-container {
      display: flex;
      align-items: center;
      gap: 10px;

      .progress-bar-bottom {
        flex: 1;
        height: 8px;
        background: rgba(0, 229, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;

        .progress-fill-bottom {
          height: 100%;
          background: linear-gradient(90deg, #00e5ff, #bf00ff);
          transition: width 0.5s;
          box-shadow: 0 0 10px rgba(191, 0, 255, 0.5);
        }
      }

      .progress-percentage {
        font-size: 12px;
        color: #bf00ff;
        font-weight: bold;
        min-width: 40px;
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 10px #00ff7f; }
  50% { opacity: 0.5; box-shadow: 0 0 20px #00ff7f; }
}

.realtime-monitor {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .monitor-item {
    text-align: center;

    .monitor-label {
      font-size: 11px;
      color: #00e5ff;
      margin-bottom: 5px;
      opacity: 0.8;
    }

    .monitor-value {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 3px;

      .value-number {
        font-size: 18px;
        color: #bf00ff;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(191, 0, 255, 0.5);
      }

      .value-unit {
        font-size: 11px;
        color: #00e5ff;
      }
    }
  }
}

.security-status {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .security-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .security-icon {
      font-size: 24px;
      filter: drop-shadow(0 0 8px rgba(191, 0, 255, 0.5));
    }

    .security-info {
      text-align: center;

      .security-label {
        font-size: 10px;
        color: #00e5ff;
        margin-bottom: 3px;
        opacity: 0.8;
      }

      .security-value {
        font-size: 12px;
        color: #bf00ff;
        font-weight: bold;

        &.active {
          color: #00ff7f;
          text-shadow: 0 0 8px rgba(0, 255, 127, 0.5);
        }
      }
    }
  }
}

// ========== Element Plus 组件样式覆盖 ==========
:deep(.el-radio-group) {
  width: 100%;
}

:deep(.el-radio) {
  width: 100%;
  margin-bottom: 6px;
  padding: 6px 10px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 229, 255, 0.1);
    border-color: rgba(0, 229, 255, 0.4);
  }

  .el-radio__input {
    .el-radio__inner {
      background: rgba(0, 229, 255, 0.1);
      border-color: #00e5ff;

      &::after {
        background: #bf00ff;
      }
    }

    &.is-checked {
      .el-radio__inner {
        background: rgba(191, 0, 255, 0.3);
        border-color: #bf00ff;
        box-shadow: 0 0 10px rgba(191, 0, 255, 0.5);
      }
    }
  }

  .el-radio__label {
    color: #00e5ff;
    font-size: 11px;
  }

  &.is-checked {
    background: rgba(191, 0, 255, 0.15);
    border-color: rgba(191, 0, 255, 0.5);
    box-shadow: 0 0 10px rgba(191, 0, 255, 0.2);

    .el-radio__label {
      color: #bf00ff;
    }
  }
}

:deep(.el-slider) {
  .el-slider__runway {
    background-color: rgba(0, 229, 255, 0.2);
    height: 5px;
  }

  .el-slider__bar {
    background: linear-gradient(90deg, #00e5ff 0%, #bf00ff 100%);
    box-shadow: 0 0 10px rgba(191, 0, 255, 0.5);
  }

  .el-slider__button-wrapper {
    .el-slider__button {
      background-color: #bf00ff;
      border: 2px solid #001529;
      box-shadow:
        0 0 15px rgba(191, 0, 255, 0.8),
        0 0 5px rgba(191, 0, 255, 0.5);
      width: 14px;
      height: 14px;
    }
  }
}

:deep(.el-switch) {
  .el-switch__core {
    background-color: rgba(0, 229, 255, 0.2);
    border: 1px solid rgba(0, 229, 255, 0.3);

    .el-switch__action {
      background-color: #00e5ff;
    }
  }

  &.is-checked {
    .el-switch__core {
      background-color: #bf00ff;
      border-color: #bf00ff;
      box-shadow: 0 0 15px rgba(191, 0, 255, 0.5);

      .el-switch__action {
        background-color: #fff;
      }
    }
  }
}

// ========== 响应式设计 ==========
@media screen and (max-width: 1600px) {
  .left-panel,
  .right-panel {
    min-width: 240px;
  }

  .bottom-panel {
    flex: 0 0 130px;
  }
}

@media screen and (max-width: 1366px) {
  .main-content {
    gap: 10px;
    padding: 10px 10px 0 10px;
  }

  .bottom-panel {
    gap: 10px;
    padding: 0 10px 10px 10px;
    flex: 0 0 120px;
  }

  .left-panel,
  .right-panel {
    flex: 0 0 20%;
  }
}

@media screen and (max-width: 1200px) {
  .page-container {
    overflow-y: auto;
  }

  .main-content {
    flex-direction: column;
    overflow-y: visible;
    min-height: auto;
    height: auto;
  }

  .left-panel,
  .right-panel,
  .center-panel {
    flex: 0 0 auto;
    width: 100%;
    min-width: auto;
    height: auto;
    min-height: 400px;
  }

  .center-panel {
    .circuit-section {
      min-height: 350px;
    }

    .visualization-section {
      flex-direction: column;
      min-height: 600px;

      .viz-left,
      .viz-right {
        min-height: 300px;
      }
    }
  }

  .bottom-panel {
    flex-direction: column;
    flex: 0 0 auto;
    height: auto;

    .bottom-section {
      min-height: 120px;
    }
  }
}
</style>