<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧面板 - 模型配置中心 -->
      <div class="left-panel">
        <dv-border-box-12>
          <div class="panel-content">
            <div class="panel-title">
              <span class="title-text">模型配置中心</span>
              <span class="title-icon">⚙️</span>
            </div>

            <el-tabs v-model="activeTab" class="model-tabs">
              <!-- 经典机器学习 Tab -->
              <el-tab-pane label="经典机器学习" name="ml">
                <div class="config-section">
                  <div class="config-item">
                    <label class="config-label">算法选择</label>
                    <el-select v-model="mlConfig.algorithm" placeholder="选择算法">
                      <el-option label="支持向量机 (SVM)" value="svm" />
                      <el-option label="随机森林 (RF)" value="rf" />
                      <el-option label="XGBoost" value="xgboost" />
                      <el-option label="K-means 聚类" value="kmeans" />
                    </el-select>
                  </div>

                  <div class="config-item" v-if="mlConfig.algorithm === 'svm'">
                    <label class="config-label">核函数</label>
                    <el-select v-model="mlConfig.kernel">
                      <el-option label="RBF (径向基)" value="rbf" />
                      <el-option label="Linear (线性)" value="linear" />
                      <el-option label="Poly (多项式)" value="poly" />
                    </el-select>
                  </div>

                  <div class="config-item" v-if="mlConfig.algorithm === 'rf' || mlConfig.algorithm === 'xgboost'">
                    <label class="config-label">树数量</label>
                    <el-input-number
                      v-model="mlConfig.trees"
                      :min="10"
                      :max="500"
                      :step="10"
                    />
                  </div>

                  <div class="config-item" v-if="mlConfig.algorithm === 'kmeans'">
                    <label class="config-label">聚类数 K</label>
                    <el-input-number
                      v-model="mlConfig.clusters"
                      :min="2"
                      :max="10"
                    />
                  </div>

                  <div class="config-item">
                    <label class="config-label">训练集比例 {{ mlConfig.trainRatio }}%</label>
                    <el-slider
                      v-model="mlConfig.trainRatio"
                      :min="50"
                      :max="90"
                    />
                  </div>
                </div>
              </el-tab-pane>

              <!-- 深度学习 Tab -->
              <el-tab-pane label="深度学习" name="dl">
                <div class="config-section">
                  <div class="config-item">
                    <label class="config-label">预训练模型</label>
                    <el-select v-model="dlConfig.model" placeholder="选择模型">
                      <el-option label="ResNet-50" value="resnet50" />
                      <el-option label="ResNet-101" value="resnet101" />
                      <el-option label="Transformer" value="transformer" />
                      <el-option label="Vision Transformer (ViT)" value="vit" />
                      <el-option label="EfficientNet" value="efficientnet" />
                    </el-select>
                  </div>

                  <div class="config-item">
                    <label class="config-label">迁移学习</label>
                    <el-switch
                      v-model="dlConfig.transferLearning"
                      active-text="冻结骨干网络"
                      inactive-text="全局微调"
                    />
                  </div>

                  <div class="config-item">
                    <label class="config-label">训练轮数 (Epoch)</label>
                    <el-input-number
                      v-model="dlConfig.epochs"
                      :min="1"
                      :max="200"
                    />
                  </div>

                  <div class="config-item">
                    <label class="config-label">批次大小 (Batch Size)</label>
                    <el-select v-model="dlConfig.batchSize">
                      <el-option label="16" :value="16" />
                      <el-option label="32" :value="32" />
                      <el-option label="64" :value="64" />
                      <el-option label="128" :value="128" />
                    </el-select>
                  </div>

                  <div class="config-item">
                    <label class="config-label">学习率</label>
                    <el-input-number
                      v-model="dlConfig.learningRate"
                      :min="0.0001"
                      :max="0.1"
                      :step="0.0001"
                      :precision="4"
                    />
                  </div>

                  <div class="config-item">
                    <label class="config-label">优化器</label>
                    <el-select v-model="dlConfig.optimizer">
                      <el-option label="Adam" value="adam" />
                      <el-option label="SGD" value="sgd" />
                      <el-option label="AdamW" value="adamw" />
                    </el-select>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>

            <!-- 训练按钮 -->
            <div class="train-button-wrapper">
              <button
                class="train-button"
                :class="{ 'training': isTraining }"
                @click="startTraining"
              >
                <span v-if="!isTraining">🚀 开始训练</span>
                <span v-else>⏸️ 训练中...</span>
              </button>
            </div>
          </div>
        </dv-border-box-12>
      </div>

      <!-- 中间面板 - 降维可视化与训练监控 -->
      <div class="center-panel">
        <!-- 降维可视化 -->
        <div class="visualization-section">
          <dv-border-box-13>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">降维可视化</span>
                <div class="dimension-tabs">
                  <span
                    v-for="method in dimMethods"
                    :key="method"
                    :class="['dim-tab', { active: currentDimMethod === method }]"
                    @click="changeDimMethod(method)"
                  >
                    {{ method }}
                  </span>
                </div>
              </div>
              <div ref="scatterChartRef" class="chart-container"></div>
            </div>
          </dv-border-box-13>
        </div>

        <!-- 训练监控 -->
        <div class="monitoring-section">
          <dv-border-box-13>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">实时训练监控</span>
                <span class="status-indicator" :class="{ active: isTraining }">
                  {{ isTraining ? '● 训练中' : '○ 待机' }}
                </span>
              </div>
              <div ref="trainingChartRef" class="chart-container"></div>
            </div>
          </dv-border-box-13>
        </div>
      </div>

      <!-- 右侧面板 - 评估与资源 -->
      <div class="right-panel">
        <!-- 模型性能雷达图 -->
        <div class="performance-section">
          <dv-border-box-12>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">模型性能评估</span>
              </div>
              <div ref="radarChartRef" class="chart-container-small"></div>
            </div>
          </dv-border-box-12>
        </div>

        <!-- 训练日志 -->
        <div class="log-section">
          <dv-border-box-12>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">训练日志</span>
              </div>
              <div class="log-container">
                <div
                  v-for="(log, index) in trainingLogs"
                  :key="index"
                  class="log-item"
                >
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </dv-border-box-12>
        </div>

        <!-- 资源监控 -->
        <div class="resource-section">
          <dv-border-box-12>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">资源监控</span>
              </div>
              <div class="resource-container">
                <div class="resource-item">
                  <div class="resource-label">GPU 占用率</div>
                  <el-progress
                    :percentage="resourceUsage.gpu"
                    :color="getProgressColor(resourceUsage.gpu)"
                    :stroke-width="12"
                  />
                  <div class="resource-value">{{ resourceUsage.gpu }}%</div>
                </div>
                <div class="resource-item">
                  <div class="resource-label">显存占用</div>
                  <el-progress
                    :percentage="resourceUsage.memory"
                    :color="getProgressColor(resourceUsage.memory)"
                    :stroke-width="12"
                  />
                  <div class="resource-value">{{ resourceUsage.memory }}%</div>
                </div>
              </div>
            </div>
          </dv-border-box-12>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { BorderBox12 as DvBorderBox12, BorderBox13 as DvBorderBox13 } from '@kjgl77/datav-vue3'
import echarts from 'echarts'
import NavBar from '@/components/NavBar.vue'

export default defineComponent({
  name: 'ModelLab',
  components: {
    DvBorderBox12,
    DvBorderBox13,
    NavBar
  },
  setup() {
    // 配置数据
    const activeTab = ref('ml')
    const currentDimMethod = ref('PCA')
    const dimMethods = ['PCA', 't-SNE', 'UMAP']
    const isTraining = ref(false)

    // 机器学习配置
    const mlConfig = ref({
      algorithm: 'svm',
      kernel: 'rbf',
      trees: 100,
      clusters: 3,
      trainRatio: 80
    })

    // 深度学习配置
    const dlConfig = ref({
      model: 'resnet50',
      transferLearning: true,
      epochs: 50,
      batchSize: 32,
      learningRate: 0.001,
      optimizer: 'adam'
    })

    // 训练日志
    const trainingLogs = ref([
      { time: '14:32:01', message: '模型初始化完成...' },
      { time: '14:32:05', message: '数据预处理中...' },
      { time: '14:32:10', message: '开始训练 Epoch 1/50' }
    ])

    // 资源使用
    const resourceUsage = ref({
      gpu: 45,
      memory: 62
    })

    // 图表引用
    const scatterChartRef = ref<HTMLElement | null>(null)
    const trainingChartRef = ref<HTMLElement | null>(null)
    const radarChartRef = ref<HTMLElement | null>(null)

    let scatterChart: any = null
    let trainingChart: any = null
    let radarChart: any = null
    let trainingInterval: any = null
    let resourceInterval: any = null

    // 生成模拟散点数据
    const generateScatterData = () => {
      const data: any[] = []
      const categories = ['类别 A', '类别 B', '类别 C']

      categories.forEach((category, index) => {
        const categoryData: number[][] = []
        const centerX = (index - 1) * 30
        const centerY = (index - 1) * 30

        for (let i = 0; i < 100; i++) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * 20 + 10
          const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 10
          const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 10
          categoryData.push([Number(x.toFixed(2)), Number(y.toFixed(2))])
        }

        data.push({
          name: category,
          data: categoryData
        })
      })

      return data
    }

    // 初始化散点图
    const initScatterChart = () => {
      if (!scatterChartRef.value) return

      scatterChart = echarts.init(scatterChartRef.value)
      const scatterData = generateScatterData()

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
        legend: {
          data: ['类别 A', '类别 B', '类别 C'],
          top: 10,
          right: 20,
          textStyle: {
            color: '#00e5ff',
            fontSize: 12
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '15%',
          bottom: '10%'
        },
        xAxis: {
          type: 'value',
          name: '主成分 1',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 12
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '主成分 2',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 12
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '类别 A',
            type: 'scatter',
            data: scatterData[0].data,
            symbolSize: 8,
            itemStyle: {
              color: '#00e5ff',
              shadowBlur: 10,
              shadowColor: '#00e5ff'
            }
          },
          {
            name: '类别 B',
            type: 'scatter',
            data: scatterData[1].data,
            symbolSize: 8,
            itemStyle: {
              color: '#00ff7f',
              shadowBlur: 10,
              shadowColor: '#00ff7f'
            }
          },
          {
            name: '类别 C',
            type: 'scatter',
            data: scatterData[2].data,
            symbolSize: 8,
            itemStyle: {
              color: '#ff6b00',
              shadowBlur: 10,
              shadowColor: '#ff6b00'
            }
          }
        ]
      }

      scatterChart.setOption(option)
    }

    // 初始化训练监控图表
    const initTrainingChart = () => {
      if (!trainingChartRef.value) return

      trainingChart = echarts.init(trainingChartRef.value)

      const epochs = Array.from({ length: 50 }, (_, i) => i + 1)
      const lossData = epochs.map(x => Number((1 / (x * 0.3 + 1) + Math.random() * 0.05).toFixed(4)))
      const accData = epochs.map(x => Number((1 - 1 / (x * 0.2 + 1) + Math.random() * 0.02).toFixed(4)))

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
        legend: {
          data: ['Loss', 'Accuracy'],
          top: 10,
          right: 20,
          textStyle: {
            color: '#00e5ff',
            fontSize: 12
          }
        },
        grid: {
          left: '12%',
          right: '8%',
          top: '20%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: epochs,
          name: 'Epoch',
          nameTextStyle: {
            color: '#00e5ff'
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff',
            interval: 9
          }
        },
        yAxis: {
          type: 'value',
          name: 'Value',
          nameTextStyle: {
            color: '#00e5ff'
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: 'Loss',
            type: 'line',
            data: lossData,
            smooth: true,
            lineStyle: {
              color: '#ff6b00',
              width: 2
            },
            itemStyle: {
              color: '#ff6b00'
            }
          },
          {
            name: 'Accuracy',
            type: 'line',
            data: accData,
            smooth: true,
            lineStyle: {
              color: '#00ff7f',
              width: 2
            },
            itemStyle: {
              color: '#00ff7f'
            }
          }
        ]
      }

      trainingChart.setOption(option)
    }

    // 初始化雷达图
    const initRadarChart = () => {
      if (!radarChartRef.value) return

      radarChart = echarts.init(radarChartRef.value)

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
        radar: {
          indicator: [
            { name: '准确率', max: 100 },
            { name: '召回率', max: 100 },
            { name: 'F1 分数', max: 100 },
            { name: '训练速度', max: 100 },
            { name: '推理速度', max: 100 }
          ],
          radius: '65%',
          splitNumber: 4,
          name: {
            textStyle: {
              color: '#00e5ff',
              fontSize: 12
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.3)'
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.3)'
            }
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(0, 229, 255, 0.05)', 'rgba(0, 229, 255, 0.1)']
            }
          }
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: [92, 88, 90, 75, 85],
                name: '当前模型',
                areaStyle: {
                  color: 'rgba(0, 229, 255, 0.3)'
                },
                lineStyle: {
                  color: '#00e5ff',
                  width: 2
                },
                itemStyle: {
                  color: '#00e5ff'
                }
              }
            ]
          }
        ]
      }

      radarChart.setOption(option)
    }

    // 切换降维方法
    const changeDimMethod = (method: string) => {
      currentDimMethod.value = method
    }

    // 开始训练
    const startTraining = () => {
      isTraining.value = !isTraining.value

      if (isTraining.value) {
        let epoch = 1
        trainingInterval = setInterval(() => {
          const time = new Date().toLocaleTimeString()
          const loss = (Math.random() * 0.1).toFixed(4)
          const acc = (0.85 + Math.random() * 0.1).toFixed(4)

          trainingLogs.value.unshift({
            time,
            message: `Epoch ${epoch}/50 - loss: ${loss}, accuracy: ${acc}`
          })

          if (trainingLogs.value.length > 8) {
            trainingLogs.value.pop()
          }

          epoch++
          if (epoch > 50) epoch = 1
        }, 2000)

        resourceInterval = setInterval(() => {
          resourceUsage.value.gpu = Math.min(95, Math.floor(60 + Math.random() * 20))
          resourceUsage.value.memory = Math.min(95, Math.floor(70 + Math.random() * 15))
        }, 3000)
      } else {
        if (trainingInterval) clearInterval(trainingInterval)
        if (resourceInterval) clearInterval(resourceInterval)
        resourceUsage.value.gpu = 45
        resourceUsage.value.memory = 62
      }
    }

    // 进度条颜色
    const getProgressColor = (percentage: number): string => {
      if (percentage < 60) return '#00ff7f'
      if (percentage < 80) return '#00e5ff'
      return '#ff6b00'
    }

    // 窗口resize处理
    const handleResize = () => {
      scatterChart?.resize()
      trainingChart?.resize()
      radarChart?.resize()
    }

    onMounted(() => {
      nextTick(() => {
        initScatterChart()
        initTrainingChart()
        initRadarChart()
        window.addEventListener('resize', handleResize)
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      scatterChart?.dispose()
      trainingChart?.dispose()
      radarChart?.dispose()
      if (trainingInterval) clearInterval(trainingInterval)
      if (resourceInterval) clearInterval(resourceInterval)
    })

    return {
      activeTab,
      currentDimMethod,
      dimMethods,
      isTraining,
      mlConfig,
      dlConfig,
      trainingLogs,
      resourceUsage,
      scatterChartRef,
      trainingChartRef,
      radarChartRef,
      changeDimMethod,
      startTraining,
      getProgressColor
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
  background: linear-gradient(135deg, #001529 0%, #002140 50%, #001529 100%);
  position: relative;

  // 添加科技感背景网格
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

// ========== 主内容区 ==========
.main-content {
  flex: 1;
  display: flex;
  gap: 15px;
  padding: 15px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  min-height: 0; // 关键:确保 Flex 子元素能正确计算高度
}

// ========== 左侧面板 ==========
.left-panel {
  flex: 0 0 25%;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .panel-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .panel-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid rgba(0, 229, 255, 0.3);
    flex-shrink: 0;

    .title-text {
      font-size: 18px;
      font-weight: bold;
      color: #00e5ff;
      text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
      letter-spacing: 2px;
    }

    .title-icon {
      font-size: 22px;
      filter: drop-shadow(0 0 5px #00e5ff);
    }
  }

  .config-section {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    min-height: 0;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 229, 255, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #00e5ff;
      border-radius: 3px;
      box-shadow: 0 0 5px #00e5ff;
    }
  }

  .config-item {
    margin-bottom: 20px;

    .config-label {
      display: block;
      margin-bottom: 10px;
      font-size: 13px;
      color: #00e5ff;
      text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
      font-weight: 500;
      letter-spacing: 1px;
    }
  }

  .train-button-wrapper {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 2px solid rgba(0, 229, 255, 0.2);
    flex-shrink: 0;
  }

  .train-button {
    width: 100%;
    height: 50px;
    background: linear-gradient(135deg, #00e5ff 0%, #00a8cc 100%);
    border: none;
    border-radius: 8px;
    color: #001529;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      0 0 20px rgba(0, 229, 255, 0.5),
      0 5px 15px rgba(0, 229, 255, 0.3),
      inset 0 0 10px rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transform: rotate(45deg);
      transition: all 0.5s;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 0 30px rgba(0, 229, 255, 0.8),
        0 8px 20px rgba(0, 229, 255, 0.4),
        inset 0 0 15px rgba(255, 255, 255, 0.3);

      &::before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(0);
    }

    &.training {
      background: linear-gradient(135deg, #ff6b00 0%, #cc5500 100%);
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(255, 107, 0, 0.5),
      0 5px 15px rgba(255, 107, 0, 0.3);
  }
  50% {
    box-shadow:
      0 0 30px rgba(255, 107, 0, 0.8),
      0 5px 20px rgba(255, 107, 0, 0.5);
  }
}

// ========== 中间面板 ==========
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;
  min-height: 0;

  .visualization-section {
    flex: 1 1 60%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .monitoring-section {
    flex: 1 1 40%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .panel-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .panel-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(0, 229, 255, 0.3);
    flex-shrink: 0;

    .title-text {
      font-size: 18px;
      font-weight: bold;
      color: #00e5ff;
      text-shadow: 0 0 10px #00e5ff;
      letter-spacing: 2px;
    }

    .dimension-tabs {
      display: flex;
      gap: 10px;

      .dim-tab {
        padding: 5px 15px;
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 4px;
        color: #00e5ff;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgba(0, 229, 255, 0.2);
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
        }

        &.active {
          background: #00e5ff;
          color: #001529;
          font-weight: bold;
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);
        }
      }
    }

    .status-indicator {
      font-size: 14px;
      color: #666;
      transition: all 0.3s;

      &.active {
        color: #00ff7f;
        text-shadow: 0 0 10px #00ff7f;
        animation: blink 2s infinite;
      }
    }
  }

  .chart-container {
    flex: 1;
    width: 100%;
    min-height: 0;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// ========== 右侧面板 ==========
.right-panel {
  flex: 0 0 25%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 300px;
  min-height: 0;

  .performance-section {
    flex: 1 1 35%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .log-section {
    flex: 1 1 35%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .resource-section {
    flex: 1 1 30%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .panel-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .panel-title {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(0, 229, 255, 0.3);
    flex-shrink: 0;

    .title-text {
      font-size: 16px;
      font-weight: bold;
      color: #00e5ff;
      text-shadow: 0 0 10px #00e5ff;
      letter-spacing: 1px;
    }
  }

  .chart-container-small {
    flex: 1;
    width: 100%;
    min-height: 0;
  }

  .log-container {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    min-height: 0;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 229, 255, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #00e5ff;
      border-radius: 3px;
      box-shadow: 0 0 5px #00e5ff;
    }

    .log-item {
      padding: 8px 12px;
      margin-bottom: 8px;
      background: rgba(0, 229, 255, 0.05);
      border-left: 3px solid #00e5ff;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.6;
      transition: all 0.3s;

      &:hover {
        background: rgba(0, 229, 255, 0.1);
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
      }

      .log-time {
        color: #00ff7f;
        margin-right: 10px;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(0, 255, 127, 0.5);
      }

      .log-message {
        color: #00e5ff;
      }
    }
  }

  .resource-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: center;

    .resource-item {
      .resource-label {
        font-size: 13px;
        color: #00e5ff;
        margin-bottom: 10px;
        text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
        font-weight: 500;
      }

      .resource-value {
        text-align: right;
        margin-top: 8px;
        font-size: 15px;
        font-weight: bold;
        color: #00ff7f;
        text-shadow: 0 0 10px rgba(0, 255, 127, 0.5);
      }
    }
  }
}

// ========== Element Plus 组件样式覆盖 ==========
:deep(.el-tabs) {
  .el-tabs__header {
    margin-bottom: 15px;
  }

  .el-tabs__nav-wrap {
    &::after {
      background-color: rgba(0, 229, 255, 0.2);
    }
  }

  .el-tabs__item {
    color: #00e5ff;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s;

    &:hover {
      color: #00ff7f;
    }

    &.is-active {
      color: #00ff7f;
      text-shadow: 0 0 10px #00ff7f;
    }
  }

  .el-tabs__active-bar {
    background-color: #00ff7f;
    box-shadow: 0 0 10px #00ff7f;
    height: 3px;
  }

  .el-tabs__content {
    color: #00e5ff;
  }

  .el-tab-pane {
    color: #00e5ff;
  }
}

:deep(.el-select) {
  width: 100%;

  .el-input__wrapper {
    background-color: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.3);
    box-shadow: none;
    transition: all 0.3s;

    &:hover {
      border-color: #00e5ff;
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }

    &.is-focus {
      border-color: #00ff7f;
      box-shadow: 0 0 15px rgba(0, 255, 127, 0.4);
    }

    .el-input__inner {
      color: #00e5ff;

      &::placeholder {
        color: rgba(0, 229, 255, 0.4);
      }
    }

    .el-input__suffix {
      .el-icon {
        color: #00e5ff;
      }
    }
  }
}

:deep(.el-input-number) {
  width: 100%;

  .el-input-number__decrease,
  .el-input-number__increase {
    background-color: rgba(0, 229, 255, 0.1);
    border-color: rgba(0, 229, 255, 0.3);
    color: #00e5ff;

    &:hover {
      background-color: rgba(0, 229, 255, 0.2);
      color: #00ff7f;
    }
  }

  .el-input__wrapper {
    background-color: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.3);
    box-shadow: none;

    .el-input__inner {
      color: #00e5ff;
      text-align: center;
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
      background-color: #00ff7f;
      border-color: #00ff7f;

      .el-switch__action {
        background-color: #fff;
      }
    }
  }

  .el-switch__label {
    color: #00e5ff;
    font-size: 12px;

    &.is-active {
      color: #00ff7f;
    }
  }
}

:deep(.el-slider) {
  .el-slider__runway {
    background-color: rgba(0, 229, 255, 0.2);
    height: 6px;
  }

  .el-slider__bar {
    background: linear-gradient(90deg, #00e5ff 0%, #00ff7f 100%);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  }

  .el-slider__button-wrapper {
    .el-slider__button {
      background-color: #00ff7f;
      border: 2px solid #001529;
      box-shadow:
        0 0 15px rgba(0, 255, 127, 0.8),
        0 0 5px rgba(0, 255, 127, 0.5);
      width: 16px;
      height: 16px;
    }
  }
}

:deep(.el-progress) {
  .el-progress-bar__outer {
    background-color: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 6px;
    overflow: hidden;
  }

  .el-progress-bar__inner {
    border-radius: 6px;
    transition: all 0.4s ease;
  }

  .el-progress__text {
    color: #00e5ff;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
    font-size: 13px;
  }
}

// ========== 响应式设计 ==========
@media screen and (max-width: 1600px) {
  .left-panel,
  .right-panel {
    min-width: 280px;
  }
}

@media screen and (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    overflow-y: auto;
  }

  .left-panel,
  .right-panel,
  .center-panel {
    flex: 0 0 auto;
    width: 100%;
    min-width: auto;
    height: auto;
    min-height: 500px;
  }

  .center-panel {
    .visualization-section,
    .monitoring-section {
      min-height: 400px;
    }
  }
}
</style>